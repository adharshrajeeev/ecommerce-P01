import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";

export const categoryKeys = {
  all: ["categories"] as const,
  active: () => [...categoryKeys.all, "active"] as const,
  admin: () => [...categoryKeys.all, "admin"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.active(),
    queryFn: categoryService.getCategories,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: categoryService.getAllCategories,
    staleTime: 5 * 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof categoryService.updateCategory>[1] }) =>
      categoryService.updateCategory(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
