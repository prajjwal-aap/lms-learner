"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { track } from "@/lib/analytics";
import { openInNewTab } from "@/lib/openInNewTab";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { startPlayback } from "../../api/learning.api";
import { formatDuration, lmsErrorMessage, LESSON_ICON } from "../../lib/learning";
import type { LessonDetail, LessonSummary } from "../../types";
import { PdfViewer } from "../PdfViewer";
import { VideoPlayer } from "./VideoPlayer";

type Props = {
  courseId: string;
  summary: LessonSummary;
  detail: LessonDetail | undefined;
  detailError: unknown;
  /** "Module 1 · Lesson 2 of 5" */
  label: string;
  nextLesson: LessonSummary | null;
  onProgressMaybeChanged: () => void;
};

/** The area above the lesson bar, chosen by lesson type. */
export function LessonStage({ courseId, summary, detail, detailError, label, nextLesson, onProgressMaybeChanged }: Props) {
  if (detailError) {
    const msg = lmsErrorMessage(detailError);
    return (
      <StageCard icon={msg.code === "LOCKED" ? "fa-lock" : "fa-triangle-exclamation"}>
        <p className="text-lg font-semibold text-white">{msg.title}</p>
        <p className="mt-1 max-w-md text-sm text-white/70">{msg.text}</p>
      </StageCard>
    );
  }
  if (!detail) return <div className="aspect-video max-h-[70vh] w-full animate-pulse bg-gray-900" aria-busy="true" />;

  switch (detail.lesson.type) {
    case "VIDEO":
    case "AUDIO":
      return (
        <MediaStage
          key={summary.id}
          courseId={courseId}
          detail={detail}
          label={label}
          nextLesson={nextLesson}
          onProgressMaybeChanged={onProgressMaybeChanged}
        />
      );
    case "PDF":
      return <PdfStage courseId={courseId} lessonId={summary.id} />;
    case "DOWNLOAD":
      return <DownloadStage courseId={courseId} detail={detail} />;
    case "TEXT":
      return <TextStage html={detail.lesson.text_content ?? ""} />;
    case "LIVE":
      return (
        <StageCard icon="fa-video">
          <p className="text-lg font-semibold text-white">{detail.lesson.title}</p>
          <p className="mt-1 text-sm text-white/70">This lesson is a live class. Join it from Live Sessions when it starts.</p>
          <Link href={ROUTES.liveSessions} className="mt-5 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            Go to Live Sessions
          </Link>
        </StageCard>
      );
    default:
      return (
        <StageCard icon="fa-clipboard-question">
          <p className="text-lg font-semibold text-white">{detail.lesson.title}</p>
          <p className="mt-1 text-sm text-white/70">Quizzes are coming soon.</p>
        </StageCard>
      );
  }
}

function StageCard({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="hero-gradient relative flex min-h-[320px] w-full flex-col items-center justify-center overflow-hidden px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />
      <div className="relative flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
          <i className={cn("fa-solid text-xl text-amber-300", icon)} />
        </div>
        {children}
      </div>
    </div>
  );
}

