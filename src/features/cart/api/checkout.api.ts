import { isMocked } from "@/config/features";
import { recordMockOrder } from "@/features/account";
import { api, isApiError } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import { friendlyCartError } from "../lib/errors";
import type { Beneficiary, CheckoutRequest, FamilyMember, PreparedPayment, Relation, ResolvedBeneficiary } from "../types";
import { getCart, resetMockCartAfterCheckout } from "./cart.api";

const mocked = () => isMocked("store");

/** Mock orders move READY_FOR_PAYMENT → PAID → FULFILLED as they are polled. */
const mockOrderStatus = new Map<string, string>();

/**
 * POST /app/v1/prepare-order-payment (§7.1): creates the order and the payment in one call. The app URL takes
 * catalog product ids + planId / liveSessionId (the plain /prepare-order-payment is for Strapi website products).
 */
export async function preparePayment(request: CheckoutRequest, beneficiary: Beneficiary): Promise<PreparedPayment> {
  const attribution = { utmSource: "web", pageUrl: window.location.href };
  const body =
    request.mode === "cart"
      ? { beneficiary, ...(request.couponCode && { couponCode: request.couponCode }), ...attribution }
      : {
          productId: request.productId,
          productType: request.productType,
          beneficiary,
          ...(request.planId && { planId: request.planId }),
          ...(request.liveSessionId && { liveSessionId: request.liveSessionId }),
          ...attribution,
        };

  if (mocked()) {
    await mockDelay(600);
    const lines =
      request.mode === "cart"
        ? (await getCart()).items.map((i) => ({ productId: i.productId, title: i.title, amount: i.sp, type: i.productType }))
        : [{ productId: request.productId, title: request.title, amount: request.amount, type: request.productType }];
    if (lines.length === 0) throw new Error("Cart is empty — add a course before checking out.");
    const amount = lines.reduce((n, l) => n + l.amount, 0);
    const orderId = `mock-order-${Date.now()}`;
    mockOrderStatus.set(orderId, "PAID");
    recordMockOrder({
      id: orderId,
      orderNumber: `OG-MOCK-${orderId.slice(-6)}`,
      amount,
      discountAmount: 0,
      couponCode: null,
      status: "FULFILLED",
      paymentStatus: "SUCCESS",
      paymentId: null,
      beneficiaryType: beneficiary.type,
      createdAt: new Date().toISOString(),
      items: lines.map((l, i) => ({ id: `${orderId}-i${i}`, itemType: l.type, productId: l.productId, title: l.title, amount: l.amount, status: "FULFILLED" })),
    });
    if (request.mode === "cart") resetMockCartAfterCheckout();
    // Mock mode skips the payment screen, like a FREE order.
    return {
      order_id: orderId,
      payment_order_id: `PAY_${orderId}`,
      gateway: "FREE",
      gateway_order_id: null,
      payment_session_id: null,
      amount,
      currency: "INR",
      status: "PAID",
      items: lines,
    };
  }
  let payment: PreparedPayment | null;
  try {
    payment = await api.post<PreparedPayment | null>("/app/v1/prepare-order-payment", body);
  } catch (e) {
    throw friendlyCartError(e);
  }
  if (!payment?.order_id) throw new Error("We couldn't start your payment. Please try again.");
  if (payment.gateway === "RAZORPAY" && !payment.gateway_order_id) throw new Error("Payment provider didn't respond. Please try again.");
  if (payment.gateway === "CASHFREE" && !payment.payment_session_id) throw new Error("Payment provider didn't respond. Please try again.");
  return { ...payment, items: Array.isArray(payment.items) ? payment.items : [] };
}

/** GET /og-order/:orderId — just the status, for polling after the payment screen closes (§7.3). */
export async function getOrderStatus(orderId: string): Promise<string> {
  if (mocked()) {
    await mockDelay(300);
    const status = mockOrderStatus.get(orderId) ?? "FULFILLED";
    if (status === "PAID") mockOrderStatus.set(orderId, "FULFILLED");
    return status;
  }
  const order = await api.get<{ status?: string } | null>(`/og-order/${encodeURIComponent(orderId)}`);
  return order?.status ?? "READY_FOR_PAYMENT";
}

/** Recent orders, used after a checkout timeout to check whether the order was created anyway (§7.6). */
async function hasRecentPendingOrder(sinceMs: number): Promise<boolean> {
  if (mocked()) return false;
  const { data } = await api.get<{ data: { status: string; createdAt: string }[] }>("/og-order", { query: { page: 1, limit: 5 } });
  return data.some((o) => o.status === "READY_FOR_PAYMENT" && Date.parse(o.createdAt) >= sinceMs);
}

/**
 * preparePayment + the §7.6 timeout rule: if the call times out or 5xx's, the order may still exist,
 * so check recent orders before letting the learner pay again.
 */
export async function startOrder(request: CheckoutRequest, beneficiary: Beneficiary): Promise<PreparedPayment> {
  const startedAt = Date.now();
  try {
    return await preparePayment(request, beneficiary);
  } catch (e) {
    const serverSide = !isApiError(e) || e.status >= 500;
    if (serverSide && (await hasRecentPendingOrder(startedAt - 5000).catch(() => false))) {
      throw new Error("Your order was created but the payment didn't start. Check Purchase history before trying again.");
    }
    throw e;
  }
}

const MOCK_FAMILY: FamilyMember[] = [
  { id: "fm1", kind: "PROFILE", name: "Aarav Kumar", relation: "child" },
  { id: "fm2", kind: "CONTACT", name: "Sunita Sharma", relation: "parent", phoneNumber: "******3211" },
];

/** GET /users/family-members (§4.2) — saved people, newest first. */
export async function listFamilyMembers(): Promise<FamilyMember[]> {
  if (mocked()) {
    await mockDelay();
    return MOCK_FAMILY;
  }
  const { members } = await api.get<{ members: FamilyMember[] }>("/users/family-members");
  return members;
}

export type ResolveInput = { memberId: string } | { name: string; phoneNumber: string; relation: Relation; email?: string };

/** POST /users/beneficiaries/resolve (§4.1) — turns "who is this for?" into a checkout beneficiary. */
export async function resolveBeneficiary(input: ResolveInput): Promise<ResolvedBeneficiary> {
  if ("name" in input) {
    if (!input.name.trim()) throw new Error("Enter their name");
    if (input.phoneNumber.replace(/\D/g, "").length < 10) throw new Error("Enter a valid 10-digit mobile number");
  }
  if (mocked()) {
    await mockDelay(300);
    const saved = "memberId" in input ? MOCK_FAMILY.find((m) => m.id === input.memberId) : null;
    const name = saved?.name ?? ("name" in input ? input.name : "Guest");
    const type = saved?.kind === "PROFILE" ? "FAMILY_MEMBER" : "REGISTERED_USER";
    return {
      beneficiary: { type, id: saved?.id ?? `mock-user-${Date.now()}` },
      person: { memberId: saved?.id ?? "new", name, relation: saved?.relation ?? ("relation" in input ? input.relation : "other"), maskedPhone: "******3211", isOwnLogin: type === "REGISTERED_USER" },
    };
  }
  return api.post<ResolvedBeneficiary>("/users/beneficiaries/resolve", input);
}
