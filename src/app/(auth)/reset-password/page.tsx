import { Suspense } from "react";
import { ResetPasswordScreen } from "@/features/auth";

export const metadata = { title: "Verify & Login" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
