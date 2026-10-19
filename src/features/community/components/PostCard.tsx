"use client";

import { useState, type FormEvent } from "react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAddComment, useToggleLike } from "../api/community.queries";
import type { Post, PostParagraph } from "../types";

/** Characters shown before "See more". */
const PREVIEW_CHARS = 380;

/** 1890 → "1.89K" */
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2).replace(/\.?0+$/, "")}K` : String(n));

/** Cuts the paragraph list at PREVIEW_CHARS; `truncated` tells whether "See more" is needed. */
function preview(paragraphs: PostParagraph[]) {
  const out: PostParagraph[] = [];
  let used = 0;
  for (const p of paragraphs) {
    if (used + p.text.length > PREVIEW_CHARS) {
      out.push({ ...p, text: `${p.text.slice(0, Math.max(0, PREVIEW_CHARS - used)).trimEnd()}...` });
      return { paragraphs: out, truncated: true };
    }
    out.push(p);
    used += p.text.length;
  }
  return { paragraphs: out, truncated: false };
}

const paragraphClass = (p: PostParagraph, i: number) =>
  p.strong ? "font-semibold text-gray-900" : i === 0 ? undefined : "leading-normal text-gray-700";

function AuthorAvatar({ post }: { post: Post }) {
  if (post.author.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={post.author.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6a1b9a] text-base font-bold text-white">
      <i className="fa-solid fa-om text-xs" />
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [shared, setShared] = useState(false);
  const toggleLike = useToggleLike();
  const addComment = useAddComment();

  const { paragraphs, truncated } = expanded ? { paragraphs: post.paragraphs, truncated: false } : preview(post.paragraphs);

  const share = async () => {
    const url = `${window.location.origin}${ROUTES.community}#${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.author.name, text: post.paragraphs[0]?.text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch {
      // User dismissed the share sheet or clipboard is blocked — nothing to do.
    }
  };

  const submitComment = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    addComment.mutate({ postId: post.id, text }, { onSuccess: () => setDraft("") });
  };

  return (
    <article id={post.id} className="space-y-3.5 rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
      <div className={cn("flex items-center text-xs text-gray-500", post.pinned ? "justify-between" : "justify-end")}>
        {post.pinned && (
          <div className="flex items-center space-x-1.5 font-medium">
            <i className="fa-solid fa-thumbtack -rotate-45 transform text-[11px]" />
            <span>Pinned</span>
          </div>
        )}
        <button type="button" aria-label="Post options" className="text-gray-400 hover:text-gray-700">
          <i className="fa-solid fa-ellipsis text-sm" />
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <AuthorAvatar post={post} />
        <div>
          <h4 className="text-xs font-bold leading-tight text-gray-900">{post.author.name}</h4>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-gray-500">
            <span>{post.postedAgo}</span>
            <span>•</span>
            <span>{post.channelName}</span>
            {post.extraAudience ? (
              <span className="rounded-sm bg-gray-100 px-1 py-0.5 text-[10px] font-medium text-gray-600">
                +{post.extraAudience}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-1 text-xs leading-relaxed text-gray-800">
        {paragraphs.map((p, i) => (
          <p key={i} className={paragraphClass(p, i)}>
            {p.text}
            {truncated && i === paragraphs.length - 1 && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="ml-1 inline font-medium text-blue-600 hover:underline"
              >
                See more
              </button>
            )}
          </p>
        ))}
        {expanded && (
          <button type="button" onClick={() => setExpanded(false)} className="font-medium text-blue-600 hover:underline">
            See less
          </button>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-5">
          <button
            type="button"
            aria-pressed={post.likedByMe}
            aria-label={post.likedByMe ? "Unlike" : "Like"}
            onClick={() => toggleLike.mutate(post.id)}
            className={cn("flex items-center space-x-1.5 transition hover:text-red-500", post.likedByMe && "text-red-500")}
          >
            <i className={cn(post.likedByMe ? "fa-solid" : "fa-regular", "fa-heart text-sm")} />
            <span>{post.likes}</span>
          </button>
          <button
            type="button"
            aria-expanded={showComments}
            aria-label="Comments"
            onClick={() => setShowComments((s) => !s)}
            className={cn("flex items-center space-x-1.5 transition hover:text-blue-500", showComments && "text-blue-500")}
          >
            <i className="fa-regular fa-comment text-sm" />
            <span>{post.comments.length}</span>
          </button>
          <div className="flex items-center space-x-1.5" aria-label={`${post.views} views`}>
            <i className="fa-regular fa-eye text-sm" />
            <span>{compact(post.views)}</span>
          </div>
        </div>
        <button type="button" onClick={share} className="flex items-center space-x-1.5 transition hover:text-gray-800">
          <i className="fa-solid fa-arrow-up-from-bracket text-xs" />
          <span className="text-xs font-medium">{shared ? "Link copied" : "Share"}</span>
        </button>
      </div>

      {showComments && (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          {post.comments.length === 0 && <p className="text-xs text-gray-400">No comments yet. Be the first to comment.</p>}
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-600">
                {c.author.charAt(0)}
              </div>
              <div className="min-w-0 flex-1 rounded-lg bg-gray-50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-gray-900">{c.author}</span>
                  <span className="text-gray-400">{c.postedAgo}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-700">{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment..."
              aria-label="Write a comment"
              className="min-w-0 flex-1 rounded-lg border-gray-200 px-3 py-1.5 text-xs focus:border-purple-400 focus:ring-purple-200"
            />
            <button
              type="submit"
              disabled={!draft.trim() || addComment.isPending}
              className="rounded-lg bg-[#6b1b9a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#581380] disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
