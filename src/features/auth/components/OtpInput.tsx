"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { OTP_LENGTH } from "../types";

type Props = {
  /** One digit (or "") per box. */
  value: string[];
  onChange: (next: string[]) => void;
  inputClassName: string;
  className?: string;
  placeholder?: string;
};

/** Row of single-digit boxes with auto-advance, backspace-to-previous and paste support. */
export function OtpInput({ value, onChange, inputClassName, className, placeholder }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(i, value.length - 1))]?.focus();

  const setDigit = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < value.length - 1) focus(i + 1);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      e.preventDefault();
      const next = [...value];
      next[i - 1] = "";
      onChange(next);
      focus(i - 1);
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    const next = [...value];
    digits.split("").forEach((d, k) => {
      if (i + k < next.length) next[i + k] = d;
    });
    onChange(next);
    focus(i + digits.length);
  };

  return (
    <div className={className}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-label={`Digit ${i + 1}`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          className={inputClassName}
          inputMode="numeric"
          maxLength={1}
          pattern="[0-9]"
          placeholder={placeholder}
          type="text"
          value={digit}
          onChange={(e) => setDigit(i, e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
        />
      ))}
    </div>
  );
}

export const emptyOtp = (length = OTP_LENGTH) => Array.from({ length }, () => "");
