import { Suspense } from "react";
import { CourseHomeScreen } from "@/features/courses";

type Props = { params: Promise<{ courseId: string }> };

export const metadata = { title: "Course" };

// Course access is per-learner, so the course loads client-side with the learner's session.
export default function CourseHomePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">Loading course…</div>}>
      <Course params={params} />
    </Suspense>
  );
}

async function Course({ params }: Props) {
  const { courseId } = await params;
  return <CourseHomeScreen courseId={courseId} />;
}
