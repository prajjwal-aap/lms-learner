"use client";

import { cn } from "@/lib/utils";
import type { Mentor } from "../types";

type Props = {
  mentors: Mentor[];
  selectedId: string | null;
  /** Number of cards currently matching (shown on the active item). */
  resultCount: number;
  onSelect: (mentorId: string | null) => void;
};

const base = "w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition";
const active = "bg-brand-50 text-brand-600 font-bold border-l-4 border-brand-600";
const idle = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

/** Left sidebar list of mentors; selecting one filters the cards grid. */
export function MentorFilter({ mentors, selectedId, resultCount, onSelect }: Props) {
  const items: { id: string | null; name: string }[] = [{ id: null, name: "All Mentors" }, ...mentors];

  return (
    <aside
      className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs"
      data-purpose="mentor-filter-sidebar"
    >
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mentors Filter</h2>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-[11px] font-semibold text-brand-600 cursor-pointer hover:underline"
        >
          Reset
        </button>
      </div>
      <ul className="space-y-1 text-sm font-medium max-lg:flex max-lg:gap-1 max-lg:space-y-0 max-lg:overflow-x-auto no-scrollbar">
        {items.map((m) => {
          const isActive = m.id === selectedId;
          return (
            <li key={m.id ?? "all"} className="max-lg:shrink-0">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(m.id)}
                className={cn(base, "max-lg:whitespace-nowrap max-lg:gap-2", isActive ? active : idle)}
              >
                <span>{m.name}</span>
                {isActive && <span className="text-xs bg-brand-100 px-2 py-0.5 rounded-full">{resultCount}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
