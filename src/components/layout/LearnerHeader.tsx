// import { Bell } from "lucide-react"; // uncomment with the notification button below
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

          {/* Notification Button is commented out */}
          {/* <button aria-label="Notifications" className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">
            <Bell className="h-5 w-5" strokeWidth={1.8} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white" />
          </button> */}
          {profileSlot}
        </div>
      </div>
    </header>
  );
}
