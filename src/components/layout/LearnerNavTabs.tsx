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

/** Icon-over-label tabs; `pathname` decides which one is active. */
export function LearnerNavTabs({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main navigation" className="no-scrollbar flex items-center gap-5 overflow-x-auto md:gap-10">
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
            <span className="hidden max-w-24 truncate text-xs font-semibold uppercase tracking-wider sm:block">
              {item.label}
            </span>
            {active && <span className="absolute -bottom-2.5 left-0 right-0 h-[3px] rounded-t-[3px] bg-purple-700" />}
          </Link>
        );
      })}
    </nav>
  );
}
