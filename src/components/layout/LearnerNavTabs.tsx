"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEARNER_NAV } from "@/config/nav";
import { cn } from "@/lib/utils";
import { NavIconSvg } from "./NavIcons";

/** Reads the current URL to highlight the active tab (streams in under Suspense). */
export function ActiveLearnerNavTabs() {
  return <LearnerNavTabs pathname={usePathname()} />;
}

/** Icon-over-label tabs in the header (md and up); `pathname` decides which one is active. */
export function LearnerNavTabs({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex lg:gap-12">
      {LEARNER_NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex shrink-0 flex-col items-center py-1 transition-colors",
              active ? "font-bold text-purple-700" : "text-gray-500 hover:text-purple-700",
            )}
          >
            <span className="mb-1 transition-transform group-hover:scale-105">
              <NavIconSvg name={item.icon} active={active} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider">{item.label}</span>
            {active && <span className="absolute -bottom-2.5 left-0 right-0 h-[3px] rounded-t-[3px] bg-purple-700" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function ActiveMobileTabBar() {
  return <MobileTabBar pathname={usePathname()} />;
}

/** Phone tab bar fixed to the bottom of the screen (below md); replaces the header tabs there. */
export function MobileTabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] md:hidden"
    >
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${LEARNER_NAV.length}, minmax(0, 1fr))` }}>
        {LEARNER_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-1 transition-colors",
                active ? "text-purple-700" : "text-gray-500 active:text-purple-700",
              )}
            >
              {active && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-[3px] bg-purple-700" />}
              <NavIconSvg name={item.icon} active={active} />
              <span className={cn("whitespace-nowrap text-[11px] leading-none", active ? "font-bold" : "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
