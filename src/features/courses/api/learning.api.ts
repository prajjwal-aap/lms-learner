import { isMocked } from "@/config/features";
import { api, ApiError } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { mockDelay } from "@/lib/mockApi";
import type { AccessStatus, CourseHome, EbookSession, LessonDetail, LibraryCard, LibraryPage, LibraryTypeFilter, Playback } from "../types";
import {
  buildCourseHome,
  buildLessonDetail,
  buildLibrary,
  COURSE_SEEDS,
  mockCompleted,
  mockEbookPages,
  mockFreeEnrollments,
  mockLastLesson,
  mockPositions,
  PUBLICATION_SEEDS,
  SAMPLE_PDF_PAGES,
  SAMPLE_PDF_URL,
  SAMPLE_VIDEO_URL,
} from "./learning.mock";
import { normalizeCourseHome, normalizeEbook, normalizeLessonDetail, normalizeLibraryCard } from "./learning.normalize";

const mocked = () => isMocked("courses");
const seedOf = (courseId: string) => COURSE_SEEDS.find((c) => c.id === courseId);
const notFound = () => new ApiError(404, "Not found", "NOT_FOUND");

export type LibraryQuery = { type?: LibraryTypeFilter; status?: AccessStatus };

const TYPE_OF: Record<LibraryTypeFilter, LibraryCard["resource"]["type"]> = { COURSE: "COURSE", EBOOK: "PUBLICATION", LIVE: "LIVE_SESSION" };

/** GET /lms/v1/me/library (§9.2), cursor-paginated. */
export async function listLibrary(query: LibraryQuery, cursor?: string, limit = 24): Promise<LibraryPage> {
  if (mocked()) {
    await mockDelay();
    const status = query.status ?? "ACTIVE";
    const items = buildLibrary().filter((c) => c.access.status === status && (!query.type || c.resource.type === TYPE_OF[query.type]));
    return { items, next_cursor: null };
  }
  const data = await api.get<{ items?: unknown[]; data?: unknown[]; next_cursor?: string | null } | unknown[] | null>("/lms/v1/me/library", {
    query: { ...query, limit, cursor },
  });
  // Accept `{items}`, `{data}` or a bare array so a shape drift doesn't silently empty the page.
  const rows = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
  return {
    items: rows.map((c) => normalizeLibraryCard(c as Record<string, unknown>)).filter((c) => c.resource.id),
    next_cursor: Array.isArray(data) ? null : (data?.next_cursor ?? null),
  };
}

type OrderRow = { id?: string; status?: string; createdAt?: string };
type DeliveredRow = {
  id?: string;
  productId?: string;
  titleSnapshot?: string;
  bundleTitleSnapshot?: string;
  productType?: string;
  status?: string;
  downloadUrl?: string | null;
  /** Product image captured at purchase time. */
  mediaSnapshot?: string | null;
  classDate?: string | null;
  replayUrl?: string | null;
  workbookUrl?: string | null;
};
type DeliveredDto = Partial<Record<"courses" | "ebooks" | "webinars" | "masterclasses" | "bundles", DeliveredRow[]>>;

/** Orders that granted access (failed / refunded / unpaid orders don't). */
const PAID = new Set(["PAID", "FULFILLED"]);
const RESOURCE_OF: Record<keyof DeliveredDto, LibraryCard["resource"]["type"]> = {
  courses: "COURSE",
  bundles: "COURSE",
  ebooks: "PUBLICATION",
  webinars: "LIVE_SESSION",
  masterclasses: "LIVE_SESSION",
};

/**
 * Purchases from orders (§8.1 + §8.3). Until the LMS launch, bought content is listed per order and not in
 * GET /lms/v1/me/library, so My Learnings merges both. Matched to catalog products (same id) for slug + thumbnail.
 */
export async function listPurchasedContent(): Promise<LibraryCard[]> {
  if (mocked()) return [];
  const list = await api.get<{ data?: OrderRow[] } | null>("/og-order", { query: { page: 1, limit: 50 } });
  const orders = (Array.isArray(list?.data) ? list.data : []).filter((o) => o.id && PAID.has(String(o.status)));
  if (orders.length === 0) return [];

  // Dynamic import: catalog pages import this feature, so a static import would be circular.
  const { listProducts } = await import("@/features/catalog");
  const [details, catalog] = await Promise.all([
    Promise.all(orders.map((o) => api.get<DeliveredDto | null>(`/og-order/${encodeURIComponent(o.id!)}/product-details`).then((d) => ({ order: o, d })).catch(() => null))),
    listProducts({}, undefined, 50).then((p) => p.items).catch(() => []),
  ]);
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const seen = new Set<string>();
  const cards: LibraryCard[] = [];
  for (const entry of details) {
    if (!entry?.d) continue;
    for (const key of Object.keys(RESOURCE_OF) as (keyof DeliveredDto)[]) {
      for (const row of entry.d[key] ?? []) {
        const productId = String(row.productId ?? row.id ?? "");
        if (!productId || seen.has(productId) || (row.status && !PAID.has(row.status) && row.status !== "FULFILLMENT_PENDING")) continue;
        seen.add(productId);
        const product = byId.get(productId);
        const type = RESOURCE_OF[key];
        cards.push({
          resource: { type, id: productId },
          title: row.titleSnapshot || row.bundleTitleSnapshot || product?.title || "Purchased item",
          thumbnail_url: product?.thumbnail_url ?? row.mediaSnapshot ?? null,
          product_slug: product?.slug ?? null,
          access: { status: "ACTIVE", expires_at: null, sources: ["ORDER"] },
          progress: {},
          next_action: { type: type === "PUBLICATION" ? "READ" : type === "LIVE_SESSION" ? "WAIT" : "START", label: null, lesson_id: null, session_id: null },
          purchase: {
            orderId: entry.order.id!,
            productId,
            downloadUrl: row.downloadUrl ?? null,
            classDate: row.classDate ?? null,
            replayUrl: row.replayUrl ?? null,
            workbookUrl: row.workbookUrl ?? null,
          },
        });
      }
    }
  }
  return cards;
}

