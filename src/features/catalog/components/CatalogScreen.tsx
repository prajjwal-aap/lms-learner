"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { FilterDropdownPill } from "@/components/ui/FilterDropdownPill";
import { ROUTES } from "@/config/routes";
import { useOwnedSlugs } from "@/features/courses";
import { cn } from "@/lib/utils";
import { useCategories, useProducts } from "../api/catalog.queries";
import { LANGUAGE_LABEL, SORT_LABEL, TYPE_LABEL, TYPE_ORDER } from "../lib/labels";
import type { CatalogSort, Language, ProductType } from "../types";
import { CatalogFooter } from "./CatalogFooter";
import { ProductCard } from "./ProductCard";
import { ProductThumb } from "@/components/ui/ProductThumb";

const ALL = "all";
type Filters = { category: string; type: ProductType | typeof ALL; language: Language | typeof ALL; sort: CatalogSort };
const INITIAL: Filters = { category: ALL, type: ALL, language: ALL, sort: "popular" };

const TYPE_OPTIONS = [{ value: ALL, label: "All types" }, ...TYPE_ORDER.map((t) => ({ value: t, label: TYPE_LABEL[t] }))];
const LANGUAGE_OPTIONS = [{ value: ALL, label: "All languages" }, ...(Object.keys(LANGUAGE_LABEL) as Language[]).map((l) => ({ value: l, label: LANGUAGE_LABEL[l] }))];
const SORT_OPTIONS = (Object.keys(SORT_LABEL) as CatalogSort[]).map((s) => ({ value: s, label: SORT_LABEL[s] }));

/** Courses (catalog) page: search + Category / Type / Language / Sort over GET /catalog/v1/products. */
export function CatalogScreen() {
  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [search, setSearch] = useState("");
  // Typing shouldn't fire a request per keystroke.
  const q = useDeferredValue(search.trim());
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }));

  const query = useMemo(
    () => ({
      category: filters.category === ALL ? undefined : filters.category,
      type: filters.type === ALL ? undefined : filters.type,
      language: filters.language === ALL ? undefined : filters.language,
      sort: filters.sort,
      q: q || undefined,
    }),
    [filters, q],
  );

  const { data: categories } = useCategories();
  const products = useProducts(query);
  const { data: owned } = useOwnedSlugs();
  const items = products.data?.pages.flatMap((p) => p.items) ?? [];
  const filtered = q !== "" || filters.category !== ALL || filters.type !== ALL || filters.language !== ALL;
  const featured = !filtered ? items.find((p) => p.badges.includes("BESTSELLER")) : undefined;

  const categoryOptions = [{ value: ALL, label: "All categories" }, ...(categories ?? []).map((c) => ({ value: c.slug, label: c.name }))];

  return (
    <div className="bg-[#fbf9fd] text-[#1a1a24] antialiased selection:bg-purple-200 selection:text-purple-900">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Courses</h1>
            <p className="mt-1 text-sm text-gray-500">Courses, bundles, e-books and live classes from Occult Gurukul mentors.</p>
          </div>
          <label className="relative md:w-96">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-purple-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, e-books, mentors…"
              aria-label="Search the catalog"
              className="w-full rounded-xl border border-purple-100 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-xs placeholder:text-gray-400 focus:border-brand-purple focus:ring-brand-purple"
            />
          </label>
        </header>

        {featured && (
          <Link
            href={ROUTES.product(featured.slug)}
            className="hero-gradient group flex flex-col overflow-hidden rounded-3xl text-white shadow-level-2 sm:flex-row sm:items-stretch"
          >
            <div className="aspect-[16/9] w-full shrink-0 overflow-hidden sm:w-80">
              <ProductThumb src={featured.thumbnail_url} title={featured.title} type={featured.type} />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2 p-6">
              <span className="w-fit rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-950">Bestseller</span>
              <p className="text-2xl font-extrabold leading-tight">{featured.title}</p>
              {featured.subtitle && <p className="text-sm text-purple-100">{featured.subtitle}</p>}
              <p className="mt-1 flex items-center gap-3">
                <span className="text-xl font-black">{featured.price.price_display}</span>
                {featured.price.mrp_paise > featured.price.price_paise && <span className="text-sm text-purple-200 line-through">{featured.price.mrp_display}</span>}
                <span className="ml-auto inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand-purple transition group-hover:bg-amber-300 group-hover:text-amber-950">
                  View course <ArrowRight className="size-2.5 shrink-0" />
                </span>
              </p>
            </div>
          </Link>
        )}

        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 text-sm" data-purpose="catalog-filters">
          <FilterDropdownPill label="Category" value={filters.category} emptyValue={ALL} options={categoryOptions} onChange={(v) => set("category", v)} />
          <FilterDropdownPill label="Type" value={filters.type} emptyValue={ALL} options={TYPE_OPTIONS} onChange={(v) => set("type", v as Filters["type"])} />
          <FilterDropdownPill label="Language" value={filters.language} emptyValue={ALL} options={LANGUAGE_OPTIONS} onChange={(v) => set("language", v as Filters["language"])} />
          <span className="mx-1 h-6 w-px shrink-0 bg-purple-100" />
          <FilterDropdownPill label={SORT_LABEL[filters.sort]} value={filters.sort} emptyValue={"" as CatalogSort} options={SORT_OPTIONS} onChange={(v) => set("sort", v)} />
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setFilters(INITIAL);
                setSearch("");
              }}
              className="shrink-0 px-2 text-xs font-bold uppercase tracking-wider text-brand-purple hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {products.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-purple-100 bg-white" />
            ))}
          </div>
        ) : products.isError ? (
          <p className="py-12 text-center text-sm text-gray-500">Couldn&apos;t load the catalog. Please try again.</p>
        ) : items.length === 0 ? (
          <div className="space-y-2 rounded-2xl border border-dashed border-purple-200 bg-white p-10 text-center">
            <Search className="mx-auto size-6 text-purple-300" />
            <p className="text-sm font-bold text-gray-900">Nothing matches these filters</p>
            <button
              type="button"
              onClick={() => {
                setFilters(INITIAL);
                setSearch("");
              }}
              className="text-xs font-bold uppercase tracking-wider text-brand-purple hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4", products.isPlaceholderData && "opacity-60 transition-opacity")}>
              {items.map((p) => (
                <ProductCard key={p.id} product={p} owned={owned?.get(p.slug)} />
              ))}
            </div>
            {products.hasNextPage && (
              <div className="pb-6 text-center">
                <button
                  type="button"
                  onClick={() => products.fetchNextPage()}
                  disabled={products.isFetchingNextPage}
                  className="rounded-xl border border-brand-purple px-6 py-2.5 text-sm font-bold text-brand-purple transition hover:bg-brand-purple hover:text-white disabled:opacity-50"
                >
                  {products.isFetchingNextPage ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <CatalogFooter />
    </div>
  );
}
