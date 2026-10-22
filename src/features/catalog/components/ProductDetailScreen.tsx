"use client";

import {
  ArrowLeft,
  Award,
  Ban,
  Book,
  BookOpen,
  Check,
  ChevronDown,
  Circle,
  CirclePlay,
  ClipboardList,
  Download,
  FileText,
  Film,
  Headphones,
  Infinity as InfinityIcon,
  Languages,
  ListChecks,
  Signal,
  Star,
  UserCheck,
  UserRound,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/config/routes";
import { libraryHref, useOwnedSlugs } from "@/features/courses";
import { commerceParams, track } from "@/lib/analytics";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { cn } from "@/lib/utils";
import { useMentor, useProductPage, useRecommendations } from "../api/catalog.queries";
import { formatHours, LANGUAGE_LABEL, LEVEL_LABEL, TYPE_LABEL } from "../lib/labels";
import type { Curriculum, PageSection } from "../types";
import { CatalogFooter } from "./CatalogFooter";
import { ProductCard } from "./ProductCard";
import { PurchasePanel } from "./PurchasePanel";

const card = "rounded-2xl border border-purple-100 bg-white p-6 shadow-xs";
/** Icon names the catalog sends in `product.includes[].icon`. */
const INCLUDE_ICON: Record<string, LucideIcon> = {
  LIVE: Video,
  RECORDING: CirclePlay,
  CERTIFICATE: Award,
  LIFETIME: InfinityIcon,
  COMMUNITY: Users,
  NOTES: FileText,
  DOWNLOAD: Download,
};
const LESSON_ICON: Record<string, LucideIcon> ={ VIDEO: CirclePlay, AUDIO: Headphones, PDF: FileText, TEXT: FileText, QUIZ: ClipboardList, LIVE: Video, DOWNLOAD: Download };

/** Product page (GET /catalog/v1/products/:slug). */
export function ProductDetailScreen({ slug }: { slug: string }) {
  const { data: page, isLoading, isError } = useProductPage(slug);
  const { data: owned } = useOwnedSlugs();
  const product = page?.product;
  const { data: recs } = useRecommendations(product?.id);
  const { data: mentor } = useMentor(product?.mentors[0]?.slug ?? null);

  useEffect(() => {
    if (!product) return;
    track("view_item", commerceParams([{ item_id: product.id, item_name: product.title, item_category: product.type, price: product.price.price_paise / 100, quantity: 1 }]));
  }, [product]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-purple-100 lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }
  if (isError || !page || !product) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-gray-900">{isError ? "Couldn't load this page" : "This product isn't available"}</h1>
        <p className="mt-2 text-sm text-gray-600">It may have been removed or is no longer on sale.</p>
        <Link href={ROUTES.store} className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline">
          Back to Courses
        </Link>
      </main>
    );
  }

  const owns = owned?.get(product.slug);
  const ownedHref = owns ? libraryHref(owns) : undefined;
  const { hero } = page.page;
  const sections = [...page.page.sections].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-[#fbf9fd]">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href={ROUTES.store} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="size-3 shrink-0" />
          Courses
        </Link>

        <div className="grid items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Hero */}
            <section className="hero-gradient rounded-3xl p-6 text-white shadow-level-2 sm:p-8">
              <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5">{TYPE_LABEL[product.type]}</span>
                {product.categories.map((c) => (
                  <span key={c.slug} className="rounded-full bg-white/10 px-2.5 py-0.5 text-purple-100">
                    {c.name}
                  </span>
                ))}
                {product.badges.map((b) => (
                  <span key={b} className="rounded-full bg-amber-400 px-2.5 py-0.5 text-amber-950">
                    {b}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{hero?.headline || product.title}</h1>
              {(hero?.subheadline || product.subtitle) && <p className="mt-2 text-sm text-purple-100 sm:text-base">{hero?.subheadline || product.subtitle}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-purple-100">
                {product.rating && (
                  <span>
                    <Star className="mr-1.5 inline-block size-3.5 align-[-0.125em] text-amber-300" fill="currentColor" />
                    {product.rating.avg.toFixed(1)} ({product.rating.count_display ?? product.rating.count} ratings)
                  </span>
                )}
                {product.mentors.length > 0 && (
                  <span>
                    <UserRound className="mr-1.5 inline-block size-3.5 align-[-0.125em] text-amber-300" />
                    {product.mentors.map((m) => m.display_name).join(", ")}
                  </span>
                )}
                {product.language && (
                  <span>
                    <Languages className="mr-1.5 inline-block size-3.5 align-[-0.125em] text-amber-300" />
                    {LANGUAGE_LABEL[product.language]}
                  </span>
                )}
                {product.level && (
                  <span>
                    <Signal className="mr-1.5 inline-block size-3.5 align-[-0.125em] text-amber-300" />
                    {LEVEL_LABEL[product.level]}
                  </span>
                )}
                {page.curriculum && (
                  <span>
                    <Film className="mr-1.5 inline-block size-3.5 align-[-0.125em] text-amber-300" />
                    {page.curriculum.lesson_count} lessons
                    {page.curriculum.total_duration_sec > 0 && ` • ${formatHours(page.curriculum.total_duration_sec)}`}
                  </span>
                )}
                {page.publication && (
                  <span>
                    <Book className="mr-1.5 inline-block size-3.5 align-[-0.125em] text-amber-300" />
                    {page.publication.page_count} pages
                  </span>
                )}
              </div>
            </section>

            {/* Buy box on small screens sits right under the hero */}
            <div className="lg:hidden">
              <PurchasePanel page={page} owned={owns} ownedHref={ownedHref} />
            </div>

            {(product.short_description || product.description || (product.includes?.length ?? 0) > 0) && (
              <section className={cn(card, "space-y-4")}>
                {product.short_description && <p className="text-sm leading-relaxed text-gray-700">{product.short_description}</p>}
                {product.description && <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{product.description}</p>}
                {product.includes && product.includes.length > 0 && (
                  <ul className="grid gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2">
                    {product.includes.map((i) => {
                      const Icon = INCLUDE_ICON[i.icon] ?? Check;
                      return (
                        <li key={i.label} className="flex items-center gap-2.5 text-sm text-gray-700">
                          <Icon className="size-4 shrink-0 text-brand-600" />
                          {i.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {page.page.outcomes.length > 0 && (
              <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-gray-900">What you&apos;ll learn</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {page.page.outcomes.map((o) => (
                    <li key={o} className="flex gap-2.5 text-sm text-gray-700">
                      <Check className="mt-1 size-3 shrink-0 text-brand-600" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {page.curriculum && <CurriculumCard curriculum={page.curriculum} />}

            {page.bundle_items && page.bundle_items.length > 0 && (
              <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-gray-900">Included in this bundle</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {page.bundle_items.map((p) => (
                    <ProductCard key={p.id} product={p} owned={owned?.get(p.slug)} />
                  ))}
                </div>
              </section>
            )}

            {page.publication && (
              <section className={card}>
                <h2 className="mb-3 text-lg font-bold text-gray-900">About this e-book</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    <BookOpen className="mr-2 inline-block size-3.5 align-[-0.125em] text-brand-600" />
                    {page.publication.page_count} pages, read in the app with your progress saved
                  </li>
                  <li>
                    {page.publication.allow_download ? (
                      <Download className="mr-2 inline-block size-3.5 align-[-0.125em] text-brand-600" />
                    ) : (
                      <Ban className="mr-2 inline-block size-3.5 align-[-0.125em] text-brand-600" />
                    )}
                    {page.publication.allow_download ? "PDF download included" : "Read online only (no download)"}
                  </li>
                </ul>
              </section>
            )}

            {(page.page.who_is_it_for.length > 0 || page.page.requirements.length > 0) && (
              <section className={cn(card, "grid gap-6 sm:grid-cols-2")}>
                {page.page.who_is_it_for.length > 0 && <BulletList title="Who it's for" icon={UserCheck} items={page.page.who_is_it_for} />}
                {page.page.requirements.length > 0 && <BulletList title="Requirements" icon={ListChecks} items={page.page.requirements} />}
              </section>
            )}

            {sections.map((s, i) => (
              <HtmlSection key={i} section={s} />
            ))}

            {page.page.testimonials.length > 0 && (
              <section className={card}>
                <h2 className="mb-4 text-lg font-bold text-gray-900">What learners say</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {page.page.testimonials.map((t, i) => (
                    <figure key={i} className="rounded-xl bg-purple-50/60 p-4">
                      {t.rating && <p className="mb-2 text-xs text-amber-500">{"★".repeat(Math.round(t.rating))}</p>}
                      <blockquote className="text-sm leading-relaxed text-gray-700">“{t.text}”</blockquote>
                      <figcaption className="mt-3 text-xs font-semibold text-gray-900">— {t.name}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {page.page.faqs.length > 0 && (
              <section className={card}>
                <h2 className="mb-2 text-lg font-bold text-gray-900">FAQs</h2>
                <div className="divide-y divide-gray-100">
                  {page.page.faqs.map((f, i) => (
                    <details key={i} className="group py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900">
                        {f.q}
                        <ChevronDown className="size-3 shrink-0 text-gray-400 transition group-open:rotate-180" />
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {mentor && (
              <section className={cn(card, "flex flex-col gap-4 sm:flex-row sm:items-center")}>
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                  {mentor.mentor.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CDN host isn't configured for next/image
                    <img src={mentor.mentor.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    mentor.mentor.display_name.charAt(0)
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Your mentor</p>
                  <p className="text-lg font-bold text-gray-900">{mentor.mentor.display_name}</p>
                  {mentor.mentor.headline && <p className="text-sm text-gray-600">{mentor.mentor.headline}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    {[
                      mentor.mentor.experience_years && `${mentor.mentor.experience_years}+ years`,
                      mentor.mentor.stats.learner_count && `${mentor.mentor.stats.learner_count.toLocaleString("en-IN")} learners`,
                      mentor.mentor.stats.rating_avg && `★ ${mentor.mentor.stats.rating_avg}`,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </section>
            )}
          </div>

          <aside className="sticky top-24 hidden lg:block">
            <PurchasePanel page={page} owned={owns} ownedHref={ownedHref} />
          </aside>
        </div>

        {recs && recs.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recs.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} owned={owned?.get(p.slug)} />
              ))}
            </div>
          </section>
        )}
      </main>
      <CatalogFooter />
    </div>
  );
}

function BulletList({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-gray-900">{title}</h2>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="flex gap-2.5 text-sm text-gray-700">
            <Icon className="mt-1 size-3 shrink-0 text-brand-600" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** TEXT / CUSTOM_HTML sections from the CMS, sanitised before rendering. Other section types are covered by dedicated blocks. */
function HtmlSection({ section }: { section: PageSection }) {
  const html = useMemo(() => (section.data.html ? sanitizeHtml(section.data.html) : ""), [section.data.html]);
  if (!html || (section.type !== "TEXT" && section.type !== "CUSTOM_HTML")) return null;
  return (
    <section className={card}>
      {section.title && <h2 className="mb-3 text-lg font-bold text-gray-900">{section.title}</h2>}
      <div
        className="space-y-3 text-sm leading-relaxed text-gray-700 [&_a]:text-brand-600 [&_a]:underline [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function CurriculumCard({ curriculum }: { curriculum: Curriculum }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? curriculum.sections : curriculum.sections.slice(0, 4);
  return (
    <section className={card}>
      <h2 className="text-lg font-bold text-gray-900">Curriculum</h2>
      <p className="mb-4 mt-1 text-xs text-gray-500">
        {curriculum.section_count} modules • {curriculum.lesson_count} lessons • {formatHours(curriculum.total_duration_sec)}
      </p>
      <div className="space-y-2">
        {visible.map((s, i) => (
          <details key={s.id} open={i === 0} className="group overflow-hidden rounded-xl border border-gray-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">
              <span>{s.title}</span>
              <span className="flex shrink-0 items-center gap-3 text-xs font-medium text-gray-500">
                {s.lessons.length} lessons
                <ChevronDown className="size-3 shrink-0 transition group-open:rotate-180" />
              </span>
            </summary>
            <ul className="divide-y divide-gray-100">
              {s.lessons.map((l) => {
                const LessonIcon = LESSON_ICON[l.type] ?? Circle;
                return (
                  <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="flex min-w-0 items-center gap-2.5 text-gray-700">
                      <LessonIcon className="size-3 shrink-0 text-gray-400" />
                      <span className="truncate">{l.title}</span>
                      {l.is_free_preview && <span className="shrink-0 rounded-sm bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-700">PREVIEW</span>}
                    </span>
                    {l.duration_sec ? <span className="shrink-0 text-xs text-gray-400">{Math.round(l.duration_sec / 60)} min</span> : null}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
      {curriculum.sections.length > 4 && (
        <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-4 text-sm font-bold text-brand-600 hover:underline">
          {showAll ? "Show fewer modules" : `Show all ${curriculum.sections.length} modules`}
        </button>
      )}
    </section>
  );
}
