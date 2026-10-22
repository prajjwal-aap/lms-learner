"use client";

import { CircleCheck, Info, Mail, Smartphone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useUpdateProfile } from "../api/account.queries";
import { formatPhone } from "../lib/format";
import type { Profile } from "../types";
import { FormField, SectionHeader, accountCard, inputClass, primaryButton } from "./AccountShell";

/** Profile section: login phone (read-only, §3.3) and email (editable). */
export function ContactSection({ profile }: { profile: Profile }) {
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
    <section id="contact" className={`${accountCard} scroll-mt-24`}>
      <SectionHeader icon={Mail} title="Phone & email" subtitle="How we reach you about orders, live sessions and account security." />

      {/* Phone (read-only) */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Registered phone number</p>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
          <Smartphone className="size-4 shrink-0 text-gray-400" />
          <span className="text-sm font-semibold tracking-wide text-gray-900">{formatPhone(profile.phoneNumber, profile.countryCode) || "Not available"}</span>
          <span className="ml-auto text-xs text-gray-500">Used to log in with OTP</span>
        </div>
        <p className="text-xs leading-relaxed text-gray-500">
          <Info className="mr-1 inline-block size-3 align-[-0.125em] text-gray-400" />
          Your login number can&apos;t be changed in the app. Use <strong>Talk to us</strong> if you need it moved to a new number.
        </p>
      </div>

      {/* Email (editable) */}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <FormField id="email" label="Email address">
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
        {!savedEmail && <p className="text-sm text-amber-700">Add an email to complete your profile and receive order receipts.</p>}
        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm" aria-live="polite">
            {save.error ? (
              <span className="text-red-600">{save.error.message}</span>
            ) : justSaved ? (
              <span className="text-emerald-600">
                <CircleCheck className="mr-1.5 inline-block size-3.5 align-[-0.125em]" />
                Email updated
              </span>
            ) : null}
          </p>
          <button type="submit" disabled={!dirty || save.isPending} className={primaryButton}>
            {save.isPending ? "Saving…" : savedEmail ? "Update email" : "Add email"}
          </button>
        </div>
      </form>
    </section>
  );
}
