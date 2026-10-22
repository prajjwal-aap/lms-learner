import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

/** Intrinsic size of public/og-logo.svg (lotus mark + "Occult Gurukul" wordmark). */
const LOGO_WIDTH = 206;
const LOGO_HEIGHT = 88;

/**
 * The Occult Gurukul logo. Size it by height (`h-*`); width follows the aspect ratio.
 * The wordmark is dark, so on dark backgrounds put it on a light surface. `preload` for above-the-fold headers.
 */
export function OgLogo({ className, preload = false }: { className?: string; preload?: boolean }) {
  return (
    <Image src="/og-logo.svg" alt="Occult Gurukul" width={LOGO_WIDTH} height={LOGO_HEIGHT} preload={preload} className={cn("h-10 w-auto", className)} />
  );
}

/** Logo linking home, used in the learner header. */
export function BrandMark({ href = ROUTES.home }: { href?: string }) {
  return (
    <Link aria-label="Occult Gurukul home" href={href} className="flex shrink-0 items-center">
      <OgLogo preload />
    </Link>
  );
}
