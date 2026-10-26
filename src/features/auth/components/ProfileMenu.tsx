"use client";

import { CircleUser, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/config/routes";
import { useCurrentLearner, useLogout } from "../hooks/useAuth";

/** Avatar button in the header: "My account" and "Logout". */
export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const logout = useLogout();
  const { data: learner } = useCurrentLearner();
  const initial = learner?.name.trim().charAt(0).toUpperCase();
  // A photo URL that doesn't load (deleted / private object) falls back to the initial instead of a broken image.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photo = learner?.avatarUrl && learner.avatarUrl !== failedSrc ? learner.avatarUrl : null;

  return (
    <div className="relative">
      <button
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-200 text-gray-500 transition-all hover:ring-2 hover:ring-purple-300"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar host is user-uploaded S3, not in next/image config
          <img alt="" className="h-full w-full object-cover" src={photo} onError={() => setFailedSrc(photo)} />
        ) : initial ? (
          <span className="text-sm font-semibold text-gray-600">{initial}</span>
        ) : (
          <User className="mt-1 size-6 text-gray-400" fill="currentColor" />
        )}
      </button>
      {open && (
        <>
          {/* Click-away layer */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-1 shadow-level-3" role="menu">
            {learner?.name && <p className="truncate border-b border-gray-100 px-3 py-2 text-sm font-semibold text-gray-900">{learner.name}</p>}
            <Link
              href={ROUTES.account.home}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-brand-50"
            >
              <CircleUser className="size-4 shrink-0" />
              My account
            </Link>
            <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              <LogOut className="size-4 shrink-0" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
