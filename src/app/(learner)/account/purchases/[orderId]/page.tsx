import { Suspense } from "react";
import { OrderDetailScreen } from "@/features/account";

type Props = { params: Promise<{ orderId: string }> };

export const metadata = { title: "Order details" };

// Orders are per-learner, so the page streams at request time instead of being prerendered.
export default function OrderPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">Loading order…</div>}>
      <Order params={params} />
    </Suspense>
  );
}

async function Order({ params }: Props) {
  const { orderId } = await params;
  return <OrderDetailScreen orderId={orderId} />;
}
