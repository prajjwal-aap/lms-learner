import { isMocked } from "@/config/features";
import { api, ApiError } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import type { Category, Mentor, ProductCard, ProductFilters, ProductList, ProductPage } from "../types";
import { buildProductPage, MOCK_CATEGORIES, MOCK_PRODUCT_CATEGORY, MOCK_PRODUCTS } from "./catalog.mock";
import { normalizeCard, normalizeCategory, normalizeMentor, normalizePage } from "./catalog.normalize";

const mocked = () => isMocked("store");

/** GET /catalog/v1/categories (§5.2), sorted for dropdowns. */
export async function getCategories(): Promise<Category[]> {
  if (mocked()) {
    await mockDelay();
    return MOCK_CATEGORIES;
  }
  const data = await api.get<{ items?: unknown[] }>("/catalog/v1/categories");
  // Sub-categories (parent_id set) sort after their top-level siblings.
  return (data?.items ?? [])
    .map((c) => normalizeCategory(c as Record<string, unknown>))
    .sort((a, b) => Number(!!a.parent_id) - Number(!!b.parent_id) || a.sort_order - b.sort_order);
}

function mockList(f: ProductFilters, limit: number, cursor?: string): ProductList {
  const q = f.q?.trim().toLowerCase();
  let list = MOCK_PRODUCTS.filter(
    (p) =>
      (!f.type || p.type === f.type) &&
      (!f.category || MOCK_PRODUCT_CATEGORY[p.slug] === f.category) &&
      (!f.language || p.language === f.language) &&
      (!q || `${p.title} ${p.subtitle} ${p.mentors.map((m) => m.display_name).join(" ")}`.toLowerCase().includes(q)),
  );
  if (f.sort === "price_asc") list = [...list].sort((a, b) => a.price.price_paise - b.price.price_paise);
  if (f.sort === "price_desc") list = [...list].sort((a, b) => b.price.price_paise - a.price.price_paise);
  if (f.sort === "new") list = [...list].reverse();
  const start = cursor ? Number(cursor) : 0;
  const end = start + limit;
  return { items: list.slice(start, end), next_cursor: end < list.length ? String(end) : null };
}

/** GET /catalog/v1/products (§5.3), cursor-paginated. */
export async function listProducts(filters: ProductFilters, cursor?: string, limit = 12): Promise<ProductList> {
  if (mocked()) {
    await mockDelay();
    return mockList(filters, limit, cursor);
  }
  const data = await api.get<{ items?: unknown[]; next_cursor?: string | null }>("/catalog/v1/products", { query: { ...filters, limit, cursor } });
  return { items: (data?.items ?? []).map((p) => normalizeCard(p as Record<string, unknown>)), next_cursor: data?.next_cursor ?? null };
}

/** GET /catalog/v1/products/:slug (§5.4). Returns null for unknown / unpublished products. */
export async function getProductPage(slug: string): Promise<ProductPage | null> {
  if (mocked()) {
    await mockDelay();
    const card = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return card ? buildProductPage(card) : null;
  }
  try {
    const data = await api.get<Record<string, unknown> | null>(`/catalog/v1/products/${encodeURIComponent(slug)}`);
    return data?.product ? normalizePage(data) : null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** GET /catalog/v1/recommendations?product_id= (§5.7). */
export async function getRecommendations(productId: string): Promise<ProductCard[]> {
  if (mocked()) {
    await mockDelay();
    const self = MOCK_PRODUCTS.find((p) => p.id === productId);
    return MOCK_PRODUCTS.filter((p) => p.id !== productId && p.type === self?.type).slice(0, 4);
  }
  const data = await api.get<{ items?: unknown[] }>("/catalog/v1/recommendations", { query: { product_id: productId } });
  return (data?.items ?? []).map((p) => normalizeCard(p as Record<string, unknown>)).filter((p) => p.id !== productId);
}

/** GET /catalog/v1/mentors/:slug (§5.6). */
export async function getMentor(slug: string): Promise<{ mentor: Mentor; products: ProductCard[] }> {
  if (mocked()) {
    await mockDelay();
    const products = MOCK_PRODUCTS.filter((p) => p.mentors.some((m) => m.slug === slug));
    const ref = products[0]?.mentors.find((m) => m.slug === slug);
    return {
      mentor: {
        slug,
        display_name: ref?.display_name ?? slug,
        headline: "Vedic astrologer & numerologist",
        bio: null,
        avatar_url: null,
        expertise: ["Vedic astrology", "Numerology"],
        languages: ["HINDI", "ENGLISH"],
        experience_years: 20,
        stats: { learner_count: 120000, product_count: products.length, rating_avg: 4.8 },
      },
      products,
    };
  }
  const data = await api.get<{ mentor?: Record<string, unknown>; products?: unknown[] }>(`/catalog/v1/mentors/${encodeURIComponent(slug)}`);
  return { mentor: normalizeMentor(data?.mentor), products: (data?.products ?? []).map((p) => normalizeCard(p as Record<string, unknown>)) };
}
