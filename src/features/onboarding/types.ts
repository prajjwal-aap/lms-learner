import type { LucideIcon } from "lucide-react";

export type GoalId = "self" | "guidance" | "hobby" | "professional";

export type GoalOption = {
  id: GoalId;
  title: string;
  /** Sanskrit tag pill, e.g. "Atma Gyan". */
  tag: string;
  tagTone: "primary" | "secondary";
  description: string;
  icon: LucideIcon;
};

export type Topic = {
  id: string;
  label: string;
  sub: string;
  icon: LucideIcon;
};

export type OnboardingProfile = {
  name: string;
  /** yyyy-mm-dd (native date input value). */
  dob: string;
  birthTime: string;
  birthPlace: string;
};

export type OnboardingPayload = OnboardingProfile & { goal: GoalId | null; topics: string[] };
