"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T;
  /** Value meaning "no filter"; the pill shows `label` and inactive styling for it. */
  emptyValue: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

/** Pill button with a small popover menu (Service / Duration filters). */
export function FilterDropdownPill<T extends string>({ label, value, emptyValue, options, onChange }: Props<T>) {
  // Menu is `position: fixed` so the horizontally-scrolling pill bar doesn't clip it.
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const open = anchor !== null;
  const ref = useRef<HTMLDivElement>(null);
  const setOpen = (next: boolean) => {
    const r = ref.current?.getBoundingClientRect();
    setAnchor(next && r ? { top: r.bottom + 8, left: r.left } : null);
  };
  const active = value !== emptyValue;
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAnchor(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAnchor(null);
    const dismiss = () => setAnchor(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 transition-colors",
          active
            ? "border-brand-800 bg-brand-50 font-semibold text-brand-800 hover:bg-brand-100"
            : "border-gray-200 font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50",
        )}
      >
        <span>{active && current ? current.label : label}</span>
        <svg
          className={cn("h-3.5 w-3.5 transition-transform", active ? "text-brand-800" : "text-gray-500", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
      {anchor && (
        <ul
          role="listbox"
          style={{ top: anchor.top, left: anchor.left }}
          className="fixed z-40 min-w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-gray-50",
                  o.value === value ? "font-semibold text-brand-800" : "text-gray-700",
                )}
              >
                {o.label}
                {o.value === value && <i className="fa-solid fa-check text-xs" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
