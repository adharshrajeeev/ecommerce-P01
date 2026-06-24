import type { Database } from "./database";
import type { ProductWithImages } from "./product";

export type WishlistItem = Database["public"]["Tables"]["wishlist"]["Row"];

export interface WishlistItemWithProduct extends WishlistItem {
  products: ProductWithImages;
}
