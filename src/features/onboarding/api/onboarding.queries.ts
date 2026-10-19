"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { authKeys, session } from "@/features/auth";
import { useOnboardingStore } from "../store";
import { getGoalOptions, getTopics, saveOnboarding } from "./onboarding.api";

export function useGoalOptions() {
  return useQuery({ queryKey: ["onboarding", "goals"], queryFn: getGoalOptions });
}

export function useTopics() {
  return useQuery({ queryKey: ["onboarding", "topics"], queryFn: getTopics });
}

/** Saves all three steps, marks the learner onboarded and enters the portal. */
export function useSaveOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveOnboarding,
    onSuccess: () => {
      session.markOnboarded();
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
      useOnboardingStore.persist.clearStorage();
      router.replace(ROUTES.community);
    },
  });
}
