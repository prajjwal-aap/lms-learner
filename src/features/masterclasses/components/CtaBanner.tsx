/** Bottom "Still Thinking?" counselling banner. */
export function CtaBanner({ image }: { image: string }) {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" data-purpose="counseling-cta">
      <div className="bg-linear-to-r from-brand-600 to-brand-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl overflow-hidden relative">
        <div className="space-y-4 max-w-md text-left z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Still Thinking ?
            <br />
            Let us help you take the first step.
          </h2>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-brand-700 hover:bg-slate-50 font-bold text-xs uppercase px-6 py-3 rounded-lg shadow-sm transition inline-block"
          >
            Talk to an expert
          </a>
        </div>
        <div className="relative z-10 w-52 sm:w-64 h-52 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Mentor Astro Arun Pandit" className="w-full h-full object-cover" src={image} />
        </div>
        {/* Decorative background blur circle */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  );
}
