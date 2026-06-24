import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDetail } from "./order-detail";

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full rounded-xl" /></div>}>
      <OrderDetail />
    </Suspense>
  );
}
