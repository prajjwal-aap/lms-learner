"use client";

import { CircleCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useProfile, useUpdateProfile } from "../api/account.queries";
import type { Profile } from "../types";
import { AccountShell, AccountStatus, FormField, accountCard, inputClass, primaryButton } from "./AccountShell";

/** Fields the update-profile API accepts, minus email (managed on Phone & email). */
const FIELDS = ["name", "dob", "tob", "pob", "country", "state"] as const;
type Field = (typeof FIELDS)[number];
type Values = Record<Field, string>;

const valuesOf = (p: Profile): Values => ({
  name: p.name ?? "",
  dob: p.dob ?? "",
  tob: p.tob ?? "",
  pob: p.pob ?? "",
  country: p.country ?? "",
  state: p.state ?? "",
});

/** Name, birth details and location (POST /users/update-profile, changed fields only). */
export function PersonalInfoScreen() {
  const { data: profile, isLoading, error } = useProfile();
  return (
    <AccountShell title="Personal information" subtitle="Your birth details are used to personalise charts and course recommendations.">
      {profile ? <PersonalInfoForm key={profile.id} profile={profile} /> : <AccountStatus loading={isLoading} error={error} />}
    </AccountShell>
  );
}

function PersonalInfoForm({ profile }: { profile: Profile }) {
  const save = useUpdateProfile();
  const [saved, setSaved] = useState<Values>(() => valuesOf(profile));
  const [values, setValues] = useState<Values>(saved);
  const [justSaved, setJustSaved] = useState(false);

  // Only fields the learner actually changed are sent; empty strings are skipped (the API can't clear a field).
  const changes: Partial<Values> = Object.fromEntries(
    FIELDS.filter((f) => values[f].trim() !== saved[f] && values[f].trim() !== "").map((f) => [f, values[f].trim()]),
  );
  const dirty = Object.keys(changes).length > 0;
  const today = new Date().toISOString().slice(0, 10);

  const set = (field: Field) => (e: { target: { value: string } }) => {
    setJustSaved(false);
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    save.mutate(changes, {
      onSuccess: () => {
        setSaved((s) => ({ ...s, ...(changes as Values) }));
        setJustSaved(true);
      },
    });
  };

  return (
    <form onSubmit={submit} className={`${accountCard} space-y-5`}>
      <FormField id="name" label="Full name" required>
        <input id="name" value={values.name} onChange={set("name")} required maxLength={80} autoComplete="name" className={inputClass} />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="dob" label="Date of birth">
          <input id="dob" type="date" max={today} value={values.dob} onChange={set("dob")} className={inputClass} />
        </FormField>
        <FormField id="tob" label="Time of birth" hint="Needed for an accurate Lagna">
          <input id="tob" type="time" value={values.tob} onChange={set("tob")} className={inputClass} />
        </FormField>
      </div>

      <FormField id="pob" label="Place of birth">
        <input id="pob" value={values.pob} onChange={set("pob")} placeholder="City, e.g. New Delhi" className={inputClass} />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="country" label="Country">
          <input id="country" value={values.country} onChange={set("country")} autoComplete="country-name" placeholder="India" className={inputClass} />
        </FormField>
        <FormField id="state" label="State">
          <input id="state" value={values.state} onChange={set("state")} autoComplete="address-level1" placeholder="Delhi" className={inputClass} />
        </FormField>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm" aria-live="polite">
          {save.error ? (
            <span className="text-red-600">{save.error.message}</span>
          ) : justSaved ? (
            <span className="text-emerald-600">
              <CircleCheck className="mr-1.5 inline-block size-3.5 align-[-0.125em]" />
              Changes saved
            </span>
          ) : null}
        </p>
        <div className="flex gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setValues(saved)}
            disabled={!dirty || save.isPending}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 sm:flex-none"
          >
            Reset
          </button>
          <button type="submit" disabled={!dirty || save.isPending} className={`${primaryButton} flex-1 sm:flex-none`}>
            {save.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
