"use client";

import { ArrowRight, BadgeCheck, BookOpen, BookOpenText, Check, Lightbulb, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { ONBOARDING_IMAGE } from "../api/onboarding.mock";
import { useGoalOptions } from "../api/onboarding.queries";
import { useHydrateOnboarding } from "../hooks/useHydrateOnboarding";
import { useOnboardingStore } from "../store";
import type { GoalOption } from "../types";
import { StepNav } from "./StepNav";

/** Step 2 — single-choice "Why do you want to learn astrology?". */
export function GoalStepScreen() {
  useHydrateOnboarding();
  const router = useRouter();
  const { data: goals, isLoading } = useGoalOptions();
  const goal = useOnboardingStore((s) => s.goal);
  const setGoal = useOnboardingStore((s) => s.setGoal);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
      <div className="relative flex w-full flex-col items-center">
        <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-container/10 blur-3xl" />

        <div className="w-full max-w-2xl">
          <StepNav step={2} />
        </div>

        <div className="mx-auto mb-space-xl flex max-w-xl flex-col items-center text-center">
          <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-label-sm text-primary shadow-xs">
            <Sparkles className="size-[15px] shrink-0" fill="currentColor" />
            <span>Sankalpa &bull; Your Spiritual Intent</span>
          </div>
          <h1 className="mb-space-xs font-headline-xl-mobile text-headline-xl-mobile tracking-tight text-on-surface sm:font-headline-xl sm:text-headline-xl">
            Why do you want to learn astrology?
          </h1>
          <p className="mx-auto max-w-md font-body-md text-body-md text-secondary">
            Choose the primary reason that brings you to Occult Gurukul. We will tailor your cosmic curriculum and mentor matching.
          </p>
        </div>

        {/* Syllabus preview pill */}
        <div className="mb-space-lg w-full max-w-2xl overflow-hidden rounded-xl bg-surface-container-low p-1.5 shadow-xs">
          <div className="flex items-center justify-between px-3 py-1.5">
            <div className="flex items-center gap-2">
              <BookOpenText className="size-4 shrink-0 text-primary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant">Gurukul Syllabus Alignment</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary">Step 2 Overview</span>
          </div>
          <div className="relative h-24 w-full overflow-hidden rounded-lg sm:h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Curriculum preview"
              className="h-full w-full object-cover object-center opacity-90 brightness-95 transition-transform duration-700 hover:scale-105"
              src={ONBOARDING_IMAGE}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/80 via-transparent to-surface-container-lowest/80" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 font-label-sm text-label-sm text-primary shadow-xs backdrop-blur-md">
                <BookOpen className="size-3.5 shrink-0" />
                Personalized Vedic Learning Tracks
              </span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div aria-label="Reasons for learning astrology" className="flex w-full max-w-2xl flex-col gap-space-md" role="radiogroup">
          {isLoading && <p className="py-space-lg text-center font-body-md text-body-md text-secondary">Loading…</p>}
          {goals?.map((g) => (
            <GoalCard key={g.id} goal={g} selected={g.id === goal} onSelect={() => setGoal(g.id)} />
          ))}
        </div>

        <div className="mt-space-md flex w-full max-w-2xl items-center gap-space-md rounded-xl bg-surface-container/60 p-space-md text-secondary">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
            <Lightbulb className="size-5" />
          </div>
          <p className="font-body-sm text-body-sm">
            <span className="font-semibold text-on-surface">Did you know?</span> 82% of Gurukul initiates choose path exploration before selecting
            their specialization in Prashna Kundali or Lal Kitab.
          </p>
        </div>

        <div className="mt-space-xl flex w-full max-w-2xl flex-col items-center justify-between gap-space-md pt-space-md sm:flex-row">
          <div className="flex items-center gap-2 text-secondary">
            <BadgeCheck className="size-[18px] shrink-0 text-primary" />
            <span className="font-body-sm text-body-sm">No prior Sanskrit or Jyotish knowledge required</span>
          </div>
          <button
            className="group inline-flex w-full items-center justify-center gap-space-sm rounded-lg bg-primary-container px-8 py-3 font-headline-md text-headline-md text-on-primary shadow-md transition-all duration-200 hover:bg-primary hover:shadow-lg active:scale-[0.99] disabled:opacity-60 sm:w-auto"
            disabled={!goal}
            type="button"
            onClick={() => router.push(ROUTES.onboarding.topics)}
          >
            <span>Continue</span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal, selected, onSelect }: { goal: GoalOption; selected: boolean; onSelect: () => void }) {
  const Icon = goal.icon;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      aria-checked={selected}
      className={cn(
        "group relative cursor-pointer rounded-xl p-space-md shadow-xs transition-all duration-200 hover:bg-surface-container-low hover:shadow-md",
        selected ? "bg-surface-container-low ring-2 ring-primary-container" : "bg-surface-container-lowest ring-0",
      )}
      role="radio"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <div className="flex items-start gap-space-md">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
            selected ? "bg-primary-container text-on-primary shadow-xs" : "bg-surface-container-high text-primary",
          )}
        >
          <Icon className="size-[26px]" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">{goal.title}</h3>
            <span
              className={cn(
                "hidden rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm sm:inline-block",
                goal.tagTone === "primary" ? "text-primary" : "text-secondary",
              )}
            >
              {goal.tag}
            </span>
          </div>
          <p className="font-body-md text-body-md leading-relaxed text-secondary">{goal.description}</p>
        </div>
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200",
            selected ? "bg-primary-container text-on-primary shadow-xs" : "bg-surface-container text-transparent",
          )}
        >
          <Check className="size-4" strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}
