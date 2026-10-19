import { isApiError } from "@/lib/api";
import type { CourseHome, LessonSummary, LessonType } from "../types";

/** "26min 3s" / "1hr 4min" */
export function formatDuration(totalSec: number | null | undefined): string {
  if (!totalSec) return "";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}hr ${m}min` : m > 0 ? `${m}min${s ? ` ${s}s` : ""}` : `${s}s`;
}

export const LESSON_ICON: Record<LessonType, string> = {
  VIDEO: "fa-circle-play",
  AUDIO: "fa-headphones",
  PDF: "fa-file-pdf",
  TEXT: "fa-file-lines",
  QUIZ: "fa-clipboard-question",
  LIVE: "fa-video",
  DOWNLOAD: "fa-download",
};

export const LESSON_LABEL: Record<LessonType, string> = {
  VIDEO: "Video",
  AUDIO: "Audio",
  PDF: "PDF",
  TEXT: "Reading",
  QUIZ: "Quiz",
  LIVE: "Live class",
  DOWNLOAD: "Download",
};

export const lessonMeta = (l: Pick<LessonSummary, "type" | "duration_sec">) =>
  [LESSON_LABEL[l.type], formatDuration(l.duration_sec)].filter(Boolean).join(" • ");

/** "12 Oct, 6:00 PM" in the learner's timezone. */
export const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export const flatLessons = (home: CourseHome) => home.sections.flatMap((s) => s.lessons);

/** Where "Continue" goes: the last lesson if it's open, else the first unfinished unlocked one, else the first lesson. */
export function resumeLessonId(home: CourseHome): string | null {
  const lessons = flatLessons(home);
  const last = lessons.find((l) => l.id === home.progress.last_lesson_id && !l.locked);
  return (last ?? lessons.find((l) => !l.locked && l.status !== "COMPLETED") ?? lessons.find((l) => !l.locked))?.id ?? null;
}

/** Learner-facing text for LMS error codes (§12.3). */
export function lmsErrorMessage(error: unknown): { title: string; text: string; code?: string } {
  if (!isApiError(error)) return { title: "Something went wrong", text: "Please try again." };
  const data = (error.data ?? {}) as { unlock_at?: string; max_devices?: number; opens_at?: string };
  switch (error.code) {
    case "NO_ACCESS":
      return { code: error.code, title: "You don't have access", text: "Buy this course to watch its lessons." };
    case "ACCESS_EXPIRED":
      return { code: error.code, title: "Your access has expired", text: "Renew to continue learning where you left off." };
    case "LOCKED":
      return {
        code: error.code,
        title: "This lesson is locked",
        text: data.unlock_at ? `It opens on ${formatWhen(data.unlock_at)}.` : "Finish the previous lesson to unlock it.",
      };
    case "DEVICE_LIMIT":
      return { code: error.code, title: "Too many devices", text: `This course can be played on ${data.max_devices ?? 2} devices. Stop playback on another device and try again.` };
    case "PROVIDER_UNAVAILABLE":
      return { code: error.code, title: "Video temporarily unavailable", text: "Please try again in a minute." };
    case "NOT_FOUND":
      return { code: error.code, title: "Not found", text: "This item doesn't exist or was removed." };
    default:
      return { code: error.code, title: "Something went wrong", text: error.message };
  }
}
