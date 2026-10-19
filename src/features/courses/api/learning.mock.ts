import type { CourseHome, LessonDetail, LessonType, LibraryCard } from "../types";

/** Placeholder media for mock mode (real playback comes from VdoCipher / signed URLs). */
export const SAMPLE_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
/** Public, CORS-enabled sample PDF (Mozilla pdf.js test file). */
export const SAMPLE_PDF_URL = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

const DAY = 86_400_000;
const ARUN = { slug: "arun-pandit", display_name: "Arun Pandit", avatar_url: null };

type CourseSeed = {
  id: string;
  title: string;
  slug: string;
  description: string;
  topics: string[];
  /** Fraction of lessons already completed. */
  done: number;
  sequential: boolean;
  /** Last section opens later (drip). */
  drip?: boolean;
  expired?: boolean;
};

export const COURSE_SEEDS: CourseSeed[] = [
  {
    id: "lms-advance-numerology",
    title: "Advance Numerology Mentorship Program",
    slug: "advance-numerology-mentorship",
    description: "Go beyond Mulank and Bhagyank: Lo Shu grid, compound numbers, name and signature correction, mobile and business numerology.",
    topics: ["Foundations of the Lo Shu Grid", "Missing Numbers & Remedies", "Name Correction", "Business Numerology", "Live Doubt Sessions"],
    done: 0,
    sequential: false,
    drip: true,
  },
  {
    id: "lms-kundli-mastery",
    title: "Kundli Mastery",
    slug: "kundli-mastery",
    description: "Read any birth chart with confidence: houses, lords, aspects and dasha timing, step by step.",
    topics: ["Basics", "Houses in a chart", "Planets & lords", "Aspects", "Dasha timing"],
    done: 0.35,
    sequential: true,
  },
  {
    id: "lms-basic-numerology",
    title: "Basic Numerology Course",
    slug: "basic-numerology",
    description: "Foundations of numerology: Mulank, Bhagyank and the traits of numbers 1 to 9.",
    topics: ["What is Numerology?", "Mulank 1–9", "Bhagyank 1–9"],
    done: 1,
    sequential: false,
  },
  {
    id: "lms-palmistry",
    title: "Palmistry Level Up Course",
    slug: "palmistry-level-up",
    description: "Major and minor lines, mounts, finger types and timing events in the palm.",
    topics: ["Hand types", "Major lines", "Mounts"],
    done: 0.2,
    sequential: false,
    expired: true,
  },
];

/** Lesson pattern inside each section: video, video, notes, text, (quiz in the 2nd section). */
const PATTERN: { type: LessonType; suffix: string; sec: number | null }[] = [
  { type: "VIDEO", suffix: "", sec: 1140 },
  { type: "VIDEO", suffix: " — worked examples", sec: 1520 },
  { type: "PDF", suffix: " — notes", sec: null },
  { type: "TEXT", suffix: " — summary", sec: null },
];

export type MockLesson = { id: string; title: string; type: LessonType; duration_sec: number | null; sectionIndex: number };

export function lessonsFor(seed: CourseSeed): MockLesson[] {
  return seed.topics.flatMap((topic, s) => {
    const items = PATTERN.map((p, j) => ({ id: `${seed.id}-s${s + 1}-l${j + 1}`, title: `${topic}${p.suffix}`, type: p.type, duration_sec: p.sec, sectionIndex: s }));
    if (s === 1) items.push({ id: `${seed.id}-s${s + 1}-l5`, title: `Quiz: ${topic}`, type: "QUIZ", duration_sec: null, sectionIndex: s });
    return items;
  });
}

/** Per-course completed lessons and per-lesson positions (mutated by heartbeats / completion). */
export const mockCompleted = new Map<string, Set<string>>(
  COURSE_SEEDS.map((c) => {
    const lessons = lessonsFor(c);
    return [c.id, new Set(lessons.slice(0, Math.round(lessons.length * c.done)).map((l) => l.id))];
  }),
);
export const mockPositions = new Map<string, number>();
export const mockLastLesson = new Map<string, string>();

