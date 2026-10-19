import type { ReactNode } from "react";
import { OgLogo } from "./BrandMark";

const FOOTER_LINKS = ["Terms of Service", "Privacy Policy", "Student Honor Code"];

/** Header + footer frame for login / reset-password screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary">
      <header className="fixed top-0 z-50 w-full bg-surface/85 shadow-[0_1px_8px_rgba(105,48,195,0.04)] backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-gutter">
          <OgLogo preload />

          <nav className="hidden items-center gap-space-md sm:flex">
            <a aria-current="page" className="rounded-lg bg-secondary-container px-space-sm py-space-xs font-label-md text-label-md text-primary" href="#">
              Student Portal
            </a>
            <a className="rounded-lg px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary" href="#">
              Knowledge Base
            </a>
            <a className="rounded-lg px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary" href="#">
              Help &amp; Support
            </a>
          </nav>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="material-symbols-outlined text-[18px] text-on-primary">person</span>
          </div>
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col justify-center bg-background pt-16">{children}</main>

      <footer className="w-full bg-surface-container-low/80 py-space-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-space-sm px-gutter sm:flex-row">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            © 2025 Occult Gurukul. Sacred Knowledge &amp; Vedic Studies. All rights reserved.
          </span>
          <div className="flex items-center gap-space-md">
            {FOOTER_LINKS.map((l) => (
              <a key={l} className="font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary" href="#">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
