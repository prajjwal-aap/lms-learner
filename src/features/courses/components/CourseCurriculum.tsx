"use client";

import { ChevronDown, CircleCheck, Contrast, Lock } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { formatDuration, formatWhen, LESSON_ICON, lessonMeta } from "../lib/learning";
import type { CourseSection, LessonSummary } from "../types";

type Props = {
  courseId: string;
  sections: CourseSection[];
  /** Highlighted lesson (the one playing, or where "Continue" goes). */
  activeLessonId?: string | null;
  /** Compact sidebar style for the player. */
  variant?: "page" | "sidebar";
  className?: string;
};

/** Module accordion; the active lesson's module starts open (and scrolled into view in the sidebar). */
export function CourseCurriculum({ courseId, sections, activeLessonId, variant = "page", className }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Set<string>>(() => {
    const active = sections.find((s) => s.lessons.some((l) => l.id === activeLessonId));
    return new Set([active?.id ?? sections[0]?.id].filter(Boolean) as string[]);
  });

  // Centre the active row inside the list only (scrollIntoView would also scroll the page).
  useLayoutEffect(() => {
    if (variant !== "sidebar") return;
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>("[data-active='true']");
    if (list && row) list.scrollTop = row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
  }, [activeLessonId, variant]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sidebar = variant === "sidebar";

  return (
    <div ref={listRef} className={cn("relative", sidebar ? "overflow-y-auto" : "space-y-3", className)}>
      {sections.map((section) => {
        const isOpen = open.has(section.id);
        const done = section.lessons.filter((l) => l.status === "COMPLETED").length;
        const seconds = section.lessons.reduce((n, l) => n + (l.duration_sec ?? 0), 0);
        const allLocked = section.lessons.every((l) => l.locked);
        return (
          <div key={section.id} className={sidebar ? "border-b border-gray-200" : "overflow-hidden rounded-lg border border-gray-200 bg-white"}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(section.id)}
              className={cn(
                "flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition",
                sidebar ? "sticky top-0 z-10 bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50/80",
              )}
            >
              <div className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="min-w-0">{section.title}</span>
                  {allLocked && <Lock className="size-[11px] shrink-0 text-gray-400" aria-label="Locked" />}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  {done} / {section.lessons.length} complete{seconds > 0 && ` • ${formatDuration(seconds)}`}
                </span>
              </div>
              <ChevronDown className={cn("mt-1 size-3 shrink-0 text-gray-500 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <ul className="divide-y divide-gray-100 border-t border-gray-100">
                {section.lessons.map((l, i) => (
                  <LessonRow key={l.id} courseId={courseId} lesson={l} index={i} active={l.id === activeLessonId} sidebar={sidebar} />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusIcon({ lesson: l }: { lesson: LessonSummary }) {
  if (l.locked) return <Lock className="mx-0.5 size-3 text-gray-400" aria-label="Locked" />;
  if (l.status === "COMPLETED") return <CircleCheck className="size-4 text-emerald-600" aria-label="Completed" />;
  if (l.status === "IN_PROGRESS") return <Contrast className="size-4 text-brand-500" aria-label="In progress" />;
  return <span className="block h-4 w-4 rounded-full border-2 border-gray-300" aria-label="Not started" />;
}

function LessonRow({ courseId, lesson: l, index, active, sidebar }: { courseId: string; lesson: LessonSummary; index: number; active: boolean; sidebar: boolean }) {
  const TypeIcon = LESSON_ICON[l.type];
  const body = (
    <>
      <span className="mt-0.5 shrink-0">
        <StatusIcon lesson={l} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[13px] leading-snug", active ? "font-semibold text-gray-900" : "text-gray-700", l.locked && "text-gray-400")}>
          {index + 1}. {l.title}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
          <span>
            <TypeIcon className="mr-1 inline-block size-[11px] align-[-0.125em]" />
            {lessonMeta(l)}
          </span>
          {l.locked && l.lock_reason === "DRIP" && l.unlock_at && <span className="font-medium text-amber-600">Opens {formatWhen(l.unlock_at)}</span>}
          {l.locked && l.lock_reason === "SEQUENTIAL" && <span>Finish the previous lesson first</span>}
          {l.is_free_preview && !sidebar && <span className="rounded-sm bg-emerald-50 px-1.5 font-semibold text-emerald-700">Preview</span>}
        </span>
      </span>
    </>
  );
  const rowClass = cn(
    "flex items-start gap-3 px-5 py-3 transition",
    active ? "bg-brand-50 shadow-[inset_3px_0_0_var(--color-brand-600)]" : !l.locked && "hover:bg-gray-50",
    l.locked && "cursor-not-allowed",
  );
  return (
    <li data-active={active}>
      {l.locked ? (
        <div className={rowClass}>{body}</div>
      ) : (
        <Link href={ROUTES.lesson(courseId, l.id)} aria-current={active ? "page" : undefined} className={rowClass}>
          {body}
        </Link>
      )}
    </li>
  );
}