/** Start screen → playback token (fetched on click, valid 5 min) → player → "up next". */
function MediaStage({ courseId, detail, label, nextLesson, onProgressMaybeChanged }: Omit<Props, "summary" | "detailError"> & { detail: LessonDetail }) {
  const lesson = detail.lesson;
  const [ended, setEnded] = useState(false);
  const play = useMutation({ mutationFn: () => startPlayback(courseId, lesson.id) });
  const playback = play.data && play.data.provider !== "SIGNED_URL" ? play.data : null;

  if (playback) {
    return (
      <div className="relative">
        <VideoPlayer
          playback={playback}
          courseId={courseId}
          lessonId={lesson.id}
          title={lesson.title}
          durationSec={lesson.duration_sec}
          onEnded={() => setEnded(true)}
          onProgressMaybeChanged={onProgressMaybeChanged}
        />
        {ended && nextLesson && !nextLesson.locked && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900 px-4 py-3 text-sm text-white sm:px-6">
            <span className="min-w-0 truncate">
              <span className="text-white/60">Up next:</span> {nextLesson.title}
            </span>
            <Link href={ROUTES.lesson(courseId, nextLesson.id)} className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-700">
              Next lesson <i className="fa-solid fa-arrow-right ml-1 text-xs" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  const err = play.error ? lmsErrorMessage(play.error) : null;
  const resumeAt = detail.progress.last_position_sec;
  return (
    <div className="hero-gradient relative flex aspect-video max-h-[70vh] w-full flex-col items-center justify-center gap-5 overflow-hidden px-6 text-center">
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />
      <span className="relative flex flex-col items-center">
        <span className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">{label}</span>
        <span className="max-w-2xl text-lg font-bold leading-snug text-white sm:text-2xl">{lesson.title}</span>
      </span>
      {err ? (
        <span className="relative max-w-md rounded-lg bg-black/40 px-4 py-3 text-sm text-white">
          <strong className="block">{err.title}</strong>
          {err.text}
          <button type="button" onClick={() => play.mutate()} className="mt-2 block w-full font-semibold text-amber-300 hover:underline">
            Try again
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => play.mutate()}
          disabled={play.isPending}
          aria-label={`Play ${lesson.title}`}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:scale-110 hover:bg-brand-600 disabled:opacity-70 sm:h-20 sm:w-20"
        >
          <i className={cn("fa-solid text-2xl sm:text-3xl", play.isPending ? "fa-spinner animate-spin" : lesson.type === "AUDIO" ? "fa-headphones" : "fa-play translate-x-0.5")} />
        </button>
      )}
      <span className="relative text-xs font-medium text-white/70">
        {resumeAt > 5 && detail.progress.status !== "COMPLETED" ? `Resume from ${formatDuration(resumeAt)}` : formatDuration(lesson.duration_sec)}
      </span>
    </div>
  );
}

/** PDF lesson: signed URL from the playback call, shown in the in-app reader with the watermark. */
function PdfStage({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["learning", "playback", lessonId],
    queryFn: () => startPlayback(courseId, lessonId),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
  if (isLoading) return <div className="h-[75vh] w-full animate-pulse bg-gray-100" aria-busy="true" />;
  if (error || !data || data.provider !== "SIGNED_URL") {
    const msg = lmsErrorMessage(error);
    return (
      <StageCard icon="fa-file-pdf">
        <p className="text-lg font-semibold text-white">{msg.title}</p>
        <p className="mt-1 max-w-md text-sm text-white/70">{msg.text}</p>
      </StageCard>
    );
  }
  return <PdfViewer url={data.url} watermark={data.watermark_text} className="h-[75vh]" />;
}

/** DOWNLOAD lesson: a fresh signed link per click (links expire after 5 minutes). */
function DownloadStage({ courseId, detail }: { courseId: string; detail: LessonDetail }) {
  // The tab opens inside the click (popup blockers); the signed URL is filled in when it arrives.
  const download = useMutation({
    mutationFn: (opening: Promise<void>) => opening,
    onSuccess: () => track("file_download", { file_name: detail.lesson.title }),
  });
  const signedUrl = async () => {
    const p = await startPlayback(courseId, detail.lesson.id);
    if (p.provider !== "SIGNED_URL") throw new Error("This file isn't available for download.");
    return p.url;
  };
  return (
    <StageCard icon={LESSON_ICON.DOWNLOAD}>
      <p className="text-lg font-semibold text-white">{detail.lesson.title}</p>
      {detail.lesson.description && <p className="mt-1 max-w-md text-sm text-white/70">{detail.lesson.description}</p>}
      <button
        type="button"
        onClick={() => download.mutate(openInNewTab(signedUrl))}
        disabled={download.isPending}
        className="mt-5 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
      >
        <i className="fa-solid fa-download mr-2" />
        {download.isPending ? "Preparing…" : "Download file"}
      </button>
      {download.error && <p className="mt-2 text-xs text-red-200">{lmsErrorMessage(download.error).text}</p>}
    </StageCard>
  );
}

function TextStage({ html }: { html: string }) {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  return (
    <article
      className="mx-auto w-full max-w-3xl px-4 py-8 text-[15px] leading-relaxed text-gray-800 sm:px-6 [&_a]:text-brand-600 [&_a]:underline [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
