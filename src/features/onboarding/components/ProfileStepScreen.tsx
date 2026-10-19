"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { ONBOARDING_IMAGE } from "../api/onboarding.mock";
import { useHydrateOnboarding } from "../hooks/useHydrateOnboarding";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "../steps";
import { useOnboardingStore } from "../store";

const STEP = 1;
const INPUT =
  "w-full pl-11 pr-space-md py-3 bg-surface-container-low/70 hover:bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md rounded-xl transition-all duration-200 outline-hidden border-0 focus:ring-0 focus:shadow-[0_0_0_3px_rgba(105,48,195,0.14)]";
const ASSURANCES = [
  { icon: "auto_fix_high", label: "100% Free Chart Generation" },
  { icon: "security", label: "Encrypted Vedic Records" },
  { icon: "check_circle", label: "Verified Parashara Engine" },
];

/** Step 1 — name, date of birth and optional birth time / place. */
export function ProfileStepScreen() {
  useHydrateOnboarding();
  const router = useRouter();
  const { name, dob, birthTime, birthPlace, setProfile } = useOnboardingStore();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(ROUTES.onboarding.goal);
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-space-sm sm:py-space-md">
      {/* Ambient lights */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[340px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-fixed/50 via-surface-container/30 to-transparent opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-tertiary-fixed/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-20 h-80 w-80 rounded-full bg-surface-container-high/60 blur-2xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-space-xs sm:px-space-sm">
        {/* Step bar */}
        <div className="mb-space-lg flex w-full flex-col items-center">
          <div className="mb-space-xs flex w-full items-center justify-between px-1">
            <div className="flex items-center gap-space-xs">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container font-label-sm text-label-sm text-on-primary shadow-xs">
                {STEP}
              </span>
              <span className="font-label-md text-label-md font-semibold tracking-wide text-primary">{ONBOARDING_STEPS[STEP - 1].title}</span>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
              Step {STEP} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="grid h-1.5 w-full grid-cols-3 gap-2 overflow-hidden rounded-full bg-surface-container-highest/60 p-0.5">
            {ONBOARDING_STEPS.map((s, i) => (
              <div
                key={s.href}
                className={cn(
                  "h-full rounded-full",
                  i < STEP ? "bg-primary-container shadow-[0_0_10px_rgba(105,48,195,0.45)] transition-all duration-500" : "bg-surface-variant/80",
                )}
              />
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-[0_4px_24px_-4px_rgba(105,48,195,0.08),0_1px_3px_0_rgba(0,0,0,0.02)] sm:p-space-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 select-none text-primary opacity-[0.04]">
            <svg fill="currentColor" viewBox="0 0 200 200">
              <circle cx="100" cy="100" fill="none" r="90" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2" />
              <polygon fill="none" points="100,15 185,160 15,160" stroke="currentColor" strokeWidth="1.5" />
              <polygon fill="none" points="100,185 185,40 15,40" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" fill="none" r="45" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" fill="none" r="18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 mb-space-xl text-center">
            <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-space-sm py-0.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Sanskriti Onboarding</span>
            </div>
            <h1 className="mb-space-xs font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface sm:text-[28px] sm:leading-[36px]">
              A few details to personalize your journey
            </h1>
            <p className="mx-auto max-w-md font-body-md text-body-md leading-relaxed text-secondary">
              Help us craft your personalized Vedic learning path, Kundali chart alignment, and tailored astrological curriculum.
            </p>
          </div>

          <form className="relative z-10 space-y-space-md" onSubmit={onSubmit}>
            <Field htmlFor="fullName" label="Full Legal Name" required hint="Vedic Nama Sankalp" icon="person">
              <input
                className={INPUT}
                id="fullName"
                placeholder="e.g. Aarav Sharma"
                required
                type="text"
                value={name}
                onChange={(e) => setProfile({ name: e.target.value })}
              />
            </Field>

            <Field htmlFor="dob" label="Date of Birth" required hint="DD / MM / YYYY" icon="calendar_today">
              <input
                className={INPUT}
                id="dob"
                required
                type="date"
                value={dob}
                onChange={(e) => setProfile({ dob: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
              <Field htmlFor="birthTime" label="Time of Birth" hint="(Optional)" icon="schedule" help="Needed for precise Lagna & Navamsha">
                <input
                  className={INPUT}
                  id="birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setProfile({ birthTime: e.target.value })}
                />
              </Field>
              <Field htmlFor="birthPlace" label="Place of Birth" hint="(Optional)" icon="location_on" help="Coordinates for planetary degrees">
                <input
                  className={INPUT}
                  id="birthPlace"
                  placeholder="City, State, Country"
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setProfile({ birthPlace: e.target.value })}
                />
              </Field>
            </div>

            <div className="mt-space-sm flex items-center gap-space-md rounded-xl bg-surface-container p-space-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                <span className="material-symbols-outlined text-[22px]">hub</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface">Dynamic Jyotish Synthesis</span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Your data remains sacred and private according to our Guru-Shishya covenant.
                </span>
              </div>
            </div>

            <div className="pt-space-sm">
              <button
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-container px-space-lg py-3.5 font-label-md text-label-md text-on-primary shadow-[0_8px_20px_-4px_rgba(105,48,195,0.35)] transition-all duration-200 hover:bg-primary hover:shadow-[0_10px_26px_-4px_rgba(105,48,195,0.48)] active:scale-[0.99]"
                type="submit"
              >
                <span>Continue to Astrological Preferences</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>

        {/* Reference artwork banner */}
        <div className="mt-space-lg flex w-full flex-col items-center gap-space-md overflow-hidden rounded-2xl bg-surface-container-lowest p-space-sm shadow-[0_2px_12px_rgba(0,0,0,0.03)] sm:p-space-md md:flex-row">
          <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container-high md:w-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Occult Gurukul Reference Platform Overview" className="h-full w-full object-cover object-left" src={ONBOARDING_IMAGE} />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 to-transparent" />
            <span className="absolute bottom-1.5 left-2 flex items-center gap-1 font-label-sm text-label-sm text-surface-bright">
              <span className="material-symbols-outlined text-[13px]">school</span> Gurukul Campus
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface">Curated by Sacred Masters</span>
            <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
              Join 18,400+ initiated sadhakas mastering Vedic Astrology, Numerology, Lal Kitab, and Vastu Vigyan.
            </p>
          </div>
        </div>

        <div className="mt-space-md flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-label-sm text-label-sm text-secondary">
          {ASSURANCES.map((a) => (
            <span key={a.label} className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">{a.icon}</span>
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  htmlFor: string;
  label: string;
  hint: string;
  icon: string;
  required?: boolean;
  help?: string;
  children: ReactNode;
};

/** Label row + icon-prefixed input wrapper from the design. */
function Field({ htmlFor, label, hint, icon, required, help, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center justify-between font-label-md text-label-md text-on-surface" htmlFor={htmlFor}>
        <span className="flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="font-bold text-primary">*</span>}
        </span>
        <span className="font-label-sm text-label-sm text-secondary">{hint}</span>
      </label>
      <div className="group relative flex items-center">
        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-secondary transition-colors group-focus-within:text-primary">
          {icon}
        </span>
        {children}
      </div>
      {help && <p className="mt-0.5 font-body-sm text-body-sm leading-tight text-secondary">{help}</p>}
    </div>
  );
}
