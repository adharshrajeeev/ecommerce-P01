import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/services/wishlist.service";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useEffect } from "react";
import { toast } from "sonner";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  user: (userId: string) => [...wishlistKeys.all, userId] as const,
};

export function useWishlist() {
  const { user } = useAuthStore();
  const { setProductIds } = useWishlistStore();

  const query = useQuery({
    queryKey: wishlistKeys.user(user?.id ?? ""),
    queryFn: () => wishlistService.getWishlist(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (query.data) {
      setProductIds(query.data.map((item) => item.product_id));
    }
  }, [query.data, setProductIds]);

  return query;
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { addId, removeId, isWishlisted } = useWishlistStore();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Login required");
      const wishlisted = isWishlisted(productId);
      if (wishlisted) {
        await wishlistService.removeFromWishlist(user.id, productId);
        removeId(productId);
        toast.success("Removed from wishlist");
      } else {
        await wishlistService.addToWishlist(user.id, productId);
        addId(productId);
        toast.success("Added to wishlist");
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: wishlistKeys.user(user?.id ?? "") }),
    onError: (err: Error) => toast.error(err.message || "Failed"),
  });
}
