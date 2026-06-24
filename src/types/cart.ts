import type { Database } from "./database";
import type { ProductWithImages } from "./product";

export type Cart = Database["public"]["Tables"]["cart"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];

export interface CartItemWithProduct extends CartItem {
  products: ProductWithImages;
}

export interface CartWithItems extends Cart {
  cart_items: CartItemWithProduct[];
}
