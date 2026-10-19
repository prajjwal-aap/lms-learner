import type { ReactNode } from "react";
import { OnboardingShell } from "@/components/layout";
import { SkipOnboardingLink } from "@/features/onboarding";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingShell
      skipSlot={
        <SkipOnboardingLink className="flex items-center gap-1 rounded-lg px-space-sm py-space-xs font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container-high hover:text-primary">
          Skip<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </SkipOnboardingLink>
      }
    >
      {children}
    </OnboardingShell>
  );
}
