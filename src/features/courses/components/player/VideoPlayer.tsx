"use client";

import { useEffect, useRef, useState } from "react";
import { attachHeartbeat, type MediaLike } from "../../lib/heartbeat";
import type { Playback } from "../../types";

const VDO_API = "https://player.vdocipher.com/v2/api.js";

declare global {
  interface Window {
    VdoPlayer?: { getInstance: (iframe: HTMLIFrameElement) => { video: MediaLike } };
  }
}

let vdoApi: Promise<void> | null = null;
function loadVdoApi() {
  vdoApi ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = VDO_API;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      vdoApi = null;
      reject(new Error("player api"));
    };
    document.head.appendChild(s);
  });
  return vdoApi;
}

type Props = {
  playback: Extract<Playback, { provider: "VDOCIPHER" | "DYNTUBE" | "MOCK_MEDIA" }>;
  courseId: string;
  lessonId: string;
  title: string;
  durationSec: number | null;
  onEnded: () => void;
  /** Heartbeats and completion live on the server; refetch progress when playback stops. */
  onProgressMaybeChanged: () => void;
};

/** VdoCipher web player, or our own <video> (DynTube HLS / mock mode), wired to progress heartbeats. */
export function VideoPlayer({ playback, courseId, lessonId, title, durationSec, onEnded, onProgressMaybeChanged }: Props) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [apiFailed, setApiFailed] = useState(false);
  const [streamFailed, setStreamFailed] = useState(false);
  const callbacks = useRef({ onEnded, onProgressMaybeChanged });
  useEffect(() => {
    callbacks.current = { onEnded, onProgressMaybeChanged };
  });

  useEffect(() => {
    let detach: (() => void) | null = null;
    let destroyHls: (() => void) | null = null;
    let cancelled = false;
    const options = { courseId, lessonId, title, durationSec, onEnded: () => callbacks.current.onEnded() };

    if (playback.provider === "MOCK_MEDIA" && video.current) {
      detach = attachHeartbeat(video.current, options);
    } else if (playback.provider === "DYNTUBE" && video.current) {
      const el = video.current;
      detach = attachHeartbeat(el, options);
      // Safari (and iOS) play HLS natively; elsewhere hls.js feeds the stream through Media Source Extensions.
      if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = playback.url;
      } else {
        import("hls.js")
          .then(({ default: Hls }) => {
            if (cancelled) return;
            if (!Hls.isSupported()) return setStreamFailed(true);
            const hls = new Hls();
            destroyHls = () => hls.destroy();
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (!data.fatal) return;
              hls.destroy();
              setStreamFailed(true);
            });
            hls.loadSource(playback.url);
            hls.attachMedia(el);
          })
          .catch(() => !cancelled && setStreamFailed(true));
      }
    } else if (playback.provider === "VDOCIPHER") {
      loadVdoApi()
        .then(() => {
          if (cancelled || !iframe.current || !window.VdoPlayer) return;
          const media = window.VdoPlayer.getInstance(iframe.current).video;
          const seek = () => {
            if (playback.resume_at_sec > 5) media.currentTime = playback.resume_at_sec;
            media.removeEventListener("loadedmetadata", seek);
          };
          media.addEventListener("loadedmetadata", seek);
          detach = attachHeartbeat(media, options);
        })
        // Without the API the video still plays; only resume/progress tracking is lost.
        .catch(() => !cancelled && setApiFailed(true));
    }
    return () => {
      cancelled = true;
      // Final heartbeat reads the position, so it goes before the stream is torn down.
      detach?.();
      destroyHls?.();
      callbacks.current.onProgressMaybeChanged();
    };
  }, [playback, courseId, lessonId, title, durationSec]);

  return (
    <div className="relative flex w-full justify-center bg-black">
      <div className="relative aspect-video max-h-[70vh] w-full">
        {playback.provider === "VDOCIPHER" ? (
          <iframe
            ref={iframe}
            src={`https://player.vdocipher.com/v2/?otp=${encodeURIComponent(playback.otp)}&playbackInfo=${encodeURIComponent(playback.playback_info)}&autoplay=true`}
            title={title}
            className="h-full w-full border-0"
            allow="encrypted-media; autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            ref={video}
            src={playback.provider === "MOCK_MEDIA" ? playback.url : undefined}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onLoadedMetadata={(e) => {
              if (playback.resume_at_sec > 5) e.currentTarget.currentTime = playback.resume_at_sec;
            }}
            className="h-full w-full bg-black object-contain"
          />
        )}
        {/* VdoCipher draws its own watermark; our <video> needs one on top. */}
        {playback.provider === "DYNTUBE" && playback.watermark_text && (
          <span className="pointer-events-none absolute right-4 top-4 select-none text-sm font-semibold tracking-widest text-white/30" aria-hidden="true">
            {playback.watermark_text}
          </span>
        )}
        {streamFailed && (
          <p className="absolute inset-0 flex items-center justify-center bg-black/80 px-6 text-center text-sm text-white">
            This video can&apos;t be played right now. Please refresh and try again.
          </p>
        )}
        {apiFailed && (
          <p className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-1.5 text-center text-xs text-white/80">
            Progress can&apos;t be saved right now — the video still plays.
          </p>
        )}
      </div>
    </div>
  );
}
