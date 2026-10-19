import type { Faq } from "../types";

/** FAQ accordion (native <details>, so no client JS needed). */
export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" data-purpose="frequently-asked-questions">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <summary className="flex justify-between items-center gap-4 p-4 sm:p-5 font-semibold text-xs sm:text-sm text-slate-800 cursor-pointer list-none select-none hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <span>{f.question}</span>
              <span className="text-brand-600 font-bold text-lg group-open:rotate-45 transition transform duration-200">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
