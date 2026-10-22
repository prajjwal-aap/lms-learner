import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "../steps";
import { SkipOnboardingLink } from "./SkipOnboardingLink";

const SKIP_CLASS =
  "rounded-lg px-space-sm py-space-xs font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container hover:text-primary";

/** Back · segmented "Step N of 3" pills · Skip — used on steps 2 and 3. */
export function StepNav({ step }: { step: number }) {
  const prev = ONBOARDING_STEPS[step - 2];
  const next = ONBOARDING_STEPS[step];
  const isLast = step === TOTAL_STEPS;

  return (
    <div className="flex w-full items-center justify-between px-space-xs pb-space-lg">
      {prev ? (
        <Link
          className="group flex items-center gap-space-xs rounded-lg px-space-sm py-space-xs font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container hover:text-primary"
          href={prev.href}
        >
          <ArrowLeft className="size-[18px] shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Back</span>
        </Link>
      ) : (
        <span />
      )}

      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {ONBOARDING_STEPS.map((s, i) => {
            const n = i + 1;
            return (
              <div
                key={s.href}
                className={cn(
                  "relative h-1.5 w-8 overflow-hidden rounded-full",
                  n <= step ? "bg-primary-container" : "bg-surface-container-highest",
                  n === step && isLast && "animate-pulse shadow-xs shadow-primary/30",
                )}
              >
                {n === step && !isLast && <div className="absolute inset-0 animate-pulse bg-primary" />}
              </div>
            );
          })}
        </div>
        <span className="font-label-sm text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Step {step} of {TOTAL_STEPS}
          {isLast && " • Final Step"}
        </span>
      </div>

      {next ? (
        <Link className={SKIP_CLASS} href={next.href}>
          Skip
        </Link>
      ) : (
        <SkipOnboardingLink className={SKIP_CLASS}>Skip</SkipOnboardingLink>
      )}
    </div>
  );
}
