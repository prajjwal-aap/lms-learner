"use client";

import { Ellipsis, Eye, Heart, MessageCircle, Pin, Share } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAddComment, useToggleLike } from "../api/community.queries";
import type { Post, PostParagraph } from "../types";

// Lucide has no Om symbol (the brand mark), so it stays an inline SVG (Font Awesome Free "om", CC BY 4.0).
const OM_PATH =
  "M379.3 4.7c-6.2-6.2-16.4-6.2-22.6 0l-16 16c-6.2 6.2-6.2 16.4 0 22.6l16 16c6.2 6.2 16.4 6.2 22.6 0l16-16c6.2-6.2 6.2-16.4 0-22.6l-16-16zM281 66.7c-2.2-1.5-4.9-2.5-7.7-2.7c-.6 0-1.3-.1-1.9 0c-3.9 .2-7.4 1.7-10.1 4.2c-.9 .8-1.6 1.7-2.3 2.6c-1.7 2.4-2.7 5.3-2.9 8.5c0 .7 0 1.4 0 2.1c.2 2.2 .9 4.3 1.9 6.2l.3 .6c.3 .6 .8 1.4 1.4 2.4c1.2 2 2.9 4.8 5.1 8.2c4.4 6.7 11.1 15.5 20 24.4C302.4 141.1 330.3 160 368 160c31.2 0 56.6-10.4 73.9-20.2c8.7-5 15.6-9.9 20.4-13.8c2.4-1.9 4.3-3.6 5.7-4.9c.7-.6 1.3-1.2 1.7-1.6l.6-.5 .1-.1 .1-.1 0 0 0 0c5.9-5.8 9.5-13.9 9.5-22.8c0-17.7-14.3-32-32-32c-8.7 0-16.7 3.5-22.4 9.2c-.1 .1-.2 .2-.5 .4c-.5 .5-1.5 1.3-2.8 2.4c-2.7 2.2-6.8 5.2-12.1 8.2C399.4 90.4 384.8 96 368 96c-20.8 0-42.4-7-59.5-14.6c-8.4-3.7-15.4-7.5-20.3-10.3c-2.4-1.4-4.3-2.5-5.6-3.3c-.6-.4-1.1-.7-1.4-.9l-.3-.2zM115.2 169.6c8-6 17.9-9.6 28.8-9.6c26.5 0 48 21.5 48 48s-21.5 48-48 48H109.8c-7.6 0-13.8 6.2-13.8 13.8c0 1.5 .2 2.9 .7 4.4l8 24c4.4 13.1 16.6 21.9 30.4 21.9H144h16c35.3 0 64 28.7 64 64s-28.7 64-64 64c-50.8 0-82.7-21.5-102.2-42.8c-9.9-10.8-16.6-21.6-20.9-29.7c-2.1-4-3.6-7.3-4.5-9.6c-.5-1.1-.8-2-1-2.5l-.2-.5c-.3-.9-.7-1.8-1.1-2.6c-1.2-2.2-2.8-4-4.7-5.4c-1.9-1.4-4.1-2.3-6.5-2.8c-1.4-.3-2.9-.3-4.4-.2c-2.5 .2-4.8 1-6.8 2.3c-1.1 .7-2.2 1.5-3.1 2.5c-2.4 2.5-4.1 5.8-4.5 9.5c-.1 .6-.1 1.1-.1 1.7c0 0 0 0 0 0c0 .8 .1 1.7 .2 2.5l0 .1c0 .3 .1 .8 .2 1.3c.2 1.1 .4 2.7 .8 4.6c.8 3.9 2 9.4 3.9 15.9c3.8 13 10.3 30.4 21.3 48C48.7 476.2 89.4 512 160 512c70.7 0 128-57.3 128-128c0-23.3-6.2-45.2-17.1-64h22.6c25.5 0 49.9-10.1 67.9-28.1l26.5-26.5c6-6 14.1-9.4 22.6-9.4H416c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32c-25.7 0-41.4-12.5-51.2-25.6c-5-6.7-8.4-13.4-10.5-18.6c-1.1-2.5-1.8-4.6-2.2-6c-.2-.7-.4-1.2-.5-1.5l-.1-.2c-.3-1.3-.8-2.6-1.5-3.8c-1.1-2-2.6-3.8-4.4-5.1c-2.7-2-6-3.2-9.6-3.2l-.2 0c-8 .1-14.6 6.1-15.6 13.9l0 0c0 .3-.1 .6-.2 1.1c-.1 .9-.3 2.1-.4 3.6c-.3 3-.6 7.3-.6 12.4c0 10.1 1.1 23.9 5.8 38.1c4.8 14.3 13.4 29.3 28.6 40.7C368.7 473.3 389.3 480 416 480c53 0 96-43 96-96V288c0-53-43-96-96-96h-5.5c-25.5 0-49.9 10.1-67.9 28.1l-26.5 26.5c-6 6-14.1 9.4-22.6 9.4H245.2c6.9-14.5 10.8-30.8 10.8-48c0-61.9-50.1-112-112-112c-25.2 0-48.5 8.3-67.2 22.4c-14.1 10.6-17 30.7-6.4 44.8s30.7 17 44.8 6.4z";

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
      <svg className="size-3 fill-current" viewBox="0 0 512 512" aria-hidden="true">
        <path d={OM_PATH} />
      </svg>
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
            <Pin className="size-[11px] shrink-0 -rotate-45 transform" />
            <span>Pinned</span>
          </div>
        )}
        <button type="button" aria-label="Post options" className="text-gray-400 hover:text-gray-700">
          <Ellipsis className="size-3.5" />
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
            <Heart className="size-3.5 shrink-0" fill={post.likedByMe ? "currentColor" : "none"} />
            <span>{post.likes}</span>
          </button>
          <button
            type="button"
            aria-expanded={showComments}
            aria-label="Comments"
            onClick={() => setShowComments((s) => !s)}
            className={cn("flex items-center space-x-1.5 transition hover:text-blue-500", showComments && "text-blue-500")}
          >
            <MessageCircle className="size-3.5 shrink-0" />
            <span>{post.comments.length}</span>
          </button>
          <div className="flex items-center space-x-1.5" aria-label={`${post.views} views`}>
            <Eye className="size-3.5 shrink-0" />
            <span>{compact(post.views)}</span>
          </div>
        </div>
        <button type="button" onClick={share} className="flex items-center space-x-1.5 transition hover:text-gray-800">
          <Share className="size-3 shrink-0" />
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
