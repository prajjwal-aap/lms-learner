import type { CatalogSort, Language, Level, ProductType } from "../types";

export const TYPE_LABEL: Record<ProductType, string> = {
  COURSE: "Course",
  BUNDLE: "Bundle",
  EBOOK: "E-book",
  WEBINAR: "Webinar",
  MASTERCLASS: "Masterclass",
};

/** Section titles when the grid is grouped by type. */
export const TYPE_PLURAL: Record<ProductType, string> = {
  COURSE: "Courses",
  BUNDLE: "Bundles",
  EBOOK: "E-books",
  WEBINAR: "Webinars",
  MASTERCLASS: "Masterclasses",
};

export const TYPE_ORDER: ProductType[] = ["COURSE", "BUNDLE", "MASTERCLASS", "WEBINAR", "EBOOK"];

export const LANGUAGE_LABEL: Record<Language, string> = { HINDI: "Hindi", ENGLISH: "English", HINGLISH: "Hinglish" };

export const LEVEL_LABEL: Record<Level, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced", ALL: "All levels" };

export const SORT_LABEL: Record<CatalogSort, string> = {
  popular: "Most popular",
  new: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

export const discountPct = (pricePaise: number, mrpPaise: number) => (mrpPaise > pricePaise ? Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100) : 0);

/** "Sat, 24 Oct • 7:30 PM IST" */
export const formatSlot = (iso: string) =>
  `${new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })} IST`;

/** "15hr 30min" from seconds. */
export function formatHours(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.round((totalSec % 3600) / 60);
  return h ? `${h}hr${m ? ` ${m}min` : ""}` : `${m}min`;
}