export function buildCourseHome(seed: CourseSeed): CourseHome {
  const lessons = lessonsFor(seed);
  const done = mockCompleted.get(seed.id)!;
  const dripAt = new Date(Date.now() + 5 * DAY).toISOString();
  let prevDone = true;
  const summaries = lessons.map((l) => {
    const drip = seed.drip && l.sectionIndex === seed.topics.length - 1;
    const sequentialLock = seed.sequential && !prevDone;
    const completed = done.has(l.id);
    prevDone = completed;
    const pos = mockPositions.get(l.id) ?? 0;
    return {
      ...l,
      is_free_preview: l.sectionIndex === 0 && l.type === "VIDEO" && l.id.endsWith("l1"),
      status: completed ? ("COMPLETED" as const) : pos > 0 ? ("IN_PROGRESS" as const) : ("NOT_STARTED" as const),
      progress_pct: completed ? 100 : l.duration_sec ? Math.round((pos / l.duration_sec) * 100) : 0,
      last_position_sec: pos,
      locked: !!drip || sequentialLock,
      lock_reason: drip ? ("DRIP" as const) : sequentialLock ? ("SEQUENTIAL" as const) : null,
      unlock_at: drip ? dripAt : null,
    };
  });
  const last = mockLastLesson.get(seed.id) ?? lessons.find((l) => !done.has(l.id))?.id ?? lessons[0].id;
  return {
    course: {
      id: seed.id,
      title: seed.title,
      description: seed.description,
      thumbnail_url: null,
      mentors: [ARUN],
      settings: { sequential_unlock: seed.sequential, max_devices: 2, certificate_enabled: true },
    },
    access: { status: seed.expired ? "EXPIRED" : "ACTIVE", expires_at: seed.expired ? new Date(Date.now() - 20 * DAY).toISOString() : null },
    progress: {
      pct: Math.round((done.size / lessons.length) * 100),
      completed_lessons: done.size,
      total_lessons: lessons.length,
      last_lesson_id: last,
      last_position_sec: mockPositions.get(last) ?? 0,
    },
    sections: seed.topics.map((t, i) => ({
      id: `${seed.id}-s${i + 1}`,
      title: `Module ${i + 1}: ${t}`,
      lessons: summaries
        .filter((l) => l.sectionIndex === i)
        .map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          duration_sec: l.duration_sec,
          is_free_preview: l.is_free_preview,
          status: l.status,
          progress_pct: l.progress_pct,
          last_position_sec: l.last_position_sec,
          locked: l.locked,
          lock_reason: l.lock_reason,
          unlock_at: l.unlock_at,
        })),
    })),
  };
}

export function buildLessonDetail(seed: CourseSeed, lessonId: string): LessonDetail | null {
  const lessons = lessonsFor(seed);
  const i = lessons.findIndex((l) => l.id === lessonId);
  if (i < 0) return null;
  const l = lessons[i];
  const done = mockCompleted.get(seed.id)!.has(l.id);
  const pos = mockPositions.get(l.id) ?? 0;
  const rule = l.type === "VIDEO" || l.type === "AUDIO" ? "WATCH_PCT" : l.type === "QUIZ" ? "QUIZ_PASS" : l.type === "LIVE" ? "ATTENDANCE" : "MANUAL";
  return {
    lesson: {
      id: l.id,
      title: l.title,
      type: l.type,
      description:
        l.type === "VIDEO"
          ? `In this lesson we cover ${l.title.toLowerCase()} with chart examples. Keep the worksheet open while you watch.`
          : l.type === "PDF"
            ? "Study notes for this module. Read them after the videos and keep them for revision."
            : null,
      duration_sec: l.duration_sec,
      text_content:
        l.type === "TEXT"
          ? `<h2>${l.title}</h2><p>This summary recaps the key ideas of the module.</p><ul><li>Revise the definitions from the videos.</li><li>Try the practice chart in the notes.</li><li>Post your doubts in the community.</li></ul><p><strong>Tip:</strong> revisit this page before the next module.</p>`
          : null,
      completion_rule: { type: rule, value: rule === "WATCH_PCT" ? 90 : null },
      resources: l.type === "VIDEO" ? [{ id: `${l.id}-r1`, title: "Worksheet (PDF)" }, { id: `${l.id}-r2`, title: "Chart examples (PDF)" }] : [],
    },
    progress: { status: done ? "COMPLETED" : pos > 0 ? "IN_PROGRESS" : "NOT_STARTED", last_position_sec: pos, progress_pct: done ? 100 : 0 },
    prev_lesson_id: lessons[i - 1]?.id ?? null,
    next_lesson_id: lessons[i + 1]?.id ?? null,
  };
}

