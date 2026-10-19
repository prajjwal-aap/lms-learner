"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "../types";

type Props = {
  testimonials: Testimonial[];
  studentsCount: string;
  onRegisterClick: () => void;
};

/** "Voices of Our Learners" review card (with dot pager) + purple quick-register bar. */
export function TestimonialsSection({ testimonials, studentsCount, onRegisterClick }: Props) {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];

  return (
    <section className="py-16 bg-white border-y border-slate-100" data-purpose="student-reviews">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-600">Voices of Our Learners</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Thousands have learned with us. Here&apos;s what some of them say.
        </p>

        {t && (
          <div className="mt-10 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-left shadow-xs relative">
            <div className="flex text-amber-400 text-sm gap-1 mb-3" aria-label={`${t.rating} out of 5 stars`}>
              {"★ ".repeat(t.rating).trim()}
            </div>
            <blockquote className="text-slate-700 text-sm sm:text-base italic leading-relaxed">
              &quot;{t.quote}&quot;
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {t.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                <p className="text-[11px] text-slate-500">{t.city}</p>
              </div>
            </div>
          </div>
        )}
        {testimonials.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show review ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-brand-600" : "w-1.5 bg-slate-300 hover:bg-slate-400",
                )}
              />
            ))}
          </div>
        )}

        {/* Purple quick register bar */}
        <div className="mt-12 bg-brand-600 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-purple-900/10">
          <div className="text-left">
            <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider block">Still thinking?</span>
            <h3 className="text-lg sm:text-xl font-bold mt-0.5">
              Join {studentsCount} Satisfied Students Who have Transformed Their Lives
            </h3>
          </div>
          <button
            type="button"
            onClick={onRegisterClick}
            className="shrink-0 bg-white text-brand-700 hover:bg-purple-50 text-xs uppercase font-extrabold px-6 py-3 rounded-lg tracking-wider shadow-sm transition"
          >
            REGISTER NOW
          </button>
        </div>
      </div>
    </section>
  );
}
