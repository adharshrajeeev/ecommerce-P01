import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import type { ProductFilters } from "@/types/product";
import type { ProductWithDetails } from "@/services/product.service";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  newArrivals: () => [...productKeys.all, "new-arrivals"] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
  related: (categoryId: string, excludeId: string) =>
    [...productKeys.all, "related", categoryId, excludeId] as const,
  admin: () => [...productKeys.all, "admin"] as const,
};

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getProducts(filters),
    staleTime: 3 * 60_000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: productService.getFeaturedProducts,
    staleTime: 5 * 60_000,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: productService.getNewArrivals,
    staleTime: 5 * 60_000,
  });
}

export function useProduct(slug: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60_000,
    // Instantly seed from any list cache — no skeleton flash if already seen
    initialData: () => {
      const sources = [
        qc.getQueryData<ProductWithDetails[]>(productKeys.featured()),
        qc.getQueryData<ProductWithDetails[]>(productKeys.newArrivals()),
        qc.getQueryData<ProductWithDetails[]>(productKeys.admin()),
        (qc.getQueryData<{ products: ProductWithDetails[] }>(productKeys.list({})))?.products,
      ];
      for (const list of sources) {
        const hit = list?.find((p) => p.slug === slug);
        if (hit) return hit;
      }
    },
  });
}

export function useRelatedProducts(categoryId: string, excludeId: string) {
  return useQuery({
    queryKey: productKeys.related(categoryId, excludeId),
    queryFn: () => productService.getRelatedProducts(categoryId, excludeId),
    enabled: !!categoryId && !!excludeId,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: productKeys.admin(),
    queryFn: productService.getAdminProducts,
    staleTime: 5 * 60_000,   // 5 min — no refetch when switching admin tabs
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof productService.updateProduct>[1] }) =>
      productService.updateProduct(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}
