"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CommunitySidebar } from "../types";

interface ChannelSidebarProps {
  data?: CommunitySidebar;
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

const Badge = ({ count, className }: { count: number; className?: string }) => (
  <span
    className={cn(
      "flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#d32f2f] px-1 text-white",
      className,
    )}
  >
    {count}
  </span>
);

/** Left column: Create, Feed/Messages and collapsible course groups. Hidden below md (see MobileChannelBar). */
export function ChannelSidebar({ data, activeId, onSelect, onCreate }: ChannelSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <aside className="hidden w-64 shrink-0 space-y-4 border-r border-gray-200 bg-white p-4 md:block">
      <button
        type="button"
        onClick={onCreate}
        className="flex w-full items-center justify-center rounded-md bg-[#757575] px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-[#616161]"
      >
        <i className="fa-solid fa-plus mr-2 text-xs" />
        Create
      </button>

      {!data ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <nav className="space-y-1">
            {data.nav.map((item) => {
              const active = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-[#f3e8f8] text-[#5e227f]" : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <i className={cn(item.icon, "text-base", active ? "text-[#6e2594]" : "text-gray-600")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? <Badge count={item.badge} className="text-[11px] font-semibold" /> : null}
                </button>
              );
            })}
          </nav>

          {data.groups.map((group) => {
            const open = !collapsed[group.id];
            return (
              <div key={group.id} className="border-t border-gray-100 pt-3">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setCollapsed((c) => ({ ...c, [group.id]: open }))}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-gray-800"
                >
                  <div className="flex items-center space-x-2">
                    <i className={cn("fa-solid fa-caret-down text-xs text-purple-900 transition-transform", !open && "-rotate-90")} />
                    <span className="text-xs font-semibold">{group.name}</span>
                    {group.hasUnread && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d32f2f]" />}
                  </div>
                </button>
                {open && (
                  <div className="mt-1 pl-2">
                    {group.channels.map((ch) => {
                      const active = ch.id === activeId;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => onSelect(ch.id)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition",
                            active ? "bg-[#f3e8f8] text-[#5e227f]" : "text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <span className={cn("text-sm", ch.iconClassName)}>
                              <i className={ch.icon} />
                            </span>
                            <span className={cn("truncate", active ? "text-[#5e227f]" : "text-gray-700")}>{ch.name}</span>
                          </div>
                          {ch.badge ? <Badge count={ch.badge} className="text-[10px] font-bold" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </aside>
  );
}

/** Horizontal channel picker shown instead of the sidebar on small screens. */
export function MobileChannelBar({ data, activeId, onSelect, onCreate }: ChannelSidebarProps) {
  if (!data) return null;
  const items = [
    ...data.nav.map((n) => ({ id: n.id, label: n.label, icon: n.icon, badge: n.badge })),
    ...data.groups.flatMap((g) => g.channels.map((c) => ({ id: c.id, label: c.name, icon: c.icon, badge: c.badge }))),
  ];
  return (
    <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 md:hidden">
      <button
        type="button"
        onClick={onCreate}
        className="flex shrink-0 items-center rounded-full bg-[#757575] px-3 py-1.5 text-xs font-medium text-white"
      >
        <i className="fa-solid fa-plus mr-1.5 text-[10px]" />
        Create
      </button>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex max-w-48 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
              active ? "border-[#e5d0f0] bg-[#f3e8f8] text-[#5e227f]" : "border-gray-200 bg-white text-gray-700",
            )}
          >
            <i className={item.icon} />
            <span className="truncate">{item.label}</span>
            {item.badge ? <Badge count={item.badge} className="text-[10px] font-bold" /> : null}
          </button>
        );
      })}
    </div>
  );
}
