"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES, safeNextPath } from "@/config/routes";
import { getCurrentLearner, logout, sendOtp, verifyOtp } from "../api/auth.api";
import { deletionNotice } from "../deletionNotice";
import type { SignInResult } from "../types";

export const authKeys = { me: ["auth", "me"] as const };

export function useSendOtp() {
  return useMutation({ mutationFn: sendOtp });
}

/** Verifies the OTP, then routes to onboarding (first login) or the requested page. */
export function useVerifyOtp() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: ({ learner, isFirstLogin, deletionScheduled }: SignInResult) => {
      queryClient.setQueryData(authKeys.me, learner);
      deletionNotice.save(deletionScheduled);
      router.replace(isFirstLogin ? ROUTES.onboarding.profile : (safeNextPath(params.get("next")) ?? ROUTES.community));
    },
  });
}

/** The signed-in learner (name / avatar for the header). */
export function useCurrentLearner() {
  return useQuery({ queryKey: authKeys.me, queryFn: getCurrentLearner, staleTime: 5 * 60_000 });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return async () => {
    await logout().catch(() => undefined);
    deletionNotice.clear();
    queryClient.clear();
    router.replace(ROUTES.login);
  };
}
