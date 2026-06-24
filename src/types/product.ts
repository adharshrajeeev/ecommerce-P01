import type { Database } from "./database";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

export interface ProductWithImages extends Product {
  product_images: ProductImage[];
  categories: Category | null;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: "latest" | "price_asc" | "price_desc";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
