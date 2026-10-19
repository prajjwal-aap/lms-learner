import type { OrderStatus, ProductType } from "../types";

/** "8 Oct 2026" in the learner's timezone. */
export const formatOrderDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** "21 March 1994" from a YYYY-MM-DD date (no timezone shift). */
export const formatBirthDate = (ymd: string) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "+91 98765 43210" */
export function formatPhone(phone?: string, countryCode?: string) {
  if (!phone) return "";
  const local = phone.length === 10 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone;
  return countryCode ? `+${countryCode} ${local}` : local;
}

const STATUS: Record<string, { label: string; tone: string }> = {
  FULFILLED: { label: "Completed", tone: "bg-emerald-50 text-emerald-700" },
  PAID: { label: "Processing", tone: "bg-amber-50 text-amber-700" },
  READY_FOR_PAYMENT: { label: "Payment pending", tone: "bg-amber-50 text-amber-700" },
  FAILED: { label: "Failed", tone: "bg-red-50 text-red-700" },
  REFUNDED: { label: "Refunded", tone: "bg-gray-100 text-gray-700" },
};

export const orderStatus = (s: OrderStatus) => STATUS[s] ?? { label: s.replaceAll("_", " ").toLowerCase(), tone: "bg-gray-100 text-gray-700" };

const PRODUCT_LABEL: Record<string, string> = {
  COURSE: "Course",
  SELF_PLACED: "Course",
  BUNDLE: "Bundle",
  EBOOK: "E-book",
  WEBINAR: "Webinar",
  MASTERCLASS: "Masterclass",
};

export const productLabel = (t: ProductType) => PRODUCT_LABEL[t] ?? t;
