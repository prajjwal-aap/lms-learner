import type { Category, Mentor, Plan, ProductCard, ProductPage } from "../types";

/**
 * The live catalog API doesn't always match the §5 contract: `page` is null for most products, blocks and
 * arrays come back null, and new fields appear. Everything is normalised here so screens can rely on the types.
 */

type Raw = Record<string, unknown> | null | undefined;
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);
const num = (v: unknown, fallback = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export function normalizeCard(raw: Raw): ProductCard {
  const r = raw ?? {};
  const price = (r.price ?? {}) as Record<string, unknown>;
  const pricePaise = num(price.price_paise);
  const mrpPaise = num(price.mrp_paise, pricePaise);
  const isFree = price.is_free === true || pricePaise === 0;
  const rating = r.rating as ProductCard["rating"];
  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    type: (r.type as ProductCard["type"]) ?? "COURSE",
    title: str(r.title) ?? "Untitled",
    subtitle: str(r.subtitle),
    thumbnail_url: str(r.thumbnail_url),
    language: (r.language as ProductCard["language"]) ?? null,
    level: (r.level as ProductCard["level"]) ?? null,
    mentors: arr<Record<string, unknown>>(r.mentors).map((m) => ({
      slug: String(m.slug ?? ""),
      display_name: str(m.display_name) ?? "Mentor",
      avatar_url: str(m.avatar_url),
    })),
    price: {
      plan_id: String(price.plan_id ?? ""),
      plan_type: isFree ? "FREE" : "ONE_TIME",
      currency: String(price.currency ?? "INR"),
      price_paise: pricePaise,
      mrp_paise: mrpPaise,
      // The API shows "₹0" for free plans; the UI says "Free" instead.
      price_display: str(price.price_display) ?? rupees(pricePaise),
      mrp_display: str(price.mrp_display) ?? rupees(mrpPaise),
      is_free: isFree,
    },
    next_session_at: str(r.next_session_at),
    badges: arr<string>(r.badges).filter((b) => typeof b === "string"),
    rating: rating && typeof rating.avg === "number" ? rating : null,
    lesson_count: typeof r.lesson_count === "number" ? r.lesson_count : null,
    duration_sec: typeof r.duration_sec === "number" ? r.duration_sec : null,
    enrolled_display: str(r.enrolled_display),
  };
}

function normalizePlan(raw: Raw, fallback: ProductCard): Plan {
  const r = raw ?? {};
  const validity = (r.validity ?? {}) as Record<string, unknown>;
  const includes = (r.includes ?? {}) as Record<string, unknown>;
  const pricePaise = num(r.price_paise, fallback.price.price_paise);
  return {
    id: String(r.id ?? fallback.price.plan_id),
    name: str(r.name) ?? "Standard",
    type: r.type === "FREE" || pricePaise === 0 ? "FREE" : "ONE_TIME",
    currency: String(r.currency ?? "INR"),
    price_paise: pricePaise,
    mrp_paise: num(r.mrp_paise, pricePaise),
    price_display: str(r.price_display) ?? rupees(pricePaise),
    mrp_display: str(r.mrp_display) ?? rupees(num(r.mrp_paise, pricePaise)),
    validity: {
      type: (validity.type as Plan["validity"]["type"]) ?? "LIFETIME",
      days: typeof validity.days === "number" ? validity.days : null,
      end_date: str(validity.end_date),
    },
    includes: { live: includes.live === true, recordings: includes.recordings === true, certificate: includes.certificate === true, community: includes.community === true },
    session_id: str(r.session_id),
    batch_id: str(r.batch_id),
    is_default: r.is_default === true,
    sale_ends_at: str(r.sale_ends_at),
  };
}

/** A plan built from the card's default price, for products whose `plans` list comes back empty. */
const planFromCard = (card: ProductCard): Plan => normalizePlan({ is_default: true }, card);

