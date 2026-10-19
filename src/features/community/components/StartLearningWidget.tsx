"use client";

import Link from "next/link";
import { ProductThumb } from "@/components/ui/ProductThumb";
import { ROUTES } from "@/config/routes";
import { useLibrary } from "@/features/courses";

/** Right column "Start learning" card (lg+ only, as in the design): the learner's active courses. */
export function StartLearningWidget() {
  const { data, isPending } = useLibrary({ type: "COURSE", status: "ACTIVE" });
  const courses = data?.pages[0]?.items.slice(0, 3) ?? [];

  return (
    <aside className="hidden w-80 shrink-0 p-6 lg:block">
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Start learning</h3>
          <Link className="text-xs font-medium text-blue-600 hover:underline" href={ROUTES.courses}>
            See all
          </Link>
        </div>
        {isPending ? (
          <div className="h-12 animate-pulse rounded-lg bg-gray-100" aria-busy="true" />
        ) : courses.length === 0 ? (
          <p className="text-[11px] text-gray-400">
            You are not enrolled in any course yet.{" "}
            <Link href={ROUTES.store} className="font-semibold text-brand-600 hover:underline">
              Browse courses
            </Link>
          </p>
        ) : (
          courses.map((c) => (
            <Link
              key={c.resource.id}
              href={ROUTES.course(c.resource.id)}
              className="group flex items-center justify-between rounded-lg p-1.5 transition hover:bg-gray-50"
            >
              <div className="min-w-0 pr-2">
                <h4 className="truncate text-xs font-semibold text-gray-800 group-hover:text-purple-900">{c.title}</h4>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {c.progress.total_lessons ? `${c.progress.completed_lessons ?? 0} of ${c.progress.total_lessons} lessons • ${c.progress.pct ?? 0}%` : "Not started"}
                </p>
              </div>
              <div className="h-9 w-14 shrink-0 overflow-hidden rounded-sm border border-gray-200">
                <ProductThumb src={c.thumbnail_url} title={c.title} type="COURSE" compact />
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
