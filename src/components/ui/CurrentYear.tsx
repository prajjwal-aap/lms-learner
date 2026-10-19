"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** The current year, rendered only in the browser (a prerendered `new Date()` would freeze at build time). */
export function CurrentYear() {
  return useSyncExternalStore(noop, () => new Date().getFullYear(), () => null);
}
