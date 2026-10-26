/** My Learning contract (OG_APP_API_REFERENCE §9). */

export type LibraryResourceType = "COURSE" | "PUBLICATION" | "LIVE_SESSION";
/** `type` filter of GET /lms/v1/me/library. */
export type LibraryTypeFilter = "COURSE" | "EBOOK" | "LIVE";
export type AccessStatus = "ACTIVE" | "EXPIRED";

export type NextAction = {
  type: "START" | "CONTINUE" | "READ" | "JOIN" | "WAIT" | "WATCH_REPLAY" | "NONE";
  label: string | null;
  lesson_id: string | null;
  session_id: string | null;
};

/** Progress differs by resource type; all fields optional so one shape covers all three. */
export type LibraryProgress = {
  pct?: number;
  // COURSE
  completed_lessons?: number;
  total_lessons?: number;
  last_lesson_id?: string | null;
  last_active_at?: string | null;
  // PUBLICATION
  last_page?: number;
  page_count?: number;
  // LIVE_SESSION
  next_session?: { id: string; title: string; scheduled_at: string; join_opens_at: string } | null;
};

export type LibraryCard = {
  resource: { type: LibraryResourceType; id: string };
  title: string;
  thumbnail_url: string | null;
  product_slug: string | null;
  access: { status: AccessStatus; expires_at: string | null; sources: string[] };
  progress: LibraryProgress;
  next_action: NextAction;
  /**
   * Set when the item comes from a paid order (GET /og-order/:id/product-details, §8.3) rather than the LMS
   * library — purchases made before the LMS launch only exist there.
   */
  purchase?: {
    orderId: string;
    productId: string;
    /** Ebooks: direct download link from the order. */
    downloadUrl?: string | null;
    /** Live classes: slot ("YYYY-MM-DD HH:mm:ss.SSS" IST), replay and workbook links. */
    classDate?: string | null;
    replayUrl?: string | null;
    workbookUrl?: string | null;
  };
};

export type LibraryPage = { items: LibraryCard[]; next_cursor: string | null };

export type LessonType = "VIDEO" | "AUDIO" | "PDF" | "TEXT" | "QUIZ" | "LIVE" | "DOWNLOAD";
export type LessonStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type LockReason = "SEQUENTIAL" | "DRIP" | null;

export type LessonSummary = {
  id: string;
  title: string;
  type: LessonType;
  duration_sec: number | null;
  is_free_preview: boolean;
  status: LessonStatus;
  progress_pct: number;
  last_position_sec: number;
  locked: boolean;
  lock_reason: LockReason;
  unlock_at: string | null;
};

export type CourseSection = { id: string; title: string; lessons: LessonSummary[] };

export type CourseHome = {
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    mentors: { slug: string; display_name: string; avatar_url: string | null }[];
    settings: { sequential_unlock: boolean; max_devices: number; certificate_enabled: boolean };
  };
  access: { status: AccessStatus; expires_at: string | null };
  progress: { pct: number; completed_lessons: number; total_lessons: number; last_lesson_id: string | null; last_position_sec: number };
  sections: CourseSection[];
};

export type LessonDetail = {
  lesson: {
    id: string;
    title: string;
    type: LessonType;
    description: string | null;
    duration_sec: number | null;
    /** HTML, TEXT lessons only. */
    text_content: string | null;
    completion_rule: { type: "WATCH_PCT" | "MANUAL" | "QUIZ_PASS" | "ATTENDANCE"; value: number | null };
    resources: { id: string; title: string }[];
  };
  progress: { status: LessonStatus; last_position_sec: number; progress_pct: number };
  prev_lesson_id: string | null;
  next_lesson_id: string | null;
};

export type Playback =
  | { provider: "VDOCIPHER"; otp: string; playback_info: string; expires_in_sec: number; resume_at_sec: number; watermark_text: string }
  /** DynTube HLS stream (.m3u8), played in our own <video> via hls.js. */
  | { provider: "DYNTUBE"; url: string; expires_in_sec: number; resume_at_sec: number; watermark_text: string }
  | { provider: "SIGNED_URL"; url: string; expires_in_sec: number; watermark_text: string }
  /** Mock mode only: a plain media URL for the native <video> player. */
  | { provider: "MOCK_MEDIA"; url: string; expires_in_sec: number; resume_at_sec: number; watermark_text: string };

export type EbookSession = {
  url: string;
  expires_in_sec: number;
  watermark_text: string;
  last_page: number;
  page_count: number;
  allow_download: boolean;
};
