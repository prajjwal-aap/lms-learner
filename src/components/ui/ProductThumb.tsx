import { BookOpen, GraduationCap, Layers, RadioTower, Video, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ART: Record<string, { gradient: string; icon: LucideIcon }> = {
  COURSE: { gradient: "from-[#1a0836] via-[#35105d] to-[#4c1d95]", icon: GraduationCap },
  SELF_PLACED: { gradient: "from-[#1a0836] via-[#35105d] to-[#4c1d95]", icon: GraduationCap },
  BUNDLE: { gradient: "from-[#3b0764] via-[#6b21a8] to-[#9333ea]", icon: Layers },
  EBOOK: { gradient: "from-[#422006] via-[#713f12] to-[#a16207]", icon: BookOpen },
  WEBINAR: { gradient: "from-[#041a2f] via-[#0b2b48] to-[#155e75]", icon: Video },
  MASTERCLASS: { gradient: "from-[#3b0808] via-[#7f1d1d] to-[#b45309]", icon: RadioTower },
  PUBLICATION: { gradient: "from-[#422006] via-[#713f12] to-[#a16207]", icon: BookOpen },
  LIVE_SESSION: { gradient: "from-[#041a2f] via-[#0b2b48] to-[#155e75]", icon: Video },
};

type Props = {
  src: string | null | undefined;
  title: string;
  /** Catalog / cart product type; picks the fallback artwork. */
  type: string;
  className?: string;
  /** Hide the title on the fallback art (small thumbnails). */
  compact?: boolean;
};

/** Product image, or branded gradient artwork with the title when the CMS has no thumbnail. */
export function ProductThumb({ src, title, type, className, compact = false }: Props) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- CDN host isn't configured for next/image
    return <img src={src} alt="" className={cn("h-full w-full object-cover", className)} loading="lazy" />;
  }
  const art = TYPE_ART[type] ?? TYPE_ART.COURSE;
  const Icon = art.icon;
  return (
    <div className={cn("relative flex h-full w-full flex-col justify-end overflow-hidden bg-gradient-to-br text-white", art.gradient, compact ? "items-center justify-center" : "p-4", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:14px_14px]" />
      <Icon className={cn("absolute shrink-0 text-white/10", compact ? "static size-4 text-white/80" : "right-4 top-4 size-12")} />
      {!compact && (
        <>
          <span className="relative mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Occult Gurukul</span>
          <span className="relative line-clamp-2 text-lg font-extrabold uppercase leading-tight tracking-tight">{title}</span>
        </>
      )}
    </div>
  );
}
