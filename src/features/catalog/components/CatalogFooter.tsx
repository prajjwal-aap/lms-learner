import { OgLogo } from "@/components/layout";
import { CurrentYear } from "@/components/ui/CurrentYear";

const FOOTER_LINKS = ["Privacy Policy", "Terms of Service", "Refund Policy", "Support"];

/** Dark catalog footer from the design. */
export function CatalogFooter() {
  return (
    <footer className="bg-[#1b0933] text-gray-300 py-10 border-t border-purple-900/50 mt-12" data-purpose="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          {/* Dark wordmark needs a light plate on this footer. */}
          <div className="inline-flex rounded-lg bg-white px-3 py-1.5">
            <OgLogo className="h-9" />
          </div>
          <p className="text-xs text-purple-300/80">Empowering millions with genuine Vedic Science &amp; Astrology knowledge.</p>
        </div>
        <div className="text-xs text-purple-300/60 flex flex-wrap gap-4 justify-center">
          {FOOTER_LINKS.map((l) => (
            <a key={l} className="hover:text-white transition" href="#">
              {l}
            </a>
          ))}
        </div>
        <div className="text-xs text-purple-300/60">
          © <CurrentYear /> Occult Gurukul. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