export function normalizePage(raw: Raw): ProductPage {
  const r = raw ?? {};
  const rawProduct = (r.product ?? {}) as Record<string, unknown>;
  const card = normalizeCard(rawProduct);
  const page = (r.page ?? {}) as Record<string, unknown>;
  const hero = page.hero as ProductPage["page"]["hero"] | undefined;
  const plans = arr<Raw>(r.plans).map((p) => normalizePlan(p, card));
  if (plans.length > 0 && !plans.some((p) => p.is_default)) plans[0].is_default = true;
  const curriculum = r.curriculum as Record<string, unknown> | null | undefined;
  const publication = r.publication as Record<string, unknown> | null | undefined;

  return {
    product: {
      ...card,
      short_description: str(rawProduct.short_description),
      description: str(rawProduct.description),
      banner_url: str(rawProduct.banner_url),
      categories: arr<{ slug: string; name: string }>(rawProduct.categories).filter((c) => c && c.name),
      tags: arr<string>(rawProduct.tags),
      includes: arr<{ icon: string; label: string }>(rawProduct.includes).filter((i) => i && i.label),
    },
    page: {
      hero: hero ? { headline: str(hero.headline), subheadline: str(hero.subheadline), video_url: str(hero.video_url), cta_text: str(hero.cta_text) } : null,
      outcomes: arr<string>(page.outcomes),
      who_is_it_for: arr<string>(page.who_is_it_for),
      requirements: arr<string>(page.requirements),
      sections: arr<ProductPage["page"]["sections"][number]>(page.sections).map((s) => ({ ...s, data: s.data ?? {}, sort_order: num(s.sort_order) })),
      testimonials: arr<ProductPage["page"]["testimonials"][number]>(page.testimonials).filter((t) => t && t.text),
      faqs: arr<{ q: string; a: string }>(page.faqs).filter((f) => f && f.q),
    },
    plans: plans.length > 0 ? plans : [planFromCard(card)],
    curriculum: curriculum
      ? {
          section_count: num(curriculum.section_count),
          lesson_count: num(curriculum.lesson_count),
          total_duration_sec: num(curriculum.total_duration_sec),
          sections: arr<Record<string, unknown>>(curriculum.sections).map((s) => ({
            id: String(s.id ?? ""),
            title: str(s.title) ?? "Module",
            lessons: arr<Record<string, unknown>>(s.lessons).map((l) => ({
              id: String(l.id ?? ""),
              title: str(l.title) ?? "Lesson",
              type: String(l.type ?? "VIDEO"),
              duration_sec: typeof l.duration_sec === "number" && l.duration_sec > 0 ? l.duration_sec : null,
              is_free_preview: l.is_free_preview === true,
            })),
          })),
        }
      : null,
    bundle_items: Array.isArray(r.bundle_items) ? (r.bundle_items as Raw[]).map(normalizeCard) : null,
    publication: publication ? { page_count: num(publication.page_count), allow_download: publication.allow_download === true } : null,
    upcoming_sessions: Array.isArray(r.upcoming_sessions)
      ? (r.upcoming_sessions as Record<string, unknown>[]).map((s) => ({
          id: String(s.id ?? ""),
          title: str(s.title) ?? card.title,
          scheduled_at: String(s.scheduled_at ?? ""),
          duration_min: num(s.duration_min, 60),
          timezone: String(s.timezone ?? "Asia/Kolkata"),
          seats_left: typeof s.seats_left === "number" ? s.seats_left : null,
          registration_open: s.registration_open !== false,
          plan_id: str(s.plan_id),
        }))
      : null,
  };
}

export const normalizeCategory = (raw: Raw): Category => {
  const r = raw ?? {};
  return { id: String(r.id ?? ""), slug: String(r.slug ?? ""), name: str(r.name) ?? "Category", icon_url: str(r.icon_url), parent_id: str(r.parent_id), sort_order: num(r.sort_order) };
};

export function normalizeMentor(raw: Raw): Mentor {
  const r = raw ?? {};
  const stats = (r.stats ?? {}) as Record<string, unknown>;
  return {
    slug: String(r.slug ?? ""),
    display_name: str(r.display_name) ?? "Mentor",
    headline: str(r.headline),
    bio: str(r.bio),
    avatar_url: str(r.avatar_url),
    expertise: arr<string>(r.expertise),
    languages: arr<string>(r.languages),
    experience_years: typeof r.experience_years === "number" ? r.experience_years : null,
    stats: { learner_count: num(stats.learner_count), product_count: num(stats.product_count), rating_avg: typeof stats.rating_avg === "number" ? stats.rating_avg : null },
  };
}
