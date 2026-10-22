import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { OgLogo } from "./BrandMark";

/** Header + footer frame for the onboarding ("Initiation Journey") steps. */
export function OnboardingShell({ children, skipSlot }: { children: ReactNode; skipSlot?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="fixed left-0 top-0 z-50 w-full bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-margin-mobile md:px-margin">
          <OgLogo preload />

          <div className="flex items-center gap-space-md">
            <div className="hidden items-center gap-space-sm rounded-full bg-surface-container px-space-md py-space-xs sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Initiation Journey</span>
            </div>
            {skipSlot ?? (
              <Link
                className="flex items-center gap-1 rounded-lg px-space-sm py-space-xs font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container-high hover:text-primary"
                href={ROUTES.home}
              >
                Skip<ArrowRight className="size-4 shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col items-center justify-center bg-background px-margin-mobile pb-space-xl pt-16 md:px-margin">
        {children}
      </main>

      <footer className="w-full bg-transparent py-space-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-sm px-margin-mobile text-center sm:flex-row sm:text-left md:px-margin">
          <p className="font-body-sm text-body-sm text-secondary">Guided by Ancient Rishi Parampara · Astrological &amp; Esoteric Sciences</p>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm text-secondary">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 shrink-0 text-tertiary" /> Sacred Trust
            </span>
            <span className="flex items-center gap-1">
              <Lock className="size-3.5 shrink-0 text-tertiary" /> Vedic Lineage Encrypted
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
