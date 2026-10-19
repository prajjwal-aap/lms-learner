"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { DeletionSchedule } from "./types";

/**
 * Login reports a pending account deletion only once (§2.2), so the notice is kept for the
 * browser session until the learner keeps the account, dismisses it or logs out.
 */
const KEY = "og-deletion-scheduled";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export const deletionNotice = {
  save(schedule: DeletionSchedule | null) {
    try {
      if (schedule) sessionStorage.setItem(KEY, JSON.stringify(schedule));
      else sessionStorage.removeItem(KEY);
    } catch {
      // Storage blocked — the notice just won't survive a reload.
    }
    emit();
  },
  clear() {
    deletionNotice.save(null);
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The pending deletion from the last login, or null. Always null on the server. */
export function useDeletionNotice(): DeletionSchedule | null {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DeletionSchedule;
    } catch {
      return null;
    }
  }, [raw]);
}
