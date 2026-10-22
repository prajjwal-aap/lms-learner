import Image from "next/image";

const PERKS =["Verified Certification", "Lifetime Community Access"];

/** Intrinsic size of public/images/certificate.jpg. */
const CERT_WIDTH = 1432;
const CERT_HEIGHT = 2036;

/** "Our Legacy" block with a sample certificate. */
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
          {/* Sample certificate */}
          <div className="flex justify-center">
            <Image
              src="/images/certificate.jpg"
              alt="Sample Occult Gurukul certificate of completion"
              width={CERT_WIDTH}
              height={CERT_HEIGHT}
              sizes="(min-width: 768px) 28rem, 100vw"
              className="max-w-sm w-full h-auto rounded-2xl shadow-xl transform hover:-translate-y-1 transition duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
