"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useUploadProfilePhoto } from "../api/account.queries";

type Props = {
  name: string;
  avatarUrl: string | null;
  /** Tailwind size classes, e.g. "h-24 w-24 text-3xl". */
  size?: string;
  /** Shows the camera button that uploads a new photo. */
  editable?: boolean;
};

/** Learner photo (or initial) with an optional "change photo" button. */
export function ProfileAvatar({ name, avatarUrl, size = "h-24 w-24 text-3xl", editable = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadProfilePhoto();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative shrink-0", size)}>
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700 ring-4 ring-white shadow-sm">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar host is user-uploaded S3, not in next/image config
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            name.trim().charAt(0).toUpperCase() || <i className="fa-solid fa-user" />
          )}
          {upload.isPending && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
              <i className="fa-solid fa-spinner animate-spin text-base" />
            </span>
          )}
        </div>
        {editable && (
          <>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={upload.isPending}
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-xs text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
            >
              <i className="fa-solid fa-camera" />
            </button>
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) upload.mutate(file);
              }}
            />
          </>
        )}
      </div>
      {upload.error && <p className="max-w-[200px] text-center text-xs text-red-600">{upload.error.message}</p>}
    </div>
  );
}
