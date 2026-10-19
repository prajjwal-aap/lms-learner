import { isMocked } from "@/config/features";
import { api } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import type { GoalOption, OnboardingPayload, Topic } from "../types";
import { MOCK_GOALS, MOCK_TOPICS } from "./onboarding.mock";

// No API yet: goal and topic choices are static content.
export async function getGoalOptions(): Promise<GoalOption[]> {
  await mockDelay();
  return MOCK_GOALS;
}

// No API yet: goal and topic choices are static content.
export async function getTopics(): Promise<Topic[]> {
  await mockDelay();
  return MOCK_TOPICS;
}

/** Saves the birth profile (POST /users/update-profile, §3.3). Goal + topics have no API yet and stay client-side. */
export async function saveOnboarding(payload: OnboardingPayload): Promise<{ ok: true }> {
  if (!payload.name.trim() || !payload.dob) throw new Error("Please complete your name and date of birth in step 1");
  if (!payload.goal) throw new Error("Please choose why you want to learn astrology in step 2");
  if (payload.topics.length === 0) throw new Error("Pick at least one topic to continue");

  if (isMocked("onboarding")) {
    await mockDelay(500);
    return { ok: true };
  }
  await api.post("/users/update-profile", {
    name: payload.name.trim(),
    dob: payload.dob,
    ...(payload.birthTime && { tob: payload.birthTime }),
    ...(payload.birthPlace.trim() && { pob: payload.birthPlace.trim() }),
  });
  return { ok: true };
}
