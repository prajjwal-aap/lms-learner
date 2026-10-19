"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "../store";

/** Loads persisted onboarding answers from localStorage once the screen mounts. */
export function useHydrateOnboarding() {
  useEffect(() => {
    void useOnboardingStore.persist.rehydrate();
  }, []);
}
