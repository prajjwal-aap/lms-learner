import { KeyRound } from "lucide-react";
import { isMocked } from "@/config/features";
import { DEMO_OTP } from "../api/auth.mock";

/** Shows the demo OTP, only while auth runs on mock data. */
export function DemoOtpHint() {
  if (!isMocked("auth")) return null;
  return (
    <p className="flex items-center gap-space-xs rounded-lg border border-dashed border-primary-container/40 bg-primary-fixed/40 px-space-sm py-space-xs font-body-sm text-body-sm text-on-surface-variant">
      <KeyRound className="size-4 shrink-0 text-primary" />
      Demo mode: use OTP <strong className="tracking-[0.2em] text-primary">{DEMO_OTP}</strong>
    </p>
  );
}
