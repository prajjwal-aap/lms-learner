"use client";

import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/config/routes";
import { useLogout } from "@/features/auth";
import { useProfile } from "../api/account.queries";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { ProfileAvatar } from "./ProfileAvatar";

const SECTIONS = [
  { href: ROUTES.account.profile, icon: "fa-user", title: "View profile", text: "See your profile and the community posts you've shared" },
  { href: ROUTES.account.personalInfo, icon: "fa-id-card", title: "Personal information", text: "Update your name, birth details and location" },
  { href: ROUTES.account.purchases, icon: "fa-receipt", title: "Purchase history", text: "View your orders and download purchased e-books" },
  { href: ROUTES.account.contact, icon: "fa-envelope", title: "Phone & email", text: "See your registered phone number and update your email" },
];

/** "My account" hub: greeting with photo, section cards, logout and delete account. */
export function AccountHomeScreen() {
  const { data: profile, isLoading } = useProfile();
  const logout = useLogout();
  const [deleting, setDeleting] = useState(false);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 md:py-10">
      {/* Greeting */}
      <section className="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs sm:max-w-md">
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-gray-900">Hello,</p>
          {isLoading ? (
            <div className="mt-2 h-9 w-40 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="break-words text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">{profile?.name.trim() || "Learner"}</p>
          )}
          {profile && !profile.isProfileComplete && (
            <Link href={ROUTES.account.contact} className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline">
              Add your email to complete your profile
            </Link>
          )}
        </div>
        {profile ? (
          <ProfileAvatar name={profile.name} avatarUrl={profile.avatarUrl} editable />
        ) : (
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-gray-100" />
        )}
      </section>

      {/* Sections */}
      <nav aria-label="Account sections" className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs transition hover:border-brand-200 hover:shadow-level-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <i className={`fa-solid ${s.icon}`} />
            </span>
            <span className="mt-5 flex items-center justify-between gap-2 text-lg font-bold text-gray-900">
              {s.title}
              <i className="fa-solid fa-chevron-right text-sm text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </span>
            <span className="mt-1.5 text-sm leading-relaxed text-gray-500">{s.text}</span>
          </Link>
        ))}
      </nav>

      {/* Logout / delete */}
      <div className="mx-auto mt-12 flex max-w-sm flex-col items-center gap-4">
        <button type="button" onClick={logout} className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100">
          Logout
        </button>
        <button type="button" onClick={() => setDeleting(true)} className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:underline">
          <i className="fa-solid fa-trash-can text-xs" />
          Permanently delete your account
        </button>
      </div>

      {deleting && <DeleteAccountDialog onClose={() => setDeleting(false)} />}
    </main>
  );
}
