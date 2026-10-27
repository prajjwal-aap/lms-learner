import { Suspense, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { ActiveLearnerNavTabs, ActiveMobileTabBar, LearnerNavTabs, MobileTabBar } from "./LearnerNavTabs";

/** Global top bar: logo, icon-over-label tabs, cart, notifications and profile slot. */
export function LearnerHeader({ profileSlot, cartSlot, notificationSlot }: { profileSlot?: ReactNode; cartSlot?: ReactNode; notificationSlot?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-2.5 shadow-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <BrandMark />

        <Suspense fallback={<LearnerNavTabs pathname="" />}>
          <ActiveLearnerNavTabs />
        </Suspense>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {cartSlot}
          {notificationSlot}
          {profileSlot}
        </div>
      </div>

      <Suspense fallback={<MobileTabBar pathname="" />}>
        <ActiveMobileTabBar />
      </Suspense>
    </header>
  );
}
