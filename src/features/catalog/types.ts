/** Catalog contract (OG_APP_API_REFERENCE §5). Money is in paise with ready-to-show `*_display` strings. */

export type ProductType = "COURSE" | "BUNDLE" | "EBOOK" | "WEBINAR" | "MASTERCLASS";
export type Language = "HINDI" | "ENGLISH" | "HINGLISH";
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";
export type CatalogSort = "popular" | "new" | "price_asc" | "price_desc";

export type MentorRef = { slug: string; display_name: string; avatar_url: string | null };

export type Price = {
  plan_id: string;
  plan_type: "ONE_TIME" | "FREE";
  currency: string;
  price_paise: number;
  mrp_paise: number;
  price_display: string;
  mrp_display: string;
  is_free: boolean;
};

export type ProductCard = {
  id: string;
  slug: string;
  type: ProductType;
  title: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  language: Language | null;
  level: Level | null;
  mentors: MentorRef[];
  price: Price;
  /** Next live slot (WEBINAR / MASTERCLASS). */
  next_session_at: string | null;
  badges: string[];
  // Extras the live API sends beyond the §5.1 contract (all optional).
  rating?: { avg: number; count: number; count_display: string | null } | null;
  lesson_count?: number | null;
  duration_sec?: number | null;
  enrolled_display?: string | null;
};

export type Category = { id: string; slug: string; name: string; icon_url: string | null; parent_id: string | null; sort_order: number };

export type Plan = {
  id: string;
  name: string;
  type: "ONE_TIME" | "FREE";
  currency: string;
  price_paise: number;
  mrp_paise: number;
  price_display: string;
  mrp_display: string;
  validity: { type: "LIFETIME" | "DAYS" | "FIXED_END" | "UNTIL_EVENT_END"; days: number | null; end_date: string | null };
  includes: { live: boolean; recordings: boolean; certificate: boolean; community: boolean };
  /** Set = this plan is for one specific live slot. */
  session_id: string | null;
  batch_id: string | null;
  is_default: boolean;
  sale_ends_at: string | null;
};

export type CurriculumLesson = { id: string; title: string; type: string; duration_sec: number | null; is_free_preview: boolean };
export type Curriculum = {
  section_count: number;
  lesson_count: number;
  total_duration_sec: number;
  sections: { id: string; title: string; lessons: CurriculumLesson[] }[];
};

export type UpcomingSession = {
  id: string;
  title: string;
  scheduled_at: string;
  duration_min: number;
  timezone: string;
  seats_left: number | null;
  registration_open: boolean;
  plan_id: string | null;
};

export type PageSection = { type: string; title: string | null; data: { html?: string } & Record<string, unknown>; sort_order: number };

export type ProductPage = {
  product: ProductCard & {
    short_description: string | null;
    banner_url: string | null;
    categories: { slug: string; name: string }[];
    tags: string[];
    /** Live API extras: long description and "what's included" bullets. */
    description?: string | null;
    includes?: { icon: string; label: string }[];
  };
  page: {
    hero: { headline: string | null; subheadline: string | null; video_url: string | null; cta_text: string | null } | null;
    outcomes: string[];
    who_is_it_for: string[];
    requirements: string[];
    sections: PageSection[];
    testimonials: { name: string; text: string; rating: number | null; avatar_url: string | null; video_url: string | null }[];
    faqs: { q: string; a: string }[];
  };
  plans: Plan[];
  curriculum: Curriculum | null;
  bundle_items: ProductCard[] | null;
  publication: { page_count: number; allow_download: boolean } | null;
  upcoming_sessions: UpcomingSession[] | null;
};

export type Mentor = {
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  expertise: string[];
  languages: string[];
  experience_years: number | null;
  stats: { learner_count: number; product_count: number; rating_avg: number | null };
};

export type ProductFilters = {
  type?: ProductType;
  category?: string;
  language?: Language;
  q?: string;
  sort?: CatalogSort;
};

export type ProductList = { items: ProductCard[]; next_cursor: string | null };
