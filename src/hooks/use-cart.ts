import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart.service";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useEffect } from "react";
import { toast } from "sonner";

export const cartKeys = {
  all: ["cart"] as const,
  user: (userId: string) => [...cartKeys.all, userId] as const,
};

export function useCart() {
  const { user } = useAuthStore();
  const { setCart } = useCartStore();

  const query = useQuery({
    queryKey: cartKeys.user(user?.id ?? ""),
    queryFn: () => cartService.getCart(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setCart(query.data as Parameters<typeof setCart>[0]);
    }
  }, [query.data, setCart]);

  return query;
}

export function useAddToCart() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      cartService.addToCart(user!.id, productId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartKeys.user(user?.id ?? "") });
      toast.success("Added to cart");
    },
    onError: () => toast.error("Failed to add to cart"),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateQuantity(itemId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.user(user?.id ?? "") }),
    onError: () => toast.error("Failed to update cart"),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeFromCart(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.user(user?.id ?? "") }),
    onError: () => toast.error("Failed to remove item"),
  });
}
