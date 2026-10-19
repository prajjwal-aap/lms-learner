import { Suspense } from "react";
import { LoginScreen } from "@/features/auth";

export const metadata = { title: "Learner Login" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
