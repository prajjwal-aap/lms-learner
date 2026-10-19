"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_GOAL, DEFAULT_TOPICS } from "./api/onboarding.mock";
import type { GoalId, OnboardingProfile } from "./types";

type OnboardingState = OnboardingProfile & {
  goal: GoalId | null;
  topics: string[];
  setProfile: (profile: Partial<OnboardingProfile>) => void;
  setGoal: (goal: GoalId) => void;
  toggleTopic: (id: string) => void;
};

/** Answers collected across the three onboarding steps (persisted so refresh / Back keep them). */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      name: "",
      dob: "",
      birthTime: "",
      birthPlace: "",
      goal: DEFAULT_GOAL,
      topics: DEFAULT_TOPICS,
      setProfile: (profile) => set(profile),
      setGoal: (goal) => set({ goal }),
      toggleTopic: (id) =>
        set((s) => ({ topics: s.topics.includes(id) ? s.topics.filter((t) => t !== id) : [...s.topics, id] })),
    }),
    {
      name: "og-onboarding",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated by useHydrateOnboarding() after mount, so SSR and first client render match.
      skipHydration: true,
      partialize: ({ name, dob, birthTime, birthPlace, goal, topics }) => ({ name, dob, birthTime, birthPlace, goal, topics }),
    },
  ),
);
