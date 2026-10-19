import type { CourseHome, EbookSession, LessonDetail, LessonSummary, LessonType, LibraryCard } from "../types";

/**
 * The LMS APIs are a 🟡 contract still being built; the live responses may omit blocks or send nulls.
 * Normalise them so screens can rely on the types (the catalog already showed `page: null` where the contract has an object).
 */

type Raw = Record<string, unknown> | null | undefined;
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const arr = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);
const str = (v: unknown): string | null => (typeof v === "string" && v ? v : null);
const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

const LESSON_TYPES: LessonType[] = ["VIDEO", "AUDIO", "PDF", "TEXT", "QUIZ", "LIVE", "DOWNLOAD"];
const lessonType = (v: unknown): LessonType => (LESSON_TYPES.includes(v as LessonType) ? (v as LessonType) : "VIDEO");

export function normalizeLibraryCard(raw: Raw): LibraryCard {
  const r = obj(raw);
  // Tolerate flat shapes ({type, id} / {resource_type, resource_id}) as well as the contract's nested `resource`.
  const nested = obj(r.resource);
  const resource = { type: nested.type ?? r.resource_type ?? r.type, id: nested.id ?? r.resource_id ?? r.course_id ?? r.id };
  const access = obj(r.access);
  const action = obj(r.next_action);
  const progress = obj(r.progress);
  return {
    resource: { type: (resource.type as LibraryCard["resource"]["type"]) ?? "COURSE", id: String(resource.id ?? "") },
    title: str(r.title) ?? "Untitled",
    thumbnail_url: str(r.thumbnail_url),
    product_slug: str(r.product_slug),
    access: { status: access.status === "EXPIRED" ? "EXPIRED" : "ACTIVE", expires_at: str(access.expires_at), sources: arr(access.sources) as unknown as string[] },
    progress: { ...progress, pct: num(progress.pct) } as LibraryCard["progress"],
    next_action: {
      type: (action.type as LibraryCard["next_action"]["type"]) ?? "NONE",
      label: str(action.label),
      lesson_id: str(action.lesson_id),
      session_id: str(action.session_id),
    },
  };
}

function normalizeLesson(raw: Raw): LessonSummary {
  const l = obj(raw);
  return {
    id: String(l.id ?? ""),
    title: str(l.title) ?? "Lesson",
    type: lessonType(l.type),
    duration_sec: num(l.duration_sec) > 0 ? num(l.duration_sec) : null,
    is_free_preview: l.is_free_preview === true,
    status: (l.status as LessonSummary["status"]) ?? "NOT_STARTED",
    progress_pct: num(l.progress_pct),
    last_position_sec: num(l.last_position_sec),
    locked: l.locked === true,
    lock_reason: (l.lock_reason as LessonSummary["lock_reason"]) ?? null,
    unlock_at: str(l.unlock_at),
  };
}

export function normalizeCourseHome(raw: Raw): CourseHome {
  const r = obj(raw);
  const course = obj(r.course);
  const settings = obj(course.settings);
  const access = obj(r.access);
  const progress = obj(r.progress);
  const sections = arr(r.sections).map((s) => ({ id: String(s.id ?? ""), title: str(s.title) ?? "Module", lessons: arr(s.lessons).map(normalizeLesson) }));
  const total = sections.reduce((n, s) => n + s.lessons.length, 0);
  const done = sections.reduce((n, s) => n + s.lessons.filter((l) => l.status === "COMPLETED").length, 0);
  return {
    course: {
      id: String(course.id ?? ""),
      title: str(course.title) ?? "Course",
      description: str(course.description),
      thumbnail_url: str(course.thumbnail_url),
      mentors: arr(course.mentors).map((m) => ({ slug: String(m.slug ?? ""), display_name: str(m.display_name) ?? "Mentor", avatar_url: str(m.avatar_url) })),
      settings: { sequential_unlock: settings.sequential_unlock === true, max_devices: num(settings.max_devices, 2), certificate_enabled: settings.certificate_enabled === true },
    },
    access: { status: access.status === "EXPIRED" ? "EXPIRED" : "ACTIVE", expires_at: str(access.expires_at) },
    progress: {
      pct: num(progress.pct, total ? Math.round((done / total) * 100) : 0),
      completed_lessons: num(progress.completed_lessons, done),
      total_lessons: num(progress.total_lessons, total),
      last_lesson_id: str(progress.last_lesson_id),
      last_position_sec: num(progress.last_position_sec),
    },
    sections,
  };
}

export function normalizeLessonDetail(raw: Raw): LessonDetail {
  const r = obj(raw);
  const lesson = obj(r.lesson);
  const rule = obj(lesson.completion_rule);
  const progress = obj(r.progress);
  const type = lessonType(lesson.type);
  const defaultRule = type === "VIDEO" || type === "AUDIO" ? "WATCH_PCT" : "MANUAL";
  return {
    lesson: {
      id: String(lesson.id ?? ""),
      title: str(lesson.title) ?? "Lesson",
      type,
      description: str(lesson.description),
      duration_sec: num(lesson.duration_sec) > 0 ? num(lesson.duration_sec) : null,
      text_content: str(lesson.text_content),
      completion_rule: { type: (rule.type as LessonDetail["lesson"]["completion_rule"]["type"]) ?? defaultRule, value: typeof rule.value === "number" ? rule.value : null },
      resources: arr(lesson.resources).map((x) => ({ id: String(x.id ?? ""), title: str(x.title) ?? "Resource" })),
    },
    progress: { status: (progress.status as LessonDetail["progress"]["status"]) ?? "NOT_STARTED", last_position_sec: num(progress.last_position_sec), progress_pct: num(progress.progress_pct) },
    prev_lesson_id: str(r.prev_lesson_id),
    next_lesson_id: str(r.next_lesson_id),
  };
}

export function normalizeEbook(raw: Raw): EbookSession {
  const r = obj(raw);
  const url = str(r.url);
  if (!url) throw new Error("This e-book isn't available right now.");
  return {
    url,
    expires_in_sec: num(r.expires_in_sec, 300),
    watermark_text: str(r.watermark_text) ?? "",
    last_page: Math.max(1, num(r.last_page, 1)),
    page_count: num(r.page_count),
    allow_download: r.allow_download === true,
  };
}
