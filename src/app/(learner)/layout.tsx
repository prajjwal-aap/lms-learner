import type { ReactNode } from "react";
import { LearnerHeader, WhatsAppFab } from "@/components/layout";
import { DeletionNotice } from "@/features/account";
import { ProfileMenu } from "@/features/auth";
import { CartButton } from "@/features/cart";
import { NotificationBell } from "@/features/notifications";

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return (
    // Bottom padding on phones keeps content clear of the fixed tab bar (h-16 + safe area).
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <LearnerHeader profileSlot={<ProfileMenu />} cartSlot={<CartButton />} notificationSlot={<NotificationBell />} />
      <DeletionNotice />
      <div className="flex-1">{children}</div>
      <WhatsAppFab />
    </div>
  );
}
