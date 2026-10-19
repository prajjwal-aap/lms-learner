"use client";

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

  return (
    <div className="relative">
      <button
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-200 text-gray-500 transition-all hover:ring-2 hover:ring-purple-300"
      >
        {learner?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar host is user-uploaded S3, not in next/image config
          <img alt="" className="h-full w-full object-cover" src={learner.avatarUrl} />
        ) : initial ? (
          <span className="text-sm font-semibold text-gray-600">{initial}</span>
        ) : (
          <svg className="mt-1 h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" fillRule="evenodd" />
          </svg>
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
              <i className="fa-regular fa-circle-user w-4 text-center" />
              My account
            </Link>
            <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
