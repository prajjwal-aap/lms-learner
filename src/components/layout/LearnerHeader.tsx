import { Suspense, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { ActiveLearnerNavTabs, LearnerNavTabs } from "./LearnerNavTabs";

/** Global top bar: logo, icon-over-label tabs, cart, notifications and profile slot. */
export function LearnerHeader({ profileSlot, cartSlot }: { profileSlot?: ReactNode; cartSlot?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-2.5 shadow-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <BrandMark />

        <Suspense fallback={<LearnerNavTabs pathname="" />}>
          <ActiveLearnerNavTabs />
        </Suspense>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {cartSlot}
          <button aria-label="Notifications" className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white" />
          </button>
          {profileSlot}
        </div>
      </div>
    </header>
  );
}
