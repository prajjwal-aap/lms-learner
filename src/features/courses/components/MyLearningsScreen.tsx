"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ROUTES } from "@/config/routes";
import { ProductThumb } from "@/components/ui/ProductThumb";
import { cn } from "@/lib/utils";
import { useContinueLearning, useLibrary, usePurchasedContent } from "../api/learning.queries";
import type { AccessStatus, LibraryCard, LibraryTypeFilter } from "../types";

const RESOURCE_OF_TAB: Record<LibraryTypeFilter, LibraryCard["resource"]["type"]> = { COURSE: "COURSE", EBOOK: "PUBLICATION", LIVE: "LIVE_SESSION" };
import { libraryHref, LibraryCardView } from "./LibraryCardView";

const TYPE_TABS: { value: LibraryTypeFilter | "ALL"; label: string; icon: string }[] = [
  { value: "ALL", label: "All", icon: "fa-border-all" },
  { value: "COURSE", label: "Courses", icon: "fa-graduation-cap" },
  { value: "EBOOK", label: "E-books", icon: "fa-book-open" },
  { value: "LIVE", label: "Live classes", icon: "fa-video" },
];

const STATUS_PILLS: { value: AccessStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
];

/** My Learnings: everything the learner owns (GET /lms/v1/me/library) with a "Continue learning" banner. */
export function MyLearningsScreen() {
  const [type, setType] = useState<LibraryTypeFilter | "ALL">("ALL");
  const [status, setStatus] = useState<AccessStatus>("ACTIVE");
  const [search, setSearch] = useState("");
  const library = useLibrary({ type: type === "ALL" ? undefined : type, status });
  const purchases = usePurchasedContent();
  const { data: resume } = useContinueLearning();

  const items = useMemo(() => {
    const fromLibrary = library.data?.pages.flatMap((p) => p.items) ?? [];
    // Paid orders not (yet) in the LMS library — skip ones the library already has.
    const known = new Set(fromLibrary.flatMap((c) => [c.product_slug, c.title.trim().toLowerCase()]).filter(Boolean));
    const fromOrders =
      status === "ACTIVE"
        ? (purchases.data ?? []).filter(
            (c) => (type === "ALL" || c.resource.type === RESOURCE_OF_TAB[type]) && !known.has(c.product_slug) && !known.has(c.title.trim().toLowerCase()),
          )
        : [];
    const all = [...fromLibrary, ...fromOrders];
    const q = search.trim().toLowerCase();
    return q ? all.filter((c) => c.title.toLowerCase().includes(q)) : all;
  }, [library.data, purchases.data, search, status, type]);
  const loading = library.isLoading || (purchases.isLoading && !library.data?.pages[0]?.items.length);

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6" data-purpose="my-learnings">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900">My Learnings</h1>

      {resume && status === "ACTIVE" && (
        <Link
          href={libraryHref(resume)}
          className="group mb-8 flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white shadow-2xs transition hover:shadow-level-2 sm:flex-row sm:items-center"
        >
          <div className="aspect-[16/9] w-full shrink-0 overflow-hidden sm:w-56">
            <ProductThumb src={resume.thumbnail_url} title={resume.title} type={resume.resource.type} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Continue learning</p>
              <p className="mt-1 truncate text-lg font-bold text-gray-900">{resume.title}</p>
              {resume.next_action.label && <p className="mt-0.5 truncate text-sm text-gray-600">{resume.next_action.label}</p>}
              <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${resume.progress.pct ?? 0}%` }} />
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-brand-700">
              <i className="fa-solid fa-play text-xs" />
              Resume
            </span>
          </div>
        </Link>
      )}

      {/* Type tabs + search */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Content type" className="no-scrollbar flex gap-2 overflow-x-auto">
          {TYPE_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={type === t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                type === t.value ? "border-brand-800 bg-brand-50 font-semibold text-brand-800" : "border-gray-200 font-medium text-gray-600 hover:bg-gray-50",
              )}
            >
              <i className={cn("fa-solid text-xs", t.icon)} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="relative flex-1 lg:w-80">
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search my learnings"
              placeholder="Search by title"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand-800 focus:outline-hidden focus:ring-1 focus:ring-brand-800"
            />
          </label>
          <div className="flex shrink-0 rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="Access">
            {STATUS_PILLS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={status === s.value}
                onClick={() => setStatus(s.value)}
                className={cn("rounded-md px-3 py-1.5 text-xs font-semibold transition", status === s.value ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200/90 bg-white">
              <div className="aspect-[16/9] w-full animate-pulse bg-gray-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded-sm bg-gray-200" />
                <div className="h-2 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="mt-4 h-9 w-full animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : library.isError && items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">Couldn&apos;t load your library. Please try again.</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <i className="fa-solid fa-book-open text-3xl text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">
            {search ? "Nothing matches your search" : status === "EXPIRED" ? "No expired items" : "Nothing here yet"}
          </p>
          {!search && status === "ACTIVE" && (
            <Link href={ROUTES.store} className="text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline">
              Browse courses
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", library.isPlaceholderData && "opacity-60")}>
            {items.map((c) => (
              <LibraryCardView key={`${c.resource.type}-${c.resource.id}`} card={c} />
            ))}
          </div>
          {library.hasNextPage && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => library.fetchNextPage()}
                disabled={library.isFetchingNextPage}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {library.isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
