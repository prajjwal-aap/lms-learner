"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { track } from "@/lib/analytics";
import { openInNewTab } from "@/lib/openInNewTab";
import { cn } from "@/lib/utils";
import { getResourceUrl } from "../../api/learning.api";
import { learningKeys, useCompleteLesson, useCourseHome, useLessonDetail } from "../../api/learning.queries";
import { flatLessons, lmsErrorMessage } from "../../lib/learning";
import type { LessonDetail, LessonSummary } from "../../types";
import { CourseCurriculum } from "../CourseCurriculum";
import { LessonStage } from "./LessonStage";

type Props = { courseId: string; lessonId: string; profileSlot?: ReactNode };

const navButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-40";

/** Full-screen lesson player: stage + lesson bar + tabs on the left, course content on the right. */
export function LessonPlayerScreen({ courseId, lessonId, profileSlot }: Props) {
  const qc = useQueryClient();
  const home = useCourseHome(courseId);
  const detail = useLessonDetail(courseId, lessonId);
  const complete = useCompleteLesson(courseId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const refetchTimer = useRef<number | null>(null);

  // Heartbeats land on the server; refetch ticks shortly after the player pauses or closes.
  const refreshProgress = () => {
    if (refetchTimer.current) window.clearTimeout(refetchTimer.current);
    refetchTimer.current = window.setTimeout(() => void qc.invalidateQueries({ queryKey: learningKeys.course(courseId) }), 1500);
  };

  if (home.isLoading) {
    return <div className="flex min-h-dvh items-center justify-center bg-white text-sm text-gray-500">Loading lesson…</div>;
  }
  if (home.error || !home.data) {
    const msg = lmsErrorMessage(home.error);
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-4 text-center">
        <h1 className="text-lg font-bold text-gray-900">{msg.title}</h1>
        <p className="text-sm text-gray-600">{msg.text}</p>
        <Link href={ROUTES.courses} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Back to My Learnings
        </Link>
      </div>
    );
  }

  const course = home.data;
  const lessons = flatLessons(course);
  const index = lessons.findIndex((l) => l.id === lessonId);
  const summary = lessons[index];
  if (!summary) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white">
        <p className="text-sm text-gray-500">This lesson isn&apos;t part of the course.</p>
        <Link href={ROUTES.course(courseId)} className="text-sm font-semibold text-brand-600">
          Back to course
        </Link>
      </div>
    );
  }

  const section = course.sections.find((s) => s.lessons.some((l) => l.id === lessonId))!;
  const sectionIndex = course.sections.indexOf(section);
  const label = `Module ${sectionIndex + 1} · Lesson ${section.lessons.indexOf(summary) + 1} of ${section.lessons.length}`;
  const byId = (id: string | null | undefined) => (id ? (lessons.find((l) => l.id === id) ?? null) : null);
  const prev = byId(detail.data?.prev_lesson_id) ?? lessons[index - 1] ?? null;
  const next = byId(detail.data?.next_lesson_id) ?? lessons[index + 1] ?? null;
  const manual = detail.data?.lesson.completion_rule.type === "MANUAL";
  const completed = summary.status === "COMPLETED";
  const { progress } = course;

  const contentList = (className: string) => (
    <CourseCurriculum key={lessonId} courseId={courseId} sections={course.sections} activeLessonId={lessonId} variant="sidebar" className={className} />
  );

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:h-dvh">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href={ROUTES.course(courseId)}
            aria-label="Back to course"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <h1 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{course.course.title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2.5 sm:flex" aria-label={`${progress.completed_lessons} of ${progress.total_lessons} lessons complete`}>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress.pct}%` }} />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {progress.completed_lessons} of {progress.total_lessons} complete
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-pressed={sidebarOpen}
            className="hidden items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 lg:inline-flex"
          >
            <i className="fa-solid fa-list-ul" />
            {sidebarOpen ? "Hide content" : "Course content"}
          </button>
          {profileSlot}
        </div>
      </header>

      <div className="flex flex-1 lg:min-h-0">
        <main className="min-w-0 flex-1 lg:overflow-y-auto">
          <LessonStage
            key={`stage-${lessonId}`}
            courseId={courseId}
            summary={summary}
            detail={detail.data}
            detailError={detail.error}
            label={label}
            nextLesson={next}
            onProgressMaybeChanged={refreshProgress}
          />

          <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <h2 className="mt-0.5 text-lg font-bold leading-snug text-gray-900 sm:text-xl">{summary.title}</h2>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <LessonLink courseId={courseId} lesson={prev} label="Previous lesson" className={navButton}>
                <i className="fa-solid fa-chevron-left text-xs" />
              </LessonLink>
              {manual && (
                <button
                  type="button"
                  onClick={() => !completed && complete.mutate(lessonId)}
                  disabled={complete.isPending}
                  aria-pressed={completed}
                  className={cn(navButton, completed && "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50")}
                >
                  <i className={cn("fa-solid text-xs", completed ? "fa-circle-check" : "fa-check")} />
                  {completed ? "Completed" : complete.isPending ? "Saving…" : "Mark as complete"}
                </button>
              )}
              {!manual && completed && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <i className="fa-solid fa-circle-check text-xs" />
                  Completed
                </span>
              )}
              <LessonLink courseId={courseId} lesson={next} label="Next lesson" className={cn(navButton, "border-brand-600 bg-brand-600 text-white hover:bg-brand-700")}>
                Next
                <i className="fa-solid fa-chevron-right text-xs" />
              </LessonLink>
            </div>
          </div>
          {complete.error && <p className="px-4 pt-3 text-sm text-red-600 sm:px-6">{lmsErrorMessage(complete.error).text}</p>}

          <details className="group border-b border-gray-200 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-sm font-semibold text-gray-900 sm:px-6">
              <span>
                Course content
                <span className="ml-2 text-xs font-medium text-gray-500">
                  {progress.completed_lessons} of {progress.total_lessons} complete
                </span>
              </span>
              <i className="fa-solid fa-chevron-down text-xs text-gray-500 transition-transform group-open:rotate-180" />
            </summary>
            {contentList("max-h-[60vh] border-t border-gray-200")}
          </details>

          {detail.data && <LessonTabs key={`tabs-${lessonId}`}courseId={courseId} detail={detail.data} sectionTitle={section.title} />}
        </main>

        {sidebarOpen && (
          <aside className="hidden w-[360px] shrink-0 flex-col border-l border-gray-200 bg-white lg:flex xl:w-[400px]" aria-label="Course content">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-5">
              <h2 className="text-base font-bold text-gray-900">Course content</h2>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Hide course content"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            {contentList("min-h-0 flex-1")}
          </aside>
        )}
      </div>
    </div>
  );
}

