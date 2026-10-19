"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/config/routes";
import { useProfile } from "@/features/account";
import { commerceParams, track } from "@/lib/analytics";
import { cn, formatINR } from "@/lib/utils";
import { cartKeys, useCart, useFamilyMembers } from "../api/cart.queries";
import { getOrderStatus, resolveBeneficiary, startOrder, type ResolveInput } from "../api/checkout.api";
import { openPaymentScreen, waitForPayment, type PaymentOutcome } from "../lib/gateway";
import { useCartUi } from "../store";
import type { Beneficiary, CheckoutRequest, Relation } from "../types";

type Step = { name: "review" } | { name: "working"; label: string } | { name: PaymentOutcome };

const RELATIONS: { value: Relation; label: string }[] = [
  { value: "parent", label: "Parent" },
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

const LIVE_TYPES = new Set(["WEBINAR", "MASTERCLASS"]);

/** Checkout modal opened from the cart drawer ("cart" mode) or a product page ("buy" mode). */
export function CheckoutDialog() {
  const request = useCartUi((s) => s.checkout);
  // Keyed so every checkout starts from a clean review step.
  return request ? <CheckoutFlow key={JSON.stringify(request)} request={request} /> : null;
}

function CheckoutFlow({ request }: { request: CheckoutRequest }) {
  const close = useCartUi((s) => s.endCheckout);
  const qc = useQueryClient();
  const { data: cart } = useCart();
  const { data: profile } = useProfile();
  const [step, setStep] = useState<Step>({ name: "review" });
  const [error, setError] = useState<string | null>(null);
  const [forOther, setForOther] = useState(false);
  const [who, setWho] = useState<ResolveInput>({ name: "", phoneNumber: "", relation: "parent" });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const busy = step.name === "working";
  const lines =
    request.mode === "cart"
      ? (cart?.items ?? []).map((i) => ({ id: i.id, title: i.title, amount: i.sp * i.quantity, type: i.productType }))
      : [{ id: request.productId, title: request.title, amount: request.amount, type: request.productType }];
  const total = request.mode === "cart" ? (cart?.payable ?? 0) : request.amount;
  const goesToLive = lines.length > 0 && lines.every((l) => LIVE_TYPES.has(l.type));

  const pay = async () => {
    setError(null);
    abort.current = new AbortController();
    try {
      let beneficiary: Beneficiary = { type: "SELF" };
      if (forOther) {
        setStep({ name: "working", label: "Checking their details…" });
        beneficiary = (await resolveBeneficiary(who)).beneficiary;
      }

      track("begin_checkout", commerceParams(lines.map((l) => ({ item_id: l.id, item_name: l.title, item_category: l.type, price: l.amount, quantity: 1 }))));
      setStep({ name: "working", label: "Creating your order…" });
      const payment = await startOrder(request, beneficiary);
      if (request.mode === "cart") void qc.invalidateQueries({ queryKey: cartKeys.cart });

      if (payment.gateway !== "FREE") {
        setStep({ name: "working", label: "Complete the payment in the secure window…" });
        track("add_payment_info", { payment_type: payment.gateway, currency: "INR", value: payment.amount });
        await openPaymentScreen(payment, { name: profile?.name, email: profile?.email, contact: profile?.phoneNumber });
      }

      setStep({ name: "working", label: "Confirming your payment…" });
      const outcome = await waitForPayment(() => getOrderStatus(payment.order_id), abort.current.signal);
      // New access shows up in My Learning / Live and the order in Purchase history.
      for (const key of [cartKeys.cart, ["account"], ["learning"], ["live"]]) void qc.invalidateQueries({ queryKey: key });
      setStep({ name: outcome });
    } catch (e) {
      setStep({ name: "review" });
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  };

  const canPay = lines.length > 0 && (!forOther || "memberId" in who || (who.name.trim() !== "" && who.phoneNumber.trim() !== ""));

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-level-3 sm:max-w-lg sm:rounded-2xl">
        {step.name === "review" && (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 id="checkout-title" className="text-lg font-bold text-gray-900">
                Checkout
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {lines.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                  <span className="min-w-0 text-gray-800">{l.title}</span>
                  <span className="shrink-0 font-semibold text-gray-900">{formatINR(l.amount)}</span>
                </li>
              ))}
              {lines.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">Your cart is empty.</li>}
            </ul>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-gray-900">Who is this for?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { value: false, label: "Myself", icon: "fa-user" },
                  { value: true, label: "Someone else", icon: "fa-user-group" },
                ].map((o) => (
                  <label
                    key={o.label}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                      forOther === o.value ? "border-brand-600 bg-brand-50 text-brand-800" : "border-gray-200 text-gray-700 hover:border-gray-300",
                    )}
                  >
                    <input type="radio" name="for" className="sr-only" checked={forOther === o.value} onChange={() => setForOther(o.value)} />
                    <i className={cn("fa-solid", o.icon)} />
                    {o.label}
                  </label>
                ))}
              </div>
              {forOther && <SomeoneElse value={who} onChange={setWho} />}
            </fieldset>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-600">Total payable</span>
              <span className="text-xl font-extrabold text-gray-900">{formatINR(total)}</span>
            </div>
            {request.mode === "cart" && cart?.couponCode && (
              <p className="mt-1 text-right text-xs text-gray-500">Coupon {cart.couponCode} will be checked by our team.</p>
            )}

            {error && <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}

            <button
              type="button"
              onClick={pay}
              disabled={!canPay}
              className="mt-5 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="fa-solid fa-lock mr-2 text-xs" />
              Pay {formatINR(total)}
            </button>
            <p className="mt-3 text-center text-[11px] text-gray-400">Payments are processed securely by Razorpay or Cashfree.</p>
          </div>
        )}

        {busy && (
          <div className="flex flex-col items-center px-6 py-12 text-center" aria-live="polite">
            <i className="fa-solid fa-spinner animate-spin text-3xl text-brand-600" />
            <p className="mt-4 text-sm font-semibold text-gray-900">{step.label}</p>
            <p className="mt-1 text-xs text-gray-500">Please don&apos;t close this window.</p>
          </div>
        )}

        {step.name === "success" && (
          <Result
            icon="fa-circle-check"
            tone="text-emerald-600 bg-emerald-50"
            title="Payment successful"
            text={goesToLive ? "You're registered. Your session is in Live Sessions." : "Your purchase is ready. It can take a few seconds to appear in My Learnings."}
          >
            <Link href={goesToLive ? ROUTES.liveSessions : ROUTES.courses} onClick={close} className="w-full rounded-xl bg-brand-600 py-3 text-center text-sm font-bold text-white hover:bg-brand-700">
              {goesToLive ? "Go to Live Sessions" : "Go to My Learnings"}
            </Link>
            <button type="button" onClick={close} className="w-full py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
              Continue browsing
            </button>
          </Result>
        )}

        {step.name === "failed" && (
          <Result icon="fa-circle-xmark" tone="text-red-600 bg-red-50" title="Payment failed" text="No money was taken. You can try again with another payment method.">
            <button type="button" onClick={() => setStep({ name: "review" })} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700">
              Try again
            </button>
            <button type="button" onClick={close} className="w-full py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
              Close
            </button>
          </Result>
        )}

        {step.name === "pending" && (
          <Result
            icon="fa-hourglass-half"
            tone="text-amber-600 bg-amber-50"
            title="Payment is being confirmed"
            text="If you completed the payment, your access will appear shortly. You can check the status in Purchase history."
          >
            <Link href={ROUTES.account.purchases} onClick={close} className="w-full rounded-xl bg-brand-600 py-3 text-center text-sm font-bold text-white hover:bg-brand-700">
              View purchase history
            </Link>
            <button type="button" onClick={close} className="w-full py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
              Close
            </button>
          </Result>
        )}
      </div>
    </div>
  );
}

