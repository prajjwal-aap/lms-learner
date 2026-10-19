"use client";

import { useEffect, useState } from "react";

/** Seconds-remaining timer for OTP resend buttons. */
export function useCountdown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  return { seconds, start: setSeconds };
}

/** 45 → "0:45" */
export const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
