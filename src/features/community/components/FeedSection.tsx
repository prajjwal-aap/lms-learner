"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePosts } from "../api/community.queries";
import type { FeedSort, Post } from "../types";
import { PostCard } from "./PostCard";

const SORTS: { id: FeedSort; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "most-liked", label: "Most liked" },
  { id: "most-viewed", label: "Most viewed" },
];

const sorters: Record<FeedSort, (a: Post, b: Post) => number> = {
  latest: (a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt),
  "most-liked": (a, b) => b.likes - a.likes,
  "most-viewed": (a, b) => b.views - a.views,
};

interface FeedSectionProps {
  /** Channel id to restrict to; undefined = all posts. */
  channelId?: string;
  title: string;
}

/** "Feed" header with sort menu + post list (pinned posts always first). */
export function FeedSection({ channelId, title }: FeedSectionProps) {
  const { data: posts, isPending, isError } = usePosts();
  const [sort, setSort] = useState<FeedSort>("latest");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const visible = (posts ?? [])
    .filter((p) => !channelId || p.channelId === channelId)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || sorters[sort](a, b));

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Sort feed"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <i className="fa-solid fa-bars-staggered text-xs" />
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-level-2">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sort === s.id}
                  onClick={() => {
                    setSort(s.id);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50",
                    sort === s.id ? "font-semibold text-[#5e227f]" : "text-gray-700",
                  )}
                >
                  {s.label}
                  {sort === s.id && <i className="fa-solid fa-check text-[10px]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isPending ? (
        <div className="h-56 animate-pulse rounded-xl border border-gray-200 bg-white" aria-busy="true" />
      ) : isError ? (
        <p className="text-sm text-red-600">Could not load the feed. Please try again.</p>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-xs text-gray-500 shadow-2xs">
          No posts in this channel yet.
        </div>
      ) : (
        visible.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </section>
  );
}