export const PUBLICATION_SEEDS = [
  { id: "pub-kundli-handbook", title: "Kundli Reading Handbook", slug: "kundli-reading-handbook", allow_download: true },
  { id: "pub-lal-kitab", title: "108 Lal Kitab Upayas", slug: "lal-kitab-upayas", allow_download: false },
];
/** Last page read per publication. */
export const mockEbookPages = new Map<string, number>([["pub-kundli-handbook", 5]]);
/** Page count of SAMPLE_PDF_URL. */
export const SAMPLE_PDF_PAGES = 14;

/** Products enrolled through enroll-free during the session (by catalog slug). */
export const mockFreeEnrollments: LibraryCard[] = [];

export function buildLibrary(): LibraryCard[] {
  const courses: LibraryCard[] = COURSE_SEEDS.map((seed) => {
    const home = buildCourseHome(seed);
    const started = home.progress.completed_lessons > 0 || mockLastLesson.has(seed.id);
    const next = home.sections.flatMap((s) => s.lessons).find((l) => l.id === home.progress.last_lesson_id);
    const finished = home.progress.pct === 100;
    return {
      resource: { type: "COURSE", id: seed.id },
      title: seed.title,
      thumbnail_url: null,
      product_slug: seed.slug,
      access: { status: home.access.status, expires_at: home.access.expires_at, sources: ["ORDER"] },
      progress: {
        pct: home.progress.pct,
        completed_lessons: home.progress.completed_lessons,
        total_lessons: home.progress.total_lessons,
        last_lesson_id: home.progress.last_lesson_id,
        last_active_at: started ? new Date(Date.now() - DAY).toISOString() : null,
      },
      next_action: finished
        ? { type: "NONE", label: "Completed", lesson_id: null, session_id: null }
        : { type: started ? "CONTINUE" : "START", label: started ? `Continue: ${next?.title}` : "Start course", lesson_id: home.progress.last_lesson_id, session_id: null },
    };
  });
  const ebooks: LibraryCard[] = PUBLICATION_SEEDS.map((p) => {
    const page = mockEbookPages.get(p.id) ?? 0;
    return {
      resource: { type: "PUBLICATION", id: p.id },
      title: p.title,
      thumbnail_url: null,
      product_slug: p.slug,
      access: { status: "ACTIVE", expires_at: null, sources: ["ORDER"] },
      progress: { pct: Math.round((page / SAMPLE_PDF_PAGES) * 100), last_page: page, page_count: SAMPLE_PDF_PAGES },
      next_action: { type: "READ", label: page ? `Continue from page ${page}` : "Start reading", lesson_id: null, session_id: null },
    };
  });
  const at = new Date(Date.now() + 3 * DAY);
  at.setUTCHours(14, 0, 0, 0);
  const live: LibraryCard = {
    resource: { type: "LIVE_SESSION", id: "live-mega-numerology" },
    title: "Mega Numerology Masterclass",
    thumbnail_url: null,
    product_slug: "mega-numerology-masterclass",
    access: { status: "ACTIVE", expires_at: null, sources: ["ORDER"] },
    progress: { next_session: { id: "sess-1", title: "Mega Numerology Masterclass — Live", scheduled_at: at.toISOString(), join_opens_at: new Date(at.getTime() - 30 * 60_000).toISOString() } },
    next_action: { type: "WAIT", label: "Starts soon", lesson_id: null, session_id: "sess-1" },
  };
  return [...courses, ...ebooks, live, ...mockFreeEnrollments];
}
