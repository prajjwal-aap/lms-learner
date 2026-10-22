"use client";

import { ArrowRight, BrainCircuit, Check, CircleAlert, CircleCheck, RotateCcwKey, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_IMAGE } from "../api/onboarding.mock";
import { useSaveOnboarding, useTopics } from "../api/onboarding.queries";
import { useHydrateOnboarding } from "../hooks/useHydrateOnboarding";
import { useOnboardingStore } from "../store";
import type { Topic } from "../types";
import { StepNav } from "./StepNav";

/** Step 3 (final) — multi-select topic chips, then save and enter the portal. */
export function TopicsStepScreen() {
  useHydrateOnboarding();
  const { data: topics, isLoading } = useTopics();
  const { name, dob, birthTime, birthPlace, goal, topics: selected, toggleTopic } = useOnboardingStore();
  const save = useSaveOnboarding();

  const count = selected.length;
  const finish = () => save.mutate({ name, dob, birthTime, birthPlace, goal, topics: selected });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col">
      <StepNav step={3} />

      <div className="relative w-full overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-xl shadow-primary/5 sm:p-space-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 z-0 h-80 w-80 rounded-full bg-primary-fixed/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 z-0 h-72 w-72 rounded-full bg-tertiary-fixed/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-primary">
            <Sparkles className="size-[15px] shrink-0" fill="currentColor" />
            Personalized Dharmic Pathway
          </div>
          <h1 className="max-w-2xl font-headline-xl-mobile text-headline-xl-mobile tracking-tight text-on-surface sm:font-headline-xl sm:text-headline-xl">
            What topics would you like to explore?
          </h1>
          <p className="mt-space-xs max-w-xl text-center font-body-md text-body-md leading-relaxed text-secondary">
            Pick a few — these tailor your celestial dashboard, daily Panchang insights, and sacred course recommendations.
          </p>

          <div className="mb-space-md mt-space-lg flex w-full items-center justify-between gap-2 px-1 pt-space-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary-container" />
              <span className="font-label-md text-label-md text-on-surface">Recommended Core Sciences</span>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-label-md text-label-md text-primary">
              <CircleCheck className="size-4 shrink-0" />
              <span aria-live="polite">
                {count} {count === 1 ? "topic" : "topics"} selected
              </span>
            </div>
          </div>

          {isLoading && <p className="py-space-lg font-body-md text-body-md text-secondary">Loading…</p>}
          <div className="grid w-full grid-cols-2 gap-3 text-left sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4">
            {topics?.map((t) => (
              <TopicChip key={t.id} topic={t} selected={selected.includes(t.id)} onToggle={() => toggleTopic(t.id)} />
            ))}
          </div>

          <div className="mt-space-xl flex w-full flex-col items-center">
            {save.error && (
              <p className="mb-space-sm flex items-center gap-1.5 font-body-sm text-body-sm text-error" role="alert">
                <CircleAlert className="size-4 shrink-0" />
                {save.error.message}
              </p>
            )}
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-space-xl py-3.5 font-headline-md text-headline-md text-on-primary shadow-lg shadow-primary-container/25 transition-all hover:bg-primary hover:shadow-xl hover:shadow-primary-container/35 active:scale-[0.99] disabled:opacity-60 sm:w-auto sm:min-w-[320px]"
              disabled={count === 0 || save.isPending}
              type="button"
              onClick={finish}
            >
              <span>{save.isPending ? "Preparing your Gurukul…" : "Complete Setup & Enter Gurukul"}</span>
              <ArrowRight className="size-[22px] shrink-0" />
            </button>
            <div className="mt-space-sm flex items-center gap-2 text-secondary">
              <RotateCcwKey className="size-4 shrink-0 text-tertiary" />
              <p className="font-body-sm text-body-sm">You can update these anytime in your learner profile settings.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-space-lg flex w-full flex-col items-center justify-between gap-space-md rounded-xl bg-surface-container p-space-md sm:flex-row">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
            <BrainCircuit className="size-[22px]" />
          </div>
          <div>
            <h4 className="font-headline-md text-[14px] leading-tight text-on-surface">Customized Vedic Learning Track</h4>
            <p className="font-body-sm text-body-sm text-secondary">
              Your selections configure personalized live webinars, reading circles, and peer mentor cohorts.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Onboarding visual flow" className="h-10 w-20 rounded-md object-cover opacity-80 shadow-xs" src={ONBOARDING_IMAGE} />
          <span className="rounded-sm bg-surface-container-lowest px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">Module 1.3</span>
        </div>
      </div>
    </div>
  );
}

function TopicChip({ topic, selected, onToggle }: { topic: Topic; selected: boolean; onToggle: () => void }) {
  const Icon = topic.icon;
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "group flex cursor-pointer flex-col items-start rounded-xl p-3.5 transition-all duration-200 sm:p-4",
        selected
          ? "scale-[1.01] bg-primary-container text-on-primary shadow-md shadow-primary/20"
          : "bg-surface-container text-on-surface hover:bg-surface-container-high",
      )}
      type="button"
      onClick={onToggle}
    >
      <div className="mb-2 flex w-full items-center justify-between">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            selected ? "bg-white/15 text-on-primary" : "bg-surface-container-highest text-secondary group-hover:text-primary",
          )}
        >
          <Icon className="size-5" />
        </span>
        <span
          className={cn(
            "h-5 w-5 items-center justify-center rounded-full bg-on-primary text-[14px] text-primary",
            selected ? "flex" : "hidden",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </div>
      <span className="font-headline-md text-[14px] font-semibold leading-tight">{topic.label}</span>
      <span className={cn("mt-0.5 text-[11px]", selected ? "opacity-80" : "text-secondary")}>{topic.sub}</span>
    </button>
  );
}
