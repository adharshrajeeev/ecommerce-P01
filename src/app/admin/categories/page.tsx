"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/product";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function AdminCategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: categories = [], isLoading } = useAdminCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    reset({ is_active: true, sort_order: 0, name: "", description: "", image_url: "" });
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    reset({
      name: cat.name,
      description: cat.description ?? "",
      image_url: cat.image_url ?? "",
      sort_order: cat.sort_order,
      is_active: cat.is_active,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      slug: slugify(data.name),
      description: data.description || null,
      image_url: data.image_url || null,
      parent_id: null,
    };
    if (editing) {
      updateCategory({ id: editing.id, updates: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createCategory(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try { await deleteCategory(deleteTarget.id); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">{categories.length} total categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="border rounded-xl p-16 text-center text-muted-foreground">
          No categories yet.{" "}
          <button onClick={openCreate} className="text-primary hover:underline">Add your first category.</button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Slug</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Order</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {cat.image_url
                          ? <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="40px" />
                          : <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-muted-foreground">{cat.name[0]}</span>
                        }
                      </div>
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        {cat.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{cat.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">{cat.slug}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{cat.sort_order}</td>
                  <td className="p-3">
                    <Badge variant={cat.is_active ? "success" : "secondary"} className="text-xs">
                      {cat.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input {...register("name")} placeholder="e.g. Electronics" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...register("description")} placeholder="Short description (optional)" />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input {...register("image_url")} placeholder="https://images.unsplash.com/…" />
              {errors.image_url && <p className="text-xs text-destructive">{errors.image_url.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input {...register("sort_order")} type="number" placeholder="0" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("is_active")} className="h-4 w-4 accent-primary" defaultChecked />
              <span className="text-sm font-medium">Active (visible in store)</span>
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Update" : "Create"} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Products in this category will lose their category. This action cannot be undone."
        confirmLabel="Delete Category"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
