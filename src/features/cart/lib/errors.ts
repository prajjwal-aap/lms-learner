import { ApiError, isApiError } from "@/lib/api";

/** Learner-facing copy for the app cart / checkout error codes (§6, §7.1). Unknown codes keep the server message. */
const MESSAGES: Record<string, string> = {
  MIXED_CART: "Your cart has items from the website. Remove them (or clear the cart) to add this one.",
  PLAN_NOT_AVAILABLE: "This plan isn't on sale any more. Refresh the page and pick another plan.",
  PLAN_REQUIRED: "Please choose a plan to continue.",
  SESSION_REQUIRED: "Please choose a slot to continue.",
  SESSION_NOT_AVAILABLE: "This slot is no longer available. Please pick another one.",
  ALREADY_REGISTERED: "This person is already registered for this session.",
  SOLD_OUT: "Sorry, this is sold out.",
  CATALOG_UNAVAILABLE: "We can't reach the course catalog right now. Please try again in a minute.",
};

export function friendlyCartError(e: unknown): unknown {
  if (!isApiError(e) || !e.code || !MESSAGES[e.code]) return e;
  return new ApiError(e.status, MESSAGES[e.code], e.code, e.details, e.data);
}
