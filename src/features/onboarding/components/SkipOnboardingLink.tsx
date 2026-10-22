"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { session } from "@/features/auth";

/** Leaves onboarding for the community feed and remembers it, so login doesn't send the learner back here. */
export function SkipOnboardingLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link href={ROUTES.home} onClick={() => session.markOnboarded()} className={className}>
      {children}
    </Link>
  );
}
