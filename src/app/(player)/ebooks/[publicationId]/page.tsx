import { Suspense } from "react";
import { ProfileMenu } from "@/features/auth";
import { EbookReaderScreen } from "@/features/courses";

type Props = { params: Promise<{ publicationId: string }> };

export const metadata = { title: "E-book" };

export default function EbookPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-sm text-gray-500">Opening e-book…</div>}>
      <Ebook params={params} />
    </Suspense>
  );
}

async function Ebook({ params }: Props) {
  const { publicationId } = await params;
  return <EbookReaderScreen publicationId={publicationId} profileSlot={<ProfileMenu />} />;
}
