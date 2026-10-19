"use client";

import { useEffect, useState } from "react";
import { useLogout } from "@/features/auth";
import { useDeleteAccount } from "../api/account.queries";

const CONFIRM_WORD = "DELETE";

/** Confirm → DELETE /users → show the server's outcome → log out (§3.5). */
export function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const remove = useDeleteAccount();
  const logout = useLogout();
  const [typed, setTyped] = useState("");
  const done = remove.data;

  // Escape closes, except once the account is gone (the only way out is logging out).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !done && !remove.isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, remove.isPending, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-level-3">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <i className="fa-solid fa-user-xmark" />
            </div>
            <h2 id="delete-account-title" className="text-lg font-bold text-gray-900">
              {done.scheduled ? "Deletion scheduled" : "Account deleted"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{done.message}.</p>
            {done.scheduled && <p className="mt-2 text-sm text-gray-600">Changed your mind? Log in again before then and choose “Keep my account”.</p>}
            <button type="button" onClick={logout} className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
              Log out
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <i className="fa-solid fa-trash-can" />
            </div>
            <h2 id="delete-account-title" className="text-lg font-bold text-gray-900">
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              You will lose access to your courses, e-books, live sessions and purchase history. This can&apos;t be undone once the deletion completes.
            </p>
            <label htmlFor="confirm-delete" className="mt-5 block text-sm font-medium text-gray-700">
              Type <span className="font-bold text-red-600">{CONFIRM_WORD}</span> to confirm
            </label>
            <input
              id="confirm-delete"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoFocus
              className="mt-1.5 w-full rounded-lg border-gray-200 px-3.5 py-2.5 text-sm focus:border-red-400 focus:ring-red-100"
            />
            {remove.error && <p className="mt-2 text-sm text-red-600">{remove.error.message}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={remove.isPending}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => remove.mutate()}
                disabled={typed.trim().toUpperCase() !== CONFIRM_WORD || remove.isPending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {remove.isPending ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
