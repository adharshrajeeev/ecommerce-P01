"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Database } from "@/types/database";

type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];

const statusOptions: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAdminOrders();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">{orders.length} total orders</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Order ID</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Customer</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const customer = (order as { users?: { full_name: string; email: string } }).users;
                  return (
                    <tr key={order.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {customer?.full_name ?? "—"}
                      </td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="p-3 font-medium">{formatPrice(order.total_amount)}</td>
                      <td className="p-3">
                        <Select
                          defaultValue={order.status}
                          onValueChange={(v) =>
                            updateStatus({ orderId: order.id, status: v as OrderStatus })
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/orders/${order.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