/** GET /lms/v1/me/library/continue (§9.3) — most recently used active course. */
export async function getContinueLearning(): Promise<LibraryCard | null> {
  if (mocked()) {
    await mockDelay();
    return buildLibrary().find((c) => c.resource.type === "COURSE" && c.access.status === "ACTIVE" && c.next_action.type === "CONTINUE") ?? null;
  }
  const data = await api.get<{ item?: Record<string, unknown> | null }>("/lms/v1/me/library/continue");
  return data?.item ? normalizeLibraryCard(data.item) : null;
}

/** GET /lms/v1/me/courses/:courseId (§9.4). Throws ApiError NO_ACCESS / ACCESS_EXPIRED / NOT_FOUND. */
export async function getCourseHome(courseId: string): Promise<CourseHome> {
  if (mocked()) {
    await mockDelay();
    const seed = seedOf(courseId);
    if (!seed) throw notFound();
    if (seed.expired) throw new ApiError(403, "Your access to this course has expired", "ACCESS_EXPIRED");
    return buildCourseHome(seed);
  }
  return normalizeCourseHome(await api.get<Record<string, unknown>>(`/lms/v1/me/courses/${encodeURIComponent(courseId)}`));
}

/** GET /lms/v1/me/courses/:courseId/lessons/:lessonId (§9.5). Throws LOCKED with `data.unlock_at`. */
export async function getLessonDetail(courseId: string, lessonId: string): Promise<LessonDetail> {
  if (mocked()) {
    await mockDelay();
    const seed = seedOf(courseId);
    const detail = seed && buildLessonDetail(seed, lessonId);
    if (!seed || !detail) throw notFound();
    const summary = buildCourseHome(seed).sections.flatMap((s) => s.lessons).find((l) => l.id === lessonId)!;
    if (summary.locked) {
      throw new ApiError(
        403,
        summary.lock_reason === "DRIP" ? "This lesson isn't open yet" : "Finish the previous lesson to unlock this one",
        "LOCKED",
        undefined,
        { lock_reason: summary.lock_reason, unlock_at: summary.unlock_at },
      );
    }
    mockLastLesson.set(courseId, lessonId);
    return detail;
  }
  return normalizeLessonDetail(await api.get<Record<string, unknown>>(`/lms/v1/me/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`));
}

/** POST …/playback (§9.6). Tokens last 5 minutes — call right before playing. */
export async function startPlayback(courseId: string, lessonId: string): Promise<Playback> {
  if (mocked()) {
    await mockDelay(200);
    const detail = buildLessonDetail(seedOf(courseId)!, lessonId)!;
    const watermark_text = "98******10";
    if (detail.lesson.type === "PDF" || detail.lesson.type === "DOWNLOAD") return { provider: "SIGNED_URL", url: SAMPLE_PDF_URL, expires_in_sec: 300, watermark_text };
    return { provider: "MOCK_MEDIA", url: SAMPLE_VIDEO_URL, expires_in_sec: 300, resume_at_sec: mockPositions.get(lessonId) ?? 0, watermark_text };
  }
  const p = await api.post<Partial<Record<string, unknown>> | null>(
    `/lms/v1/me/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/playback`,
    { device_id: getDeviceId() },
  );
  const watermark_text = typeof p?.watermark_text === "string" ? p.watermark_text : "";
  const expires_in_sec = typeof p?.expires_in_sec === "number" ? p.expires_in_sec : 300;
  const resume_at_sec = typeof p?.resume_at_sec === "number" ? p.resume_at_sec : 0;
  if (p?.provider === "VDOCIPHER" && typeof p.otp === "string" && typeof p.playback_info === "string") {
    return { provider: "VDOCIPHER", otp: p.otp, playback_info: p.playback_info, resume_at_sec, expires_in_sec, watermark_text };
  }
  // `hls_url_web` is the browser stream; `hls_url` is the app one, kept as a fallback.
  const hls = typeof p?.hls_url_web === "string" && p.hls_url_web ? p.hls_url_web : p?.hls_url;
  if (p?.provider === "DYNTUBE" && typeof hls === "string" && hls) return { provider: "DYNTUBE", url: hls, resume_at_sec, expires_in_sec, watermark_text };
  if (p?.provider === "SIGNED_URL" && typeof p.url === "string") return { provider: "SIGNED_URL", url: p.url, expires_in_sec, watermark_text };
  throw new Error("This lesson can't be played right now. Please try again later.");
}

