import type { Endorsement } from "../types";

/** "Trusted by Icons & Creators" photo grid. */
export function EndorsementsSection({ endorsements }: { endorsements: Endorsement[] }) {
  return (
    <section className="py-16 bg-[#fafaff]" data-purpose="celebrity-endorsements">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">STAR-STUDDED ENDORSEMENT</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-600 mt-1">
          Trusted by{" "}
          <span className="underline decoration-brand-200 decoration-4 underline-offset-8">Icons &amp; Creators</span>
        </h2>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {endorsements.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl overflow-hidden shadow-xs border border-slate-200 aspect-3/4 bg-slate-100 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={e.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                src={e.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
