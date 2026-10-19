import type { Category, Language, Level, Plan, ProductCard, ProductPage, ProductType, UpcomingSession } from "../types";

const ARUN = { slug: "arun-pandit", display_name: "Arun Pandit", avatar_url: null };
const PRIYA = { slug: "priya-sharma", display_name: "Priya Sharma", avatar_url: null };

export const MOCK_CATEGORIES: Category[] = [
  { id: "c1", slug: "astrology", name: "Astrology", icon_url: null, parent_id: null, sort_order: 1 },
  { id: "c2", slug: "numerology", name: "Numerology", icon_url: null, parent_id: null, sort_order: 2 },
  { id: "c3", slug: "palmistry", name: "Palmistry", icon_url: null, parent_id: null, sort_order: 3 },
  { id: "c4", slug: "vastu", name: "Vastu Shastra", icon_url: null, parent_id: null, sort_order: 4 },
  { id: "c5", slug: "gemstones", name: "Gemstones & Crystals", icon_url: null, parent_id: null, sort_order: 5 },
  { id: "c6", slug: "lal-kitab", name: "Lal Kitab", icon_url: null, parent_id: null, sort_order: 6 },
];

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function price(id: string, sp: number, mrp: number): ProductCard["price"] {
  return {
    plan_id: `${id}-plan`,
    plan_type: sp === 0 ? "FREE" : "ONE_TIME",
    currency: "INR",
    price_paise: sp * 100,
    mrp_paise: mrp * 100,
    price_display: sp === 0 ? "Free" : rupees(sp),
    mrp_display: rupees(mrp),
    is_free: sp === 0,
  };
}

type Seed = {
  slug: string;
  type: ProductType;
  title: string;
  subtitle: string;
  category: string;
  language: Language;
  level?: Level;
  sp: number;
  mrp: number;
  badges?: string[];
  mentor?: typeof ARUN;
  /** Days from now of the next live slot (WEBINAR / MASTERCLASS). */
  inDays?: number;
};

const SEEDS: Seed[] = [
  { slug: "advance-numerology-mentorship", type: "COURSE", title: "Advance Numerology Mentorship Program", subtitle: "Lo Shu grid, name correction and business numerology", category: "numerology", language: "HINDI", level: "ADVANCED", sp: 14999, mrp: 24999, badges: ["BESTSELLER"] },
  { slug: "kundli-mastery", type: "COURSE", title: "Kundli Mastery", subtitle: "Read any birth chart with confidence", category: "astrology", language: "HINDI", level: "BEGINNER", sp: 2499, mrp: 4999, badges: ["BESTSELLER"] },
  { slug: "basic-numerology", type: "COURSE", title: "Basic Numerology Course", subtitle: "Mulank, Bhagyank and numbers 1 to 9", category: "numerology", language: "HINGLISH", level: "BEGINNER", sp: 1499, mrp: 2999 },
  { slug: "palmistry-level-up", type: "COURSE", title: "Palmistry Level Up Course", subtitle: "Lines, mounts and timing events in the palm", category: "palmistry", language: "HINDI", level: "INTERMEDIATE", sp: 3999, mrp: 6999, badges: ["NEW"] },
  { slug: "advance-nakshatra", type: "COURSE", title: "Advance Nakshatra Course", subtitle: "All 27 nakshatras, padas and their lords", category: "astrology", language: "ENGLISH", level: "ADVANCED", sp: 5999, mrp: 9999 },
  { slug: "astro-vastu-shastra", type: "COURSE", title: "Astro Vastu Shastra", subtitle: "16 zones, five elements and remedies without demolition", category: "vastu", language: "HINDI", level: "ALL", sp: 7999, mrp: 11999, mentor: PRIYA },
  { slug: "crystal-gemstone-crash-course", type: "COURSE", title: "Crystal & Gemstone Crash Course", subtitle: "Choose, energise and wear gemstones correctly", category: "gemstones", language: "HINGLISH", level: "BEGINNER", sp: 0, mrp: 999, badges: ["FREE"] },
  { slug: "astro-starter-bundle", type: "BUNDLE", title: "Astro Starter Bundle", subtitle: "Kundli Mastery + Basic Numerology + 2 e-books", category: "astrology", language: "HINDI", level: "BEGINNER", sp: 3999, mrp: 8996, badges: ["SAVE 55%"] },
  { slug: "kundli-reading-handbook", type: "EBOOK", title: "Kundli Reading Handbook", subtitle: "120-page practical guide with chart examples", category: "astrology", language: "ENGLISH", sp: 199, mrp: 499 },
  { slug: "lal-kitab-upayas", type: "EBOOK", title: "108 Lal Kitab Upayas", subtitle: "Simple remedies for every planet", category: "lal-kitab", language: "HINDI", sp: 299, mrp: 599 },
  { slug: "numerology-grid-guide", type: "EBOOK", title: "Numerology Grid Guide", subtitle: "Missing numbers and their remedies", category: "numerology", language: "HINGLISH", sp: 149, mrp: 299 },
  { slug: "mega-numerology-masterclass", type: "MASTERCLASS", title: "Mega Numerology Masterclass", subtitle: "3-hour live class on name and mobile numerology", category: "numerology", language: "HINDI", sp: 999, mrp: 2999, inDays: 3, badges: ["LIVE"] },
  { slug: "kp-astrology-masterclass", type: "MASTERCLASS", title: "KP Astrology Masterclass", subtitle: "Sub-lord theory and ruling planets, live", category: "astrology", language: "ENGLISH", sp: 1499, mrp: 3999, inDays: 9, mentor: PRIYA },
  { slug: "kundli-pathshala-webinar", type: "WEBINAR", title: "Kundli Pathshala Webinar", subtitle: "Free live introduction to chart reading", category: "astrology", language: "HINDI", sp: 0, mrp: 499, inDays: 1, badges: ["FREE"] },
  { slug: "palmistry-webinar", type: "WEBINAR", title: "Palmistry Webinar", subtitle: "Live hand-reading session with Q&A", category: "palmistry", language: "HINGLISH", sp: 199, mrp: 999, inDays: 6 },
];