/** POST …/resources/:resourceId/url (§9.7) — short-lived signed link. */
export async function getResourceUrl(courseId: string, lessonId: string, resourceId: string): Promise<string> {
  if (mocked()) {
    await mockDelay(150);
    return SAMPLE_PDF_URL;
  }
  const { url } = await api.post<{ url: string }>(
    `/lms/v1/me/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/resources/${encodeURIComponent(resourceId)}/url`,
  );
  return url;
}

export type Heartbeat = { course_id: string; lesson_id: string; position_sec: number; delta_sec: number; playback_rate: number };

/** POST /lms/v1/me/progress/heartbeat (§9.8). Never retried; a 429 is simply skipped. */
export async function sendHeartbeat(beat: Heartbeat, durationSec?: number | null): Promise<void> {
  const body = { ...beat, tick_id: crypto.randomUUID(), delta_sec: Math.max(0, Math.min(60, Math.round(beat.delta_sec))), position_sec: Math.floor(beat.position_sec) };
  if (mocked()) {
    mockPositions.set(beat.lesson_id, body.position_sec);
    // Server rule: complete at ≥ 90 % watched.
    if (durationSec && body.position_sec >= durationSec * 0.9) mockCompleted.get(beat.course_id)?.add(beat.lesson_id);
    return;
  }
  await api.post("/lms/v1/me/progress/heartbeat", body).catch(() => undefined);
}

/** POST /lms/v1/me/lessons/:lessonId/complete (§9.9) — MANUAL lessons (text, PDF, downloads). */
export async function completeLesson(courseId: string, lessonId: string): Promise<void> {
  if (mocked()) {
    await mockDelay(150);
    mockCompleted.get(courseId)?.add(lessonId);
    return;
  }
  await api.post(`/lms/v1/me/lessons/${encodeURIComponent(lessonId)}/complete`, { course_id: courseId });
}

/** POST /lms/v1/me/publications/:id/open (§9.10). */
export async function openEbook(publicationId: string): Promise<EbookSession> {
  if (mocked()) {
    await mockDelay(200);
    const pub = PUBLICATION_SEEDS.find((p) => p.id === publicationId);
    if (!pub) throw notFound();
    return { url: SAMPLE_PDF_URL, expires_in_sec: 300, watermark_text: "98******10", last_page: mockEbookPages.get(pub.id) ?? 1, page_count: SAMPLE_PDF_PAGES, allow_download: pub.allow_download };
  }
  return normalizeEbook(await api.post<Record<string, unknown>>(`/lms/v1/me/publications/${encodeURIComponent(publicationId)}/open`, { device_id: getDeviceId() }));
}

/** POST …/progress (§9.10) — the page the reader is on. */
export async function saveEbookPage(publicationId: string, page: number): Promise<void> {
  if (mocked()) {
    mockEbookPages.set(publicationId, page);
    return;
  }
  await api.post(`/lms/v1/me/publications/${encodeURIComponent(publicationId)}/progress`, { page }).catch(() => undefined);
}

/** POST …/download (§9.10) — signed attachment URL; 403 DOWNLOAD_NOT_ALLOWED when the publisher disabled it. */
export async function downloadEbook(publicationId: string): Promise<string> {
  if (mocked()) {
    await mockDelay(200);
    return SAMPLE_PDF_URL;
  }
  const { url } = await api.post<{ url: string }>(`/lms/v1/me/publications/${encodeURIComponent(publicationId)}/download`);
  return url;
}

/** POST /lms/v1/me/products/:productId/enroll-free (§9.11). Safe to call twice. */
export async function enrollFree(productId: string): Promise<void> {
  if (mocked()) {
    await mockDelay(300);
    // Dynamic import: catalog pages import this feature, so a static import would be circular.
    const { listProducts } = await import("@/features/catalog");
    const p = (await listProducts({}, undefined, 50)).items.find((x) => x.id === productId);
    if (!p || !p.price.is_free) throw new ApiError(400, "This product isn't free", "NOT_FREE");
    if (!mockFreeEnrollments.some((c) => c.product_slug === p.slug)) {
      mockFreeEnrollments.push({
        resource: { type: p.type === "EBOOK" ? "PUBLICATION" : p.type === "WEBINAR" || p.type === "MASTERCLASS" ? "LIVE_SESSION" : "COURSE", id: `free-${p.id}` },
        title: p.title,
        thumbnail_url: p.thumbnail_url,
        product_slug: p.slug,
        access: { status: "ACTIVE", expires_at: null, sources: ["FREE"] },
        progress: { pct: 0, completed_lessons: 0, total_lessons: 0 },
        next_action: { type: "START", label: "Start", lesson_id: null, session_id: null },
      });
    }
    return;
  }
  await api.post(`/lms/v1/me/products/${encodeURIComponent(productId)}/enroll-free`);
}
