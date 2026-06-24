import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type OrderInsert = Omit<Database["public"]["Tables"]["orders"]["Insert"], "address_id">;
type AddressInsert = Omit<Database["public"]["Tables"]["addresses"]["Insert"], "user_id">;
type OrderItemParam = { product_id: string; quantity: number; unit_price: number };

export const orderKeys = {
  all: ["orders"] as const,
  user: (userId: string) => [...orderKeys.all, "user", userId] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
  admin: () => [...orderKeys.all, "admin"] as const,
  stats: () => [...orderKeys.all, "stats"] as const,
};

export function useUserOrders() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: orderKeys.user(user?.id ?? ""),
    queryFn: () => orderService.getUserOrders(user!.id),
    enabled: !!user,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: orderKeys.admin(),
    queryFn: orderService.getAllOrders,
    staleTime: 2 * 60_000,   // orders update more often, 2 min
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: orderService.getAdminStats,
    staleTime: 2 * 60_000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation<Database["public"]["Tables"]["orders"]["Row"], Error, [OrderInsert, AddressInsert, OrderItemParam[]]>({
    mutationFn: (params) => orderService.createOrder(params[0], params[1], params[2]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.user(user?.id ?? "") });
      toast.success("Order placed successfully!");
    },
    onError: () => toast.error("Failed to place order"),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: Parameters<typeof orderService.updateOrderStatus>[1];
    }) => orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.admin() });
      toast.success("Order status updated");
    },
  });
}