const DAY = 86_400_000;
/** 7:30 PM IST on the day `inDays` from now. */
function slotAt(inDays: number) {
  const d = new Date(Date.now() + inDays * DAY);
  d.setUTCHours(14, 0, 0, 0);
  return d.toISOString();
}

export const MOCK_PRODUCT_CATEGORY: Record<string, string> = Object.fromEntries(SEEDS.map((s) => [s.slug, s.category]));

export const MOCK_PRODUCTS: ProductCard[] = SEEDS.map((s, i) => {
  const id = `prod-${String(i + 1).padStart(2, "0")}`;
  return {
    id,
    slug: s.slug,
    type: s.type,
    title: s.title,
    subtitle: s.subtitle,
    thumbnail_url: null,
    language: s.language,
    level: s.level ?? null,
    mentors: [s.mentor ?? ARUN],
    price: price(id, s.sp, s.mrp),
    next_session_at: s.inDays !== undefined ? slotAt(s.inDays) : null,
    badges: s.badges ?? [],
  };
});

function plansFor(p: ProductCard): Plan[] {
  const base: Plan = {
    id: p.price.plan_id,
    name: p.type === "EBOOK" ? "E-book" : "Lifetime access",
    type: p.price.plan_type,
    currency: "INR",
    price_paise: p.price.price_paise,
    mrp_paise: p.price.mrp_paise,
    price_display: p.price.price_display,
    mrp_display: p.price.mrp_display,
    validity: { type: "LIFETIME", days: null, end_date: null },
    includes: { live: false, recordings: true, certificate: p.type === "COURSE", community: p.type !== "EBOOK" },
    session_id: null,
    batch_id: null,
    is_default: true,
    sale_ends_at: null,
  };
  if (p.type !== "COURSE" || p.price.is_free) return [base];
  const year = Math.round(p.price.price_paise * 0.6);
  return [
    base,
    {
      ...base,
      id: `${p.id}-plan-1y`,
      name: "1 year access",
      price_paise: year,
      price_display: rupees(year / 100),
      validity: { type: "DAYS", days: 365, end_date: null },
      includes: { ...base.includes, certificate: false },
      is_default: false,
    },
  ];
}

