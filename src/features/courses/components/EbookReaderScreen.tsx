"use client";

import { ArrowLeft, BookOpen, Download, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { track } from "@/lib/analytics";
import { openInNewTab } from "@/lib/openInNewTab";
import { downloadEbook, saveEbookPage } from "../api/learning.api";
import { useEbook, useLibrary, usePurchasedEbook } from "../api/learning.queries";
import { lmsErrorMessage } from "../lib/learning";
import { PdfViewer } from "./PdfViewer";

/** Saving the page is debounced (§9.10: "send progress when the page changes, debounce ~5 s"). */
const SAVE_AFTER_MS = 5000;

const downloadClass =
  "ml-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50";

type Props = {
  publicationId: string;
  /** Set for ebooks bought through an order: `publicationId` is then the product id. */
  orderId?: string;
  profileSlot?: ReactNode;
};

/** Full-screen e-book reader: signed PDF, watermark, page progress, download when allowed. */
export function EbookReaderScreen({ publicationId, orderId, profileSlot }: Props) {
  return orderId ? (
    <PurchasedEbookReader orderId={orderId} productId={publicationId} profileSlot={profileSlot} />
  ) : (
    <LibraryEbookReader publicationId={publicationId} profileSlot={profileSlot} />
  );
}

/** LMS publication (§9.10): signed URL, watermark, saved page, download when allowed. */
function LibraryEbookReader({ publicationId, profileSlot }: { publicationId: string; profileSlot?: ReactNode }) {
  const { data: ebook, error, isLoading } = useEbook(publicationId);
  const { data: library } = useLibrary({ type: "EBOOK" });
  const title = library?.pages.flatMap((p) => p.items).find((c) => c.resource.id === publicationId)?.title ?? "E-book";
  // The tab is opened inside the click (popup blockers), so the mutation just awaits that promise.
  const download = useMutation({
    mutationFn: (opening: Promise<void>) => opening,
    onSuccess: () => track("file_download", { file_name: title }),
  });

  // Debounced page saving, flushed when the reader closes.
  const pending = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const lastSaved = useRef<number | null>(null);
  const flush = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    if (pending.current && pending.current !== lastSaved.current) {
      lastSaved.current = pending.current;
      void saveEbookPage(publicationId, pending.current);
    }
  };
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => () => flushRef.current(), []);

  const onPage = (page: number) => {
    if (lastSaved.current === null) lastSaved.current = ebook?.last_page ?? null;
    pending.current = page;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, SAVE_AFTER_MS);
  };

  return (
    <ReaderShell title={title} profileSlot={profileSlot} isLoading={isLoading} error={error}>
      {ebook && (
        <PdfViewer
          url={ebook.url}
          watermark={ebook.watermark_text}
          initialPage={Math.max(1, ebook.last_page)}
          onPageChange={onPage}
          className="min-h-0 flex-1"
          actions={
            ebook.allow_download && (
              <button
                type="button"
                onClick={() => download.mutate(openInNewTab(() => downloadEbook(publicationId)))}
                disabled={download.isPending}
                title={download.error ? lmsErrorMessage(download.error).text : undefined}
                className={downloadClass}
              >
                <Download className="size-3 shrink-0" />
                <span className="hidden sm:inline">{download.isPending ? "Preparing…" : "Download"}</span>
              </button>
            )
          }
        />
      )}
    </ReaderShell>
  );
}

/** Order-based ebook (§8.3): the order's file link in the same reader. The order already offers it as a download. */
function PurchasedEbookReader({ orderId, productId, profileSlot }: { orderId: string; productId: string; profileSlot?: ReactNode }) {
  const { data: ebook, error, isLoading } = usePurchasedEbook(orderId, productId);
  return (
    <ReaderShell title={ebook?.title ?? "E-book"} profileSlot={profileSlot} isLoading={isLoading} error={error}>
      {ebook && (
        <PdfViewer
          url={ebook.url}
          watermark=""
          fallbackUrl={ebook.url}
          className="min-h-0 flex-1"
          actions={
            <a
              href={ebook.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("file_download", { file_name: ebook.title })}
              className={downloadClass}
            >
              <Download className="size-3 shrink-0" />
              <span className="hidden sm:inline">Download</span>
            </a>
          }
        />
      )}
    </ReaderShell>
  );
}

type ShellProps = { title: string; profileSlot?: ReactNode; isLoading: boolean; error: unknown; children: ReactNode };

function ReaderShell({ title, profileSlot, isLoading, error, children }: ShellProps) {
  return (
    <div className="flex h-dvh flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href={ROUTES.courses}
            aria-label="Back to My Learnings"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <BookOpen className="size-4 shrink-0 text-brand-600" />
          <h1 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{title}</h1>
        </div>
        {profileSlot}
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          <LoaderCircle className="mr-2 size-3.5 animate-spin text-brand-600" />
          Opening e-book…
        </div>
      ) : error || !children ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <h2 className="text-lg font-bold text-gray-900">{lmsErrorMessage(error).title}</h2>
          <p className="max-w-md text-sm text-gray-600">{lmsErrorMessage(error).text}</p>
          <Link href={ROUTES.courses} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Back to My Learnings
          </Link>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
