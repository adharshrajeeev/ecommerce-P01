import type { Database } from "./database";
import type { ProductWithImages } from "./product";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];

export interface OrderItemWithProduct extends OrderItem {
  products: ProductWithImages;
}

export interface OrderWithItems extends Order {
  order_items: OrderItemWithProduct[];
  addresses: Address;
}
