import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const CART_SELECT = `
  *,
  cart_items(
    *,
    products(
      *,
      product_images(*),
      categories(*)
    )
  )
`;

export const cartService = {
  async getOrCreateCart(userId: string) {
    const { data: existing } = await supabase
      .from("cart")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("cart")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  },

  async getCart(userId: string) {
    const { data, error } = await supabase
      .from("cart")
      .select(CART_SELECT)
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async addToCart(userId: string, productId: string, quantity = 1) {
    const cartId = await cartService.getOrCreateCart(userId);

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ cart_id: cartId, product_id: productId, quantity });
      if (error) throw error;
    }
  },

  async updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return cartService.removeFromCart(itemId);
    }
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", itemId);
    if (error) throw error;
  },

  async removeFromCart(itemId: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    if (error) throw error;
  },

  async clearCart(cartId: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);
    if (error) throw error;
  },
};
