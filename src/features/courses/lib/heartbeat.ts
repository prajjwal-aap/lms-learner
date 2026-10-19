import { track } from "@/lib/analytics";
import { sendHeartbeat } from "../api/learning.api";

/** The bits of a media element we read; HTMLVideoElement and VdoCipher's `player.video` both fit. */
export type MediaLike = {
  currentTime: number;
  duration: number;
  playbackRate: number;
  paused: boolean;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
};

const EVERY_MS = 30_000;
/** Pause / seek beats are throttled so we stay under the 4-per-minute limit (§9.8). */
const MIN_GAP_MS = 15_000;
/** A jump larger than this between timeupdates is a seek, not watching. */
const MAX_TICK_SEC = 2.5;

type Options = { courseId: string; lessonId: string; title: string; durationSec: number | null; onEnded?: () => void };

/**
 * Sends progress heartbeats while the media plays: every 30 s, plus on pause, seek, end and teardown.
 * `delta_sec` counts only seconds actually watched. Returns a cleanup that sends the final beat.
 */
export function attachHeartbeat(media: MediaLike, { courseId, lessonId, title, durationSec, onEnded }: Options) {
  let watched = 0;
  let last = media.currentTime;
  let lastSent = 0;
  let started = false;

  const beat = (force = false) => {
    const now = Date.now();
    if (!force && now - lastSent < MIN_GAP_MS) return;
    if (!force && watched <= 0) return;
    lastSent = now;
    void sendHeartbeat(
      { course_id: courseId, lesson_id: lessonId, position_sec: media.currentTime, delta_sec: watched, playback_rate: media.playbackRate || 1 },
      durationSec ?? (Number.isFinite(media.duration) ? media.duration : null),
    );
    watched = 0;
  };

  const onTime = () => {
    const t = media.currentTime;
    const d = t - last;
    if (d > 0 && d < MAX_TICK_SEC) watched += d;
    last = t;
  };
  const onPlay = () => {
    if (!started) {
      started = true;
      track("video_start", { video_title: title });
    }
  };
  const onPause = () => beat();
  const onSeeked = () => {
    last = media.currentTime;
    beat();
  };
  const onEnd = () => {
    beat(true);
    track("video_complete", { video_title: title });
    onEnded?.();
  };

  media.addEventListener("timeupdate", onTime);
  media.addEventListener("play", onPlay);
  media.addEventListener("pause", onPause);
  media.addEventListener("seeked", onSeeked);
  media.addEventListener("ended", onEnd);
  const timer = window.setInterval(() => !media.paused && beat(true), EVERY_MS);

  return () => {
    window.clearInterval(timer);
    media.removeEventListener("timeupdate", onTime);
    media.removeEventListener("play", onPlay);
    media.removeEventListener("pause", onPause);
    media.removeEventListener("seeked", onSeeked);
    media.removeEventListener("ended", onEnd);
    if (started) beat(true);
  };
}
