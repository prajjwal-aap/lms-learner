import { OgLogo } from "@/components/layout";

const PERKS =["Verified Certification", "Lifetime Community Access"];

/** "Our Legacy" block with the certificate illustration. */
export function LegacySection() {
  return (
    <section className="py-16 bg-white border-y border-slate-100" data-purpose="legacy-certificate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">OUR LEGACY</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-600 mt-1">
          A Tradition of{" "}
          <span className="underline decoration-brand-200 decoration-4 underline-offset-8">Trust &amp; Recognition</span>
        </h2>
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center text-left">
          <div className="space-y-4 md:pr-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Building Confident Astrologers Across the World
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              It is not simply about courses, it is about transformation. Students worldwide look up to us, and
              industry recognitions are testimonials to the success created by our leading guidance.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Certificate illustration card */}
          <div className="flex justify-center">
            <div className="relative bg-linear-to-tr from-amber-50 to-orange-50 border-8 border-amber-200/80 rounded-2xl shadow-xl p-8 max-w-md w-full text-center transform hover:-translate-y-1 transition duration-300">
              <div className="border border-amber-300/80 p-6 rounded-xl flex flex-col items-center">
                <OgLogo className="h-12 mb-2" />
                <p className="text-[10px] tracking-widest uppercase text-amber-700 font-semibold">CERTIFICATE OF COMPLETION</p>
                <div className="w-12 h-0.5 bg-amber-400 my-2" />
                <p className="text-[11px] text-slate-500 italic">This certificate is awarded to</p>
                <h4 className="font-serif italic text-2xl my-2 text-brand-700">Your Name</h4>
                <p className="text-[11px] text-slate-600 max-w-xs">for completing Occult Gurukul’s</p>
                <p className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wide">
                  Advance Numerology Mentorship Program
                </p>
                <p className="text-[10px] text-slate-500">by Astro Arun Pandit</p>
                <div className="mt-6 pt-4 border-t border-amber-200 w-full flex justify-between items-center text-[10px] text-slate-400">
                  <span>VERIFIED ID: OG-9821</span>
                  <span>CHIEF MENTOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
