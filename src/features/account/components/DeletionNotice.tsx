"use client";

import { TriangleAlert } from "lucide-react";
import { deletionNotice, useDeletionNotice } from "@/features/auth";
import { useCancelAccountDeletion } from "../api/account.queries";

/** Shown after logging in to an account that is scheduled for deletion: offer "Keep my account" (§3.6). */
export function DeletionNotice() {
  const schedule = useDeletionNotice();
  const cancel = useCancelAccountDeletion();

  if (!schedule) return null;

  const when = new Date(schedule.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const days = schedule.daysRemaining;

  return (
    <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-red-800">
          <TriangleAlert className="mr-2 inline-block size-3.5 align-[-0.125em]" />
          Your account is scheduled for deletion on <strong>{when}</strong> ({days} {days === 1 ? "day" : "days"} left).
          {cancel.error && <span className="ml-1 font-medium">{cancel.error.message}</span>}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => cancel.mutate(undefined, { onSuccess: deletionNotice.clear })}
            disabled={cancel.isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {cancel.isPending ? "Keeping…" : "Keep my account"}
          </button>
          <button type="button" onClick={deletionNotice.clear} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
