import type { PreparedPayment } from "../types";

/**
 * Opens the payment screen the server picked for this order (§7.2) and resolves when it closes —
 * success, failure or cancel. The outcome is never read from the provider: the provider notifies our
 * server, and the caller polls GET /og-order/:id for the real status (§7.3).
 */

type Prefill = { name?: string; email?: string; contact?: string };

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const CASHFREE_SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
    Cashfree?: (config: { mode: "sandbox" | "production" }) => { checkout: (options: Record<string, unknown>) => Promise<unknown> };
  }
}

const loading = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  let p = loading.get(src);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loading.delete(src);
        reject(new Error("Couldn't load the payment screen. Check your connection and try again."));
      };
      document.head.appendChild(s);
    });
    loading.set(src, p);
  }
  return p;
}

async function openRazorpay(payment: PreparedPayment, prefill: Prefill) {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) throw new Error("Payments aren't configured (missing Razorpay key). Please contact support.");
  await loadScript(RAZORPAY_SRC);
  if (!window.Razorpay) throw new Error("Couldn't open Razorpay. Please try again.");
  await new Promise<void>((resolve) => {
    const rzp = new window.Razorpay!({
      key,
      order_id: payment.gateway_order_id,
      currency: payment.currency,
      name: "Occult Gurukul",
      prefill,
      retry: { enabled: false },
      theme: { color: "#6930c3" },
      // Amount is not sent: the Razorpay order already carries it.
      handler: () => resolve(),
      modal: { ondismiss: () => resolve(), escape: true },
    });
    rzp.on("payment.failed", () => resolve());
    rzp.open();
  });
}

async function openCashfree(payment: PreparedPayment) {
  if (!payment.payment_session_id) throw new Error("Payment session missing. Please try again.");
  await loadScript(CASHFREE_SRC);
  if (!window.Cashfree) throw new Error("Couldn't open Cashfree. Please try again.");
  const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ? "production" : "sandbox";
  // Resolves when the modal closes, whatever the outcome.
  await window.Cashfree({ mode }).checkout({ paymentSessionId: payment.payment_session_id, redirectTarget: "_modal" }).catch(() => undefined);
}

export async function openPaymentScreen(payment: PreparedPayment, prefill: Prefill) {
  if (payment.gateway === "RAZORPAY") return openRazorpay(payment, prefill);
  if (payment.gateway === "CASHFREE") return openCashfree(payment);
  // FREE: already PAID, no payment screen.
}

const POLL_EVERY_MS = 2500;
const POLL_FOR_MS = 60_000;

export type PaymentOutcome = "success" | "failed" | "pending";

/** Polls the order every 2.5 s for up to 60 s (§7.3). */
export async function waitForPayment(getStatus: () => Promise<string>, signal?: AbortSignal): Promise<PaymentOutcome> {
  const deadline = Date.now() + POLL_FOR_MS;
  while (Date.now() < deadline) {
    if (signal?.aborted) return "pending";
    try {
      const status = await getStatus();
      if (status === "PAID" || status === "FULFILLED") return "success";
      if (status === "FAILED") return "failed";
    } catch {
      // Network blip — keep polling until the deadline.
    }
    await new Promise((r) => setTimeout(r, POLL_EVERY_MS));
  }
  return "pending";
}
