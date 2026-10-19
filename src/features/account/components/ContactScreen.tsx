"use client";

import { useState, type FormEvent } from "react";
import { useProfile, useUpdateProfile } from "../api/account.queries";
import { formatPhone } from "../lib/format";
import type { Profile } from "../types";
import { AccountShell, AccountStatus, FormField, accountCard, inputClass, primaryButton } from "./AccountShell";

/** Login phone (read-only, §3.3) and email (editable). */
export function ContactScreen() {
  const { data: profile, isLoading, error } = useProfile();
  return (
    <AccountShell title="Phone & email" subtitle="How we reach you about orders, live sessions and account security.">
      {profile ? <ContactDetails key={profile.id} profile={profile} /> : <AccountStatus loading={isLoading} error={error} />}
    </AccountShell>
  );
}

function ContactDetails({ profile }: { profile: Profile }) {
  const save = useUpdateProfile();
  const [email, setEmail] = useState(profile.email ?? "");
  const [savedEmail, setSavedEmail] = useState(profile.email ?? "");
  const [justSaved, setJustSaved] = useState(false);
  const dirty = email.trim() !== savedEmail && email.trim() !== "";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = email.trim();
    save.mutate(
      { email: next },
      {
        onSuccess: () => {
          setSavedEmail(next);
          setJustSaved(true);
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <section className={accountCard}>
        <h2 className="text-base font-semibold text-gray-900">Registered phone number</h2>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <i className="fa-solid fa-mobile-screen" />
          </span>
          <div>
            <p className="text-base font-semibold tracking-wide text-gray-900">{formatPhone(profile.phoneNumber, profile.countryCode) || "Not available"}</p>
            <p className="text-xs text-gray-500">Used to log in with OTP</p>
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-gray-50 px-3.5 py-2.5 text-xs leading-relaxed text-gray-600">
          <i className="fa-solid fa-circle-info mr-1.5 text-gray-400" />
          Your login number can&apos;t be changed in the app. Use <strong>Talk to us</strong> if you need it moved to a new number.
        </p>
      </section>

      <form onSubmit={submit} className={`${accountCard} space-y-4`}>
        <h2 className="text-base font-semibold text-gray-900">Email address</h2>
        {!savedEmail && <p className="text-sm text-amber-700">Add an email to complete your profile and receive order receipts.</p>}
        <FormField id="email" label="Email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setJustSaved(false);
              setEmail(e.target.value);
            }}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </FormField>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm" aria-live="polite">
            {save.error ? (
              <span className="text-red-600">{save.error.message}</span>
            ) : justSaved ? (
              <span className="text-emerald-600">
                <i className="fa-solid fa-circle-check mr-1.5" />
                Email updated
              </span>
            ) : null}
          </p>
          <button type="submit" disabled={!dirty || save.isPending} className={primaryButton}>
            {save.isPending ? "Saving…" : savedEmail ? "Update email" : "Add email"}
          </button>
        </div>
      </form>
    </div>
  );
}
