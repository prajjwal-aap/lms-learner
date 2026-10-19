"use client";

import Link from "next/link";
import { useState } from "react";
import { useHeroSlides } from "../api/community.queries";

/** Featured course banner with prev/next arrows. */
export function HeroCarousel() {
  const { data: slides, isPending } = useHeroSlides();
  const [index, setIndex] = useState(0);

  if (isPending) return <div className="h-60 animate-pulse rounded-xl bg-gray-200" aria-busy="true" />;
  if (!slides?.length) return null;

  const slide = slides[index % slides.length];
  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured programs"
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0b0c16] via-[#1c1c38] to-[#2b2b46] text-white shadow-md"
    >
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() => go(-1)}
            className="absolute left-2.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xs text-white hover:bg-black/70"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={() => go(1)}
            className="absolute right-2.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xs text-white hover:bg-black/70"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </>
      )}

      <div key={slide.id} className="flex items-center justify-between p-6 pr-4">
        <div className="z-10 flex w-full flex-col items-center space-y-3 px-4 text-center sm:w-[62%] sm:px-0">
          <div className="relative w-full max-w-[280px] rounded-xs bg-gradient-to-r from-[#d9a74a] via-[#f7e089] to-[#d9a74a] px-4 py-1.5 text-center shadow-sm">
            <h2 className="font-serif text-sm font-extrabold uppercase tracking-wide text-[#201004] drop-shadow-sm md:text-base">
              {slide.title}
            </h2>
          </div>
          <div className="w-full rounded-md border border-[#e6b85c]/60 bg-black/20 p-3 backdrop-blur-[1px]">
            <div className="mb-1 text-xs font-medium tracking-wide text-[#f7e089]">{slide.tagline}</div>
            <p className="text-[11px] leading-tight text-gray-200">{slide.description}</p>
          </div>
          <Link
            href={slide.href}
            className="transform rounded-sm bg-[#6b1b9a] px-6 py-2 text-xs font-semibold text-white shadow-md transition-transform hover:bg-[#581380] active:scale-95"
          >
            {slide.ctaLabel}
          </Link>
        </div>
        <div className="relative hidden h-48 w-[38%] justify-end sm:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={slide.imageAlt} className="h-full rounded-md object-cover drop-shadow-lg" src={slide.imageUrl} />
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === index % slides.length}
              onClick={() => setIndex(i)}
              className={i === index % slides.length ? "h-1.5 w-4 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/40"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