function Result({ icon, tone, title, text, children }: { icon: string; tone: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className={cn("flex h-14 w-14 items-center justify-center rounded-full text-2xl", tone)}>
        <i className={cn("fa-solid", icon)} />
      </span>
      <h2 id="checkout-title" className="mt-4 text-lg font-bold text-gray-900">
        {title}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-gray-600">{text}</p>
      <div className="mt-6 flex w-full flex-col gap-2">{children}</div>
    </div>
  );
}

const field = "w-full rounded-lg border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-200";

/** Pick a saved person (GET /users/family-members) or enter a new one; resolved at payment time. */
function SomeoneElse({ value, onChange }: { value: ResolveInput; onChange: (v: ResolveInput) => void }) {
  const { data: members, isLoading } = useFamilyMembers(true);
  const isNew = !("memberId" in value);
  const draft = isNew ? value : { name: "", phoneNumber: "", relation: "parent" as Relation };

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-gray-50 p-3">
      {isLoading ? (
        <div className="h-9 animate-pulse rounded-lg bg-gray-200" />
      ) : (
        members &&
        members.length > 0 && (
          <select
            aria-label="Saved people"
            value={isNew ? "" : value.memberId}
            onChange={(e) => onChange(e.target.value ? { memberId: e.target.value } : draft)}
            className={field}
          >
            <option value="">+ Add a new person</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relation})
              </option>
            ))}
          </select>
        )
      )}
      {isNew && (
        <>
          <input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} placeholder="Their full name" aria-label="Their full name" className={field} />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={draft.phoneNumber}
              onChange={(e) => onChange({ ...draft, phoneNumber: e.target.value })}
              placeholder="Their mobile number"
              aria-label="Their mobile number"
              inputMode="tel"
              className={field}
            />
            <select value={draft.relation} onChange={(e) => onChange({ ...draft, relation: e.target.value as Relation })} aria-label="Relation" className={field}>
              {RELATIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500">
            If they have their own Occult Gurukul login, they&apos;ll find the purchase in their account after logging in with this number.
          </p>
        </>
      )}
    </div>
  );
}
