"use client";

import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  /** Drawn over every page (§9.6 / §9.10). */
  watermark: string;
  /** 1-based page to open at. */
  initialPage?: number;
  /** Called when the most visible page changes. */
  onPageChange?: (page: number, pageCount: number) => void;
  /** Extra toolbar buttons (e.g. Download). */
  actions?: ReactNode;
  className?: string;
};

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

/** In-app PDF reader (pdf.js): lazy page rendering, watermark on each page, page tracking. */
export function PdfViewer({ url, watermark, initialPage = 1, onPageChange, actions, className }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [ratio, setRatio] = useState(1.414);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(initialPage);
  const jumped = useRef(false);
  const onPageChangeRef = useRef(onPageChange);
  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  });

  // Load the document (pdf.js is imported on demand so it stays out of other pages' bundles).
  // Each load owns its worker: tearing down a superseded load (e.g. a remount) must not kill the live document's worker.
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const worker = new pdfjs.PDFWorker();
        const task = pdfjs.getDocument({ url, worker });
        cleanup = () => {
          void task.destroy();
          worker.destroy();
        };
        const d = await task.promise;
        if (cancelled) return;
        const first = (await d.getPage(1)).getViewport({ scale: 1 });
        setRatio(first.height / first.width);
        setDoc(d);
      } catch {
        if (!cancelled) setError("Couldn't open this PDF. The link may have expired — reload the page to try again.");
      }
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [url]);

  // Fit pages to the reader width.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.min(entry.contentRect.width - 32, 900)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pageWidth = Math.max(0, Math.round(width * zoom));

  // Open at the saved page once the layout exists.
  useEffect(() => {
    if (!doc || !pageWidth || jumped.current) return;
    jumped.current = true;
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-page="${Math.min(initialPage, doc.numPages)}"]`);
    if (el && scrollRef.current) scrollRef.current.scrollTop = el.offsetTop - 16;
  }, [doc, pageWidth, initialPage]);

  // Track the most visible page.
  useEffect(() => {
    const root = scrollRef.current;
    if (!doc || !root) return;
    const visible = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(Number((e.target as HTMLElement).dataset.page), e.intersectionRatio);
        let best = 0;
        let bestRatio = 0;
        visible.forEach((r, n) => {
          if (r > bestRatio) [best, bestRatio] = [n, r];
        });
        if (best) setPage(best);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    root.querySelectorAll("[data-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [doc, pageWidth]);

  useEffect(() => {
    if (doc) onPageChangeRef.current?.(page, doc.numPages);
  }, [page, doc]);

  const zoomIndex = ZOOMS.indexOf(zoom);

  return (
    <div className={cn("flex min-h-0 flex-col bg-gray-100", className)}>
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 text-sm">
        <span className="font-medium text-gray-700" aria-live="polite">
          {doc ? `Page ${page} of ${doc.numPages}` : "Loading…"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom(ZOOMS[Math.max(0, zoomIndex - 1)])}
            disabled={zoomIndex <= 0}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            <i className="fa-solid fa-magnifying-glass-minus" />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-gray-500">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, zoomIndex + 1)])}
            disabled={zoomIndex >= ZOOMS.length - 1}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            <i className="fa-solid fa-magnifying-glass-plus" />
          </button>
          {actions}
        </div>
      </div>

      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto px-4 py-4" onContextMenu={(e) => e.preventDefault()}>
        {error ? (
          <p className="mx-auto mt-10 max-w-md text-center text-sm text-red-600">{error}</p>
        ) : !doc || !pageWidth ? (
          <div className="mx-auto mt-10 flex flex-col items-center gap-3 text-sm text-gray-500">
            <i className="fa-solid fa-spinner animate-spin text-2xl text-brand-600" />
            Opening document…
          </div>
        ) : (
          <div className="mx-auto flex flex-col items-center gap-4" style={{ width: pageWidth }}>
            {Array.from({ length: doc.numPages }, (_, i) => (
              <PdfPage key={i} doc={doc} number={i + 1} width={pageWidth} ratio={ratio} watermark={watermark} root={scrollRef} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type PageProps = { doc: PDFDocumentProxy; number: number; width: number; ratio: number; watermark: string; root: React.RefObject<HTMLDivElement | null> };

/** One page: a sized placeholder that renders into a canvas when it scrolls near the viewport. */
function PdfPage({ doc, number, width, ratio, watermark, root }: PageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { root: root.current, rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  useEffect(() => {
    if (!near) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(number);
      if (cancelled || !canvas.current) return;
      const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
      const dpr = window.devicePixelRatio || 1;
      const c = canvas.current;
      c.width = Math.floor(viewport.width * dpr);
      c.height = Math.floor(viewport.height * dpr);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      task = page.render({ canvasContext: ctx, viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined });
      // A cancelled render (scrolled away / resized) rejects; the page simply re-renders next time.
      await task.promise.catch(() => undefined);
    })().catch(() => undefined);
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [near, doc, number, width]);

  return (
    <div ref={wrap} data-page={number} className="relative overflow-hidden bg-white shadow-md" style={{ width, height: Math.round(width * ratio) }}>
      <canvas ref={canvas} className="h-full w-full" aria-label={`Page ${number}`} />
      {/* Watermark: tiled, rotated, not selectable */}
      <div className="pointer-events-none absolute inset-0 grid select-none grid-cols-2 content-around justify-items-center overflow-hidden opacity-[0.12]" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="-rotate-[30deg] whitespace-nowrap text-xl font-bold tracking-widest text-gray-900">
            {watermark}
          </span>
        ))}
      </div>
    </div>
  );
}
