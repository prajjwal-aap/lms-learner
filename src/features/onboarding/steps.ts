import { ROUTES } from "@/config/routes";

/** Ordered onboarding steps; index + 1 is the step number shown in the progress UI. */
export const ONBOARDING_STEPS = [
  { href: ROUTES.onboarding.profile, title: "Birth Matrix & Identity" },
  { href: ROUTES.onboarding.goal, title: "Your Learning Goal" },
  { href: ROUTES.onboarding.topics, title: "Topic Preferences" },
] as const;

export const TOTAL_STEPS = ONBOARDING_STEPS.length;
