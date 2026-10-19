"use client";

import { useSyncExternalStore } from "react";

/** Shared 1s clock. Returns null on the server and during hydration, so countdowns render only after mount. */
let now: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function emit() {
  now = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(emit, 1000);
    queueMicrotask(emit);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
}