function sessionsFor(p: ProductCard): UpcomingSession[] {
  if (!p.next_session_at) return [];
  const first = Date.parse(p.next_session_at);
  return [0, 7].map((offset, i) => ({
    id: `${p.id}-s${i + 1}`,
    title: i === 0 ? `${p.title} — Batch ${i + 1}` : `${p.title} — Batch ${i + 1} (repeat)`,
    scheduled_at: new Date(first + offset * DAY).toISOString(),
    duration_min: p.type === "MASTERCLASS" ? 180 : 90,
    timezone: "Asia/Kolkata",
    seats_left: i === 0 ? 37 : 120,
    registration_open: true,
    plan_id: p.price.plan_id,
  }));
}

const TOPICS = ["Foundations", "Core techniques", "Case studies", "Remedies", "Practice & Q&A"];

export function buildProductPage(p: ProductCard): ProductPage {
  const category = MOCK_CATEGORIES.find((c) => c.slug === MOCK_PRODUCT_CATEGORY[p.slug]);
  const isCourse = p.type === "COURSE";
  return {
    product: {
      ...p,
      short_description: `${p.subtitle}. Learn step by step with ${p.mentors[0].display_name}, with notes, examples and doubt-clearing support.`,
      banner_url: null,
      categories: category ? [{ slug: category.slug, name: category.name }] : [],
      tags: [],
    },
    page: {
      hero: { headline: p.title, subheadline: p.subtitle, video_url: null, cta_text: p.price.is_free ? "Enroll for free" : "Enroll now" },
      outcomes: ["Understand the core principles from first principles", "Apply the method to real charts and case studies", "Suggest practical, everyday remedies", "Build confidence to guide family and clients"],
      who_is_it_for: ["Beginners curious about Vedic sciences", "Practitioners who want a structured method", "Anyone preparing for consultations"],
      requirements: ["No prior knowledge needed", "A notebook for practice charts"],
      sections: [
        {
          type: "TEXT",
          title: "About this " + (p.type === "EBOOK" ? "e-book" : p.type.toLowerCase()),
          data: { html: `<p>${p.subtitle}.</p><p>Created by <strong>${p.mentors[0].display_name}</strong> for learners at Occult Gurukul, with bilingual notes and worked examples.</p>` },
          sort_order: 1,
        },
      ],
      testimonials: [
        { name: "Priya", text: "Clear explanations and very practical examples. I could read my family's charts within weeks.", rating: 5, avatar_url: null, video_url: null },
        { name: "Rahul", text: "The case studies made everything click. Worth every rupee.", rating: 5, avatar_url: null, video_url: null },
      ],
      faqs: [
        { q: "Which language is it in?", a: p.language === "ENGLISH" ? "English." : p.language === "HINGLISH" ? "A mix of Hindi and English." : "Hindi, with English notes." },
        { q: "How long do I get access?", a: "As per the plan you choose — lifetime plans never expire." },
        { q: "Can I buy it for someone else?", a: "Yes. At checkout choose “Someone else” and enter their name and phone number." },
      ],
    },
    plans: plansFor(p),
    curriculum: isCourse
      ? {
          section_count: TOPICS.length,
          lesson_count: TOPICS.length * 4,
          total_duration_sec: TOPICS.length * 4 * 1200,
          sections: TOPICS.map((t, i) => ({
            id: `${p.id}-sec${i + 1}`,
            title: `Module ${i + 1}: ${t}`,
            lessons: [1, 2, 3, 4].map((n) => ({
              id: `${p.id}-sec${i + 1}-l${n}`,
              title: n === 4 ? `${t} — notes (PDF)` : `${t} — part ${n}`,
              type: n === 4 ? "PDF" : "VIDEO",
              duration_sec: n === 4 ? null : 900 + n * 300,
              is_free_preview: i === 0 && n === 1,
            })),
          })),
        }
      : null,
    bundle_items: p.type === "BUNDLE" ? MOCK_PRODUCTS.filter((x) => ["kundli-mastery", "basic-numerology", "kundli-reading-handbook", "lal-kitab-upayas"].includes(x.slug)) : null,
    publication: p.type === "EBOOK" ? { page_count: 120, allow_download: p.slug !== "lal-kitab-upayas" } : null,
    upcoming_sessions: p.type === "WEBINAR" || p.type === "MASTERCLASS" ? sessionsFor(p) : null,
  };
}
