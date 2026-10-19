"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { ProductThumb } from "@/components/ui/ProductThumb";
import { useCourseHome } from "../api/learning.queries";
import { flatLessons, formatDuration, lmsErrorMessage, resumeLessonId } from "../lib/learning";
import { CourseCurriculum } from "./CourseCurriculum";

const card = "rounded-xl border border-gray-200/80 bg-white p-6 shadow-2xs md:p-8";

/** Course home (GET /lms/v1/me/courses/:id): hero with progress + Continue, modules, description. */
export function CourseHomeScreen({ courseId }: { courseId: string }) {
  const { data: home, isLoading, error } = useCourseHome(courseId);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 sm:px-6 md:py-10" aria-busy="true">
        <div className={`${card} mb-8 h-56 animate-pulse`} />
        <div className={`${card} h-72 animate-pulse`} />
      </main>
    );
  }

  if (error || !home) {
    const msg = lmsErrorMessage(error);
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-600">
          <i className={msg.code === "ACCESS_EXPIRED" ? "fa-solid fa-hourglass-end" : "fa-solid fa-lock"} />
        </span>
        <h1 className="text-xl font-bold text-gray-900">{msg.code === "NOT_FOUND" ? "Course not in the player yet" : msg.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {msg.code === "NOT_FOUND"
            ? "If you bought this course, your purchase is safe. It hasn't been set up in the new learning player yet and will open here once it's ready."
            : msg.text}
        </p>
        {msg.code === "NOT_FOUND" && (
          <Link href={ROUTES.account.purchases} className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
            View purchase history
          </Link>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link href={ROUTES.courses} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Back to My Learnings
          </Link>
          {(msg.code === "ACCESS_EXPIRED" || msg.code === "NO_ACCESS") && (
            <Link href={ROUTES.store} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              {msg.code === "ACCESS_EXPIRED" ? "Renew access" : "Browse courses"}
            </Link>
          )}
        </div>
      </main>
    );
  }

  const { course, progress } = home;
  const resumeId = resumeLessonId(home);
  const totalSec = flatLessons(home).reduce((n, l) => n + (l.duration_sec ?? 0), 0);
  const label = progress.pct >= 100 ? "Review course" : progress.completed_lessons > 0 ? "Continue" : "Start learning";

  return (
    <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 sm:px-6 md:py-10">
      <section className={`${card} mb-8`}>
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <div className="aspect-[16/10] w-full max-w-[360px] overflow-hidden rounded-xl md:col-span-5">
            <ProductThumb src={course.thumbnail_url} title={course.title} type="COURSE" />
          </div>
          <div className="md:col-span-7">
            <Link href={ROUTES.courses} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
              <i className="fa-solid fa-arrow-left text-xs" />
              Back to My Learnings
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{course.title}</h1>
            {course.mentors.length > 0 && <p className="mt-1 text-sm text-gray-500">By {course.mentors.map((m) => m.display_name).join(", ")}</p>}
            {home.access.expires_at && (
              <p className="mt-2 text-xs font-semibold text-amber-700">
                Access until {new Date(home.access.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
            <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="max-w-sm flex-1">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {progress.completed_lessons} of {progress.total_lessons} lessons
                  </span>
                  <span className="font-semibold">{progress.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${progress.pct}%` }} />
                </div>
              </div>
              {resumeId && (
                <Link
                  href={ROUTES.lesson(course.id, resumeId)}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-7 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-700"
                >
                  {label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={`${card} mb-8`}>
        <h2 className="mb-1 text-xl font-bold text-gray-900">Contents</h2>
        <p className="mb-6 text-xs font-medium text-gray-500 sm:text-sm">
          {home.sections.length} modules • {progress.total_lessons} lessons{totalSec > 0 && ` • ${formatDuration(totalSec)} of video`}
          {course.settings.sequential_unlock && " • lessons unlock in order"}
        </p>
        <CourseCurriculum courseId={course.id} sections={home.sections} activeLessonId={resumeId} />
      </section>

      {course.description && (
        <section className={card}>
          <h2 className="mb-3 text-xl font-bold text-gray-900">About this course</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{course.description}</p>
        </section>
      )}
    </main>
  );
}
