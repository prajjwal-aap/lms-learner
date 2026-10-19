import { Suspense } from "react";
import { ProductDetailScreen } from "@/features/catalog";

type Props = { params: Promise<{ slug: string }> };

export const metadata = { title: "Course details" };

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 text-sm text-gray-500">Loading…</div>}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailScreen slug={slug} />;
}
