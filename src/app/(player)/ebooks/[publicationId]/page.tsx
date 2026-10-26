import { Suspense } from "react";
import { ProfileMenu } from "@/features/auth";
import { EbookReaderScreen } from "@/features/courses";

type Props = { params: Promise<{ publicationId: string }>; searchParams: Promise<{ order?: string | string[] }> };

export const metadata = { title: "E-book" };

export default function EbookPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-sm text-gray-500">Opening e-book…</div>}>
      <Ebook params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Ebook({ params, searchParams }: Props) {
  const [{ publicationId }, { order }] = await Promise.all([params, searchParams]);
  // `?order=` marks an ebook bought through an order (see ROUTES.purchasedEbook).
  const orderId = typeof order === "string" && order ? order : undefined;
  return <EbookReaderScreen publicationId={publicationId} orderId={orderId} profileSlot={<ProfileMenu />} />;
}
