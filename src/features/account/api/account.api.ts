import { isMocked } from "@/config/features";
import { api, isApiError, type NumberedPage } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import type { DeleteAccountResult, Deliverable, Order, OrderPage, Profile, ProfileChanges } from "../types";
import { MOCK_DELIVERABLES, MOCK_ORDERS, MOCK_PROFILE } from "./account.mock";

type ProfileDto = Omit<Profile, "avatarUrl" | "isProfileComplete"> & { avatar: string | null };

// In-memory copy so mock edits survive refetches during the session.
let mockProfile: Profile = { ...MOCK_PROFILE };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** GET /users/profile (§3.2). */
export async function getProfile(): Promise<Profile> {
  if (isMocked("account")) {
    await mockDelay();
    return mockProfile;
  }
  const data = await api.get<{ profileData: ProfileDto; isProfileComplete: boolean }>("/users/profile");
  const { avatar, ...rest } = data.profileData;
  return { ...rest, avatarUrl: avatar, isProfileComplete: data.isProfileComplete };
}

/** POST /users/update-profile (§3.3). Only changed fields; the phone number is never sent. */
export async function updateProfile(changes: ProfileChanges): Promise<void> {
  if (Object.keys(changes).length === 0) return;
  if (changes.name !== undefined && !changes.name.trim()) throw new Error("Name can't be empty");
  if (changes.email !== undefined && !EMAIL_PATTERN.test(changes.email)) throw new Error("Enter a valid email address");

  if (isMocked("account")) {
    await mockDelay(300);
    const { avatar, ...rest } = changes;
    mockProfile = { ...mockProfile, ...rest, ...(avatar !== undefined && { avatarUrl: avatar }) };
    mockProfile.isProfileComplete = !!(mockProfile.name && mockProfile.email);
    return;
  }
  try {
    await api.post("/users/update-profile", changes);
  } catch (e) {
    // 409 EMAIL_ALREADY_EXISTS: the email belongs to a Google/Apple login.
    if (isApiError(e) && e.status === 409) throw new Error("This email is already linked to another account (Google or Apple sign-in).");
    throw e;
  }
}

const PHOTO_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif" };
/** Upload limit we enforce client-side; the presigned URL itself has no documented cap. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Profile photo (§3.4): get a presigned URL, PUT the bytes, then save the asset URL on the profile. */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const ext = PHOTO_TYPES[file.type];
  if (!ext) throw new Error("Use a PNG, JPG or GIF image");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Image must be 5 MB or smaller");

  if (isMocked("account")) {
    await mockDelay(500);
    const url = URL.createObjectURL(file);
    await updateProfile({ avatar: url });
    return url;
  }
  const { url, assetUrl } = await api.post<{ url: string; assetUrl: string }>("/users/get-update-profile-image-url", { fileExtension: ext });
  // The presigned URL is signed for exactly this Content-Type.
  const put = await fetch(url, { method: "PUT", headers: { "Content-Type": "image/*" }, body: file });
  if (!put.ok) throw new Error("Couldn't upload the photo. Please try again.");
  await updateProfile({ avatar: assetUrl });
  return assetUrl;
}

/** DELETE /users (§3.5). The caller logs the learner out afterwards. */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  if (isMocked("account")) {
    await mockDelay(400);
    return { message: "Account scheduled for deletion in 15 days", scheduled: true };
  }
  const { message } = await api.delete<{ message: string }>("/users");
  return { message, scheduled: /scheduled/i.test(message) };
}

/** POST /users/cancel-deletion (§3.6). */
export async function cancelAccountDeletion(): Promise<void> {
  if (isMocked("account")) {
    await mockDelay(300);
    return;
  }
  await api.post("/users/cancel-deletion");
}

/** GET /og-order (§8.1). Newest first; drafts are hidden because they were never checked out. */
export async function listOrders(page = 1, limit = 20): Promise<OrderPage> {
  if (isMocked("account")) {
    await mockDelay();
    return { orders: MOCK_ORDERS, total: MOCK_ORDERS.length, page: 1, limit };
  }
  const data = await api.get<Partial<NumberedPage<Order>> | null>("/og-order", { query: { page, limit } });
  const orders = (Array.isArray(data?.data) ? data.data : []).map(normalizeOrder).filter((o) => o.status !== "DRAFT");
  return { orders, total: data?.total ?? orders.length, page: data?.page ?? page, limit: data?.limit ?? limit };
}

/** Fill in fields the order list / detail may omit, so cards and totals never crash. */
function normalizeOrder(o: Partial<Order>): Order {
  const items = (Array.isArray(o.items) ? o.items : []).map((i) => ({ ...i, title: i.title || "Item", amount: Number(i.amount ?? 0) }));
  return {
    id: String(o.id ?? ""),
    orderNumber: o.orderNumber || String(o.id ?? ""),
    amount: Number(o.amount ?? items.reduce((n, i) => n + i.amount, 0)),
    discountAmount: Number(o.discountAmount ?? 0),
    couponCode: o.couponCode ?? null,
    status: o.status ?? "DRAFT",
    paymentStatus: o.paymentStatus ?? "",
    paymentId: o.paymentId ?? null,
    beneficiaryType: o.beneficiaryType ?? "SELF",
    createdAt: o.createdAt ?? new Date(0).toISOString(),
    items,
  };
}

/** Mock mode only: lets other features' mocks (checkout) add an order to purchase history. */
export function recordMockOrder(order: Order) {
  MOCK_ORDERS.unshift(order);
}

/** GET /og-order/:orderId (§8.2). */
export async function getOrder(orderId: string): Promise<Order> {
  if (isMocked("account")) {
    await mockDelay();
    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    return order;
  }
  return normalizeOrder(await api.get<Partial<Order>>(`/og-order/${encodeURIComponent(orderId)}`));
}

type DeliverableDto = {
  id: string;
  titleSnapshot?: string;
  bundleTitleSnapshot?: string;
  productType: string;
  status: string;
  downloadUrl?: string;
  classDate?: string;
  replayUrl?: string | null;
  workbookUrl?: string | null;
};
type DeliverablesDto = Partial<Record<"courses" | "ebooks" | "webinars" | "masterclasses" | "bundles", DeliverableDto[]>>;

/** GET /og-order/:orderId/product-details (§8.3), flattened into one list. */
export async function getOrderDeliverables(orderId: string): Promise<Deliverable[]> {
  if (isMocked("account")) {
    await mockDelay();
    return MOCK_DELIVERABLES[orderId] ?? [];
  }
  const data = await api.get<DeliverablesDto>(`/og-order/${encodeURIComponent(orderId)}/product-details`);
  return (["courses", "ebooks", "webinars", "masterclasses", "bundles"] as const).flatMap((key) =>
    (data[key] ?? []).map((d) => ({
      id: d.id,
      title: d.titleSnapshot ?? d.bundleTitleSnapshot ?? "Product",
      productType: d.productType,
      status: d.status,
      downloadUrl: d.downloadUrl,
      classDate: d.classDate,
      replayUrl: d.replayUrl,
      workbookUrl: d.workbookUrl,
    })),
  );
}
