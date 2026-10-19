"use client";

import { useState, type FormEvent } from "react";
import { useCreatePost } from "../api/community.queries";

interface PostComposerProps {
  channelId: string;
  channelName: string;
  onClose: () => void;
}

/** Inline "Create" composer opened from the sidebar button. */
export function PostComposer({ channelId, channelName, onClose }: PostComposerProps) {
  const [text, setText] = useState("");
  const createPost = useCreatePost();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    createPost.mutate({ text: body, channelId, channelName }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Create post</h3>
        <span className="text-[11px] text-gray-500">Posting to {channelName}</span>
      </div>
      <textarea
        autoFocus
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share something with your batch..."
        className="w-full resize-none rounded-lg border-gray-200 text-xs focus:border-purple-400 focus:ring-purple-200"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!text.trim() || createPost.isPending}
          className="rounded-md bg-[#6b1b9a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#581380] disabled:opacity-50"
        >
          {createPost.isPending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
