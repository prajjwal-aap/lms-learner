"use client";

import { useMemo, useState } from "react";
import { useOwnedSlugs } from "@/features/courses";
import { useLiveProducts, useMasterclassPageContent } from "../api/masterclasses.queries";
import type { Mentor } from "../types";
import { CtaBanner } from "./CtaBanner";
import { EndorsementsSection } from "./EndorsementsSection";
import { FaqSection } from "./FaqSection";
import { LegacySection } from "./LegacySection";
import { MasterclassCard } from "./MasterclassCard";
import { MasterclassFooter } from "./MasterclassFooter";
import { MentorFilter } from "./MentorFilter";
import { TestimonialsSection } from "./TestimonialsSection";

const CATALOGUE_ID = "masterclass-catalogue";

/** Masterclasses page body: hero search, mentor filter + cards, legacy, endorsements, reviews, FAQ, CTA, footer. */
export function MasterclassesScreen() {
  const live = useLiveProducts();
  const content = useMasterclassPageContent();
  const { data: owned } = useOwnedSlugs();

  const [query, setQuery] = useState("");
  const [mentorId, setMentorId] = useState<string | null>(null);

  // Mentor filter options come from the products' own mentors.
  const mentors = useMemo<Mentor[]>(() => {
    const seen = new Map<string, string>();
    for (const p of live.items) for (const m of p.mentors) seen.set(m.slug, m.display_name);
    return [...seen].map(([id, name]) => ({ id, name }));
  }, [live.items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live.items.filter((p) => {
      if (mentorId && !p.mentors.some((m) => m.slug === mentorId)) return false;
      if (!q) return true;
      return `${p.title} ${p.subtitle ?? ""} ${p.mentors.map((m) => m.display_name).join(" ")}`.toLowerCase().includes(q);
    });
  }, [live.items, mentorId, query]);

  const scrollToCatalogue = () =>
    document.getElementById(CATALOGUE_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const loading = live.isLoading;

  return (
    <div className="bg-[#fafaff] text-slate-800 selection:bg-purple-100 selection:text-brand-600">
      {/* Hero + search */}
      <section className="pt-10 pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto" data-purpose="hero-intro">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Learn Directly from <span className="text-brand-600">Specialized Mentors</span>
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-normal">
          Select your mentor and learn from the experts who have guided thousands of students to confident
          astrological practice
        </p>
        <div className="mt-7 max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search masterclasses"
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 placeholder-slate-400 text-slate-800 transition"
            placeholder="Search by name or topic..."
          />
        </div>
      </section>

      {/* Catalogue */}
      <main
        id={CATALOGUE_ID}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-24"
        data-purpose="masterclass-grid-with-sidebar"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {!loading ? (
            <MentorFilter
              mentors={mentors}
              selectedId={mentorId}
              resultCount={visible.length}
              onSelect={setMentorId}
            />
          ) : (
            <div className="lg:col-span-3 h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          )}
          <section className="lg:col-span-9" data-purpose="cards-collection">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-80 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : live.isError ? (
              <p className="text-sm text-red-600">Could not load masterclasses. Please try again.</p>
            ) : visible.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                <p className="text-sm font-semibold text-slate-800">No masterclasses found</p>
                <p className="text-xs text-slate-500 mt-1">Try another mentor or search term.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setMentorId(null);
                  }}
                  className="mt-4 text-xs font-semibold text-brand-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visible.map((p) => (
                  <MasterclassCard key={p.id} product={p} registered={!!owned?.has(p.slug)} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <LegacySection />

      {content.data ? (
        <>
          <EndorsementsSection endorsements={content.data.endorsements} />
          <TestimonialsSection
            testimonials={content.data.testimonials}
            studentsCount={content.data.studentsCount}
            onRegisterClick={scrollToCatalogue}
          />
          <FaqSection faqs={content.data.faqs} />
          <CtaBanner image={content.data.ctaImage} />
          <MasterclassFooter columns={content.data.footerColumns} />
        </>
      ) : (
        <p className="py-16 text-center text-sm text-slate-400">Loading…</p>
      )}
    </div>
  );
}