type LessonLinkProps = { courseId: string; lesson: LessonSummary | null; label: string; className: string; children: ReactNode };

/** Previous / Next: a link, or inert at either end of the course or before a locked lesson. */
function LessonLink({ courseId, lesson, label, className, children }: LessonLinkProps) {
  if (!lesson || lesson.locked) {
    return (
      <span aria-disabled="true" aria-label={label} className={className}>
        {children}
      </span>
    );
  }
  return (
    <Link href={ROUTES.lesson(courseId, lesson.id)} aria-label={`${label}: ${lesson.title}`} className={className}>
      {children}
    </Link>
  );
}

type Tab = "overview" | "resources";

/** Overview (description) and Resources (signed links, §9.7). */
function LessonTabs({ courseId, detail, sectionTitle }: { courseId: string; detail: LessonDetail; sectionTitle: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const resources = detail.lesson.resources;
  // The tab opens inside the click (popup blockers); the signed URL (§9.7) is filled in when it arrives.
  const open = useMutation({
    mutationFn: ({ opening }: { id: string; opening: Promise<void> }) => opening,
    onSuccess: (_, { id }) => track("file_download", { file_name: resources.find((r) => r.id === id)?.title }),
  });
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    ...(resources.length > 0 ? [{ id: "resources" as const, label: "Resources", count: resources.length }] : []),
  ];

  return (
    <div>
      <div role="tablist" aria-label="Lesson details" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-gray-200 px-4 sm:px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-3.5 text-sm font-medium transition",
              tab === t.id ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-900",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none", tab === t.id ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="px-4 py-6 sm:px-6">
        {tab === "overview" ? (
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{sectionTitle}</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {detail.lesson.description || "No notes for this lesson. Have a doubt? Ask it in the Community."}
            </p>
          </div>
        ) : (
          <ul className="grid max-w-3xl gap-2.5">
            {resources.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => open.mutate({ id: r.id, opening: openInNewTab(() => getResourceUrl(courseId, detail.lesson.id, r.id)) })}
                  disabled={open.isPending && open.variables?.id === r.id}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50/50 disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <i className="fa-solid fa-file-arrow-down" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{r.title}</span>
                  <span className="text-xs font-semibold text-brand-600">{open.isPending && open.variables?.id === r.id ? "Opening…" : "Open"}</span>
                </button>
              </li>
            ))}
            {open.error && <p className="text-sm text-red-600">{lmsErrorMessage(open.error).text}</p>}
          </ul>
        )}
      </div>
    </div>
  );
}
