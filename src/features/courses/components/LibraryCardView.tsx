import { Calendar, CircleCheck } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { ProductThumb } from "@/components/ui/ProductThumb";
import { formatWhen } from "../lib/learning";
import type { LibraryCard } from "../types";

const TYPE_LABEL = { COURSE: "Course", PUBLICATION: "E-book", LIVE_SESSION: "Live class" } as const;

/** Where a library card leads: course home, ebook reader, live sessions — or the product page to renew. */
export function libraryHref(card: LibraryCard) {
  if (card.access.status === "EXPIRED") return card.product_slug ? ROUTES.product(card.product_slug) : ROUTES.store;
  if (card.purchase) {
    // Order-based purchases (§8.3) have no LMS ids: ebooks open their download link, live classes go to Live
    // Sessions, courses open by product id (the course page explains if the course isn't in the player yet).
    if (card.resource.type === "PUBLICATION") return card.purchase.downloadUrl ?? ROUTES.account.order(card.purchase.orderId);
    if (card.resource.type === "LIVE_SESSION") return card.purchase.replayUrl ?? ROUTES.liveSessions;
    return ROUTES.course(card.purchase.productId);
  }
  if (card.resource.type === "PUBLICATION") return ROUTES.ebook(card.resource.id);
  if (card.resource.type === "LIVE_SESSION") return ROUTES.liveSessions;
  if (card.next_action.lesson_id && card.next_action.type === "CONTINUE") return ROUTES.lesson(card.resource.id, card.next_action.lesson_id);
  return ROUTES.course(card.resource.id);
}

function ctaLabel(card: LibraryCard) {
  if (card.access.status === "EXPIRED") return "Renew access";
  if (card.purchase) {
    // No file attached to the order yet (e.g. TagMango-era purchases): say so rather than a vague "View purchase".
    if (card.resource.type === "PUBLICATION") return card.purchase.downloadUrl ? "Download e-book" : "File not available yet";
    if (card.resource.type === "LIVE_SESSION") return card.purchase.replayUrl ? "Watch replay" : "View schedule";
    return "Start learning";
  }
  switch (card.next_action.type) {
    case "START":
      return card.resource.type === "PUBLICATION" ? "Start reading" : "Start learning";
    case "CONTINUE":
      return "Continue";
    case "READ":
      return card.progress.last_page ? "Continue reading" : "Start reading";
    case "JOIN":
      return "Join now";
    case "WATCH_REPLAY":
      return "Watch replay";
    case "WAIT":
      return "View schedule";
    default:
      return card.resource.type === "COURSE" ? "Review course" : "Open";
  }
}

/** One item in the My Learnings grid. */
export function LibraryCardView({ card }: { card: LibraryCard }) {
  const expired = card.access.status === "EXPIRED";
  const p = card.progress;
  const pct = p.pct ?? 0;
  const href = libraryHref(card);
  const external = /^https?:\/\//.test(href);

  return (
    <Link
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <ProductThumb src={card.thumbnail_url} title={card.title} type={card.resource.type} className={expired ? "grayscale" : undefined} />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-xs">
          {TYPE_LABEL[card.resource.type]}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {(expired || card.access.expires_at) && (
            <span className="mb-1.5 inline-block rounded-sm bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
              {expired ? "Expired" : `Valid till ${new Date(card.access.expires_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
            </span>
          )}
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-800">{card.title}</h2>

          {card.purchase ? (
            <p className="mb-4 mt-1.5 text-xs text-gray-500">
              <CircleCheck className="mr-1.5 inline-block size-3 align-[-0.125em] text-emerald-600" />
              Purchased
              {card.purchase.classDate && ` • ${card.purchase.classDate.slice(0, 16)} IST`}
              {card.resource.type === "PUBLICATION" && !card.purchase.downloadUrl && (
                <span className="mt-1 block text-[11px] text-amber-700">The e-book file hasn&apos;t been added to your account yet.</span>
              )}
            </p>
          ) : card.resource.type === "LIVE_SESSION" ? (
            <p className="mb-4 mt-1.5 text-xs text-gray-500">
              {p.next_session ? (
                <>
                  <Calendar className="mr-1.5 inline-block size-3 align-[-0.125em]" />
                  Next: {formatWhen(p.next_session.scheduled_at)}
                </>
              ) : (
                "No upcoming sessions"
              )}
            </p>
          ) : (
            <div className="mb-4 mt-2">
              <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
                <span>
                  {card.resource.type === "PUBLICATION"
                    ? p.page_count
                      ? `Page ${p.last_page ?? 0} of ${p.page_count}`
                      : "Not started"
                    : p.total_lessons
                      ? `${p.completed_lessons ?? 0} of ${p.total_lessons} lessons`
                      : "Not started"}
                </span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div className={pct === 100 ? "h-full rounded-full bg-emerald-600" : "h-full rounded-full bg-brand-600"} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
        <span
          className={
            expired
              ? "block w-full rounded-lg border border-brand-600 px-4 py-2.5 text-center text-xs font-semibold text-brand-700 transition-colors group-hover:bg-brand-50"
              : "block w-full rounded-lg bg-black px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors duration-200 group-hover:bg-gray-800"
          }
        >
          {ctaLabel(card)}
        </span>
      </div>
    </Link>
  );
}
