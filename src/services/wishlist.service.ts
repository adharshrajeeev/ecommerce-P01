import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type WishlistRow = Database["public"]["Tables"]["wishlist"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type WishlistWithProduct = WishlistRow & {
  products: (ProductRow & {
    product_images: ProductImageRow[];
    categories: CategoryRow | null;
  }) | null;
};

const supabase = createClient();

const WISHLIST_SELECT = `
  *,
  products(
    *,
    product_images(*),
    categories(*)
  )
`;

export const wishlistService = {
  async getWishlist(userId: string): Promise<WishlistWithProduct[]> {
    const { data, error } = await supabase
      .from("wishlist")
      .select(WISHLIST_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as WishlistWithProduct[];
  },

  async addToWishlist(userId: string, productId: string) {
    const { data, error } = await supabase
      .from("wishlist")
      .insert({ user_id: userId, product_id: productId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeFromWishlist(userId: string, productId: string) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (error) throw error;
  },

  async isInWishlist(userId: string, productId: string) {
    const { data } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();
    return !!data;
  },
};
