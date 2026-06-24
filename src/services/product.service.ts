import { createClient } from "@/lib/supabase/client";
import type { ProductFilters } from "@/types/product";
import type { Database } from "@/types/database";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type ProductWithDetails = ProductRow & {
  product_images: ProductImageRow[];
  categories: CategoryRow | null;
};

const supabase = createClient();

const PRODUCT_SELECT = `
  *,
  product_images(*),
  categories(*)
`;

export const productService = {
  async getProducts(filters: ProductFilters = {}) {
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true);

    if (filters.category) {
      query = query.eq("categories.slug", filters.category);
    }
    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    switch (filters.sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { products: (data ?? []) as unknown as ProductWithDetails[], count };
  },

  async getFeaturedProducts(): Promise<ProductWithDetails[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithDetails[];
  },

  async getNewArrivals(): Promise<ProductWithDetails[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .eq("is_new_arrival", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithDetails[];
  },

  async getProductBySlug(slug: string): Promise<ProductWithDetails> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error) throw error;
    return data as unknown as ProductWithDetails;
  },

  async getProductById(id: string): Promise<ProductWithDetails> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as unknown as ProductWithDetails;
  },

  async getRelatedProducts(categoryId: string, excludeId: string): Promise<ProductWithDetails[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .neq("id", excludeId)
      .limit(4);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithDetails[];
  },

  async createProduct(product: ProductInsert) {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async uploadProductImage(file: File, productId: string) {
    const ext = file.name.split(".").pop();
    const path = `products/${productId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  async addProductImage(productId: string, url: string, isPrimary = false) {
    const { data, error } = await supabase
      .from("product_images")
      .insert({ product_id: productId, url, is_primary: isPrimary, sort_order: 0 })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProductImage(imageId: string) {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);
    if (error) throw error;
  },

  async getAdminProducts(): Promise<ProductWithDetails[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithDetails[];
  },
};
