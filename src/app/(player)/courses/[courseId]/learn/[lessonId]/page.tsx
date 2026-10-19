import { Suspense } from "react";
import { ProfileMenu } from "@/features/auth";
import { LessonPlayerScreen } from "@/features/courses";

type Props = { params: Promise<{ courseId: string; lessonId: string }> };

export const metadata = { title: "Lesson" };

// Outside the (learner) group: the player has its own full-height header. Lesson data needs the
// learner's session, so it loads client-side through the gateway proxy.
export default function LessonPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-sm text-gray-500">Loading lesson…</div>}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Props) {
  const { courseId, lessonId } = await params;
  return <LessonPlayerScreen courseId={courseId} lessonId={lessonId} profileSlot={<ProfileMenu />} />;
}
