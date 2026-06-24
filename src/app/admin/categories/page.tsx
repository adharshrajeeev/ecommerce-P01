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
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/product";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function AdminCategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useAdminCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    reset({ is_active: true, sort_order: 0 });
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
    const categoryData = {
      ...data,
      slug: slugify(data.name),
      description: data.description ?? null,
      image_url: data.image_url || null,
      parent_id: null,
    };

    if (editing) {
      updateCategory({ id: editing.id, updates: categoryData }, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      createCategory(categoryData, {
        onSuccess: () => setDialogOpen(false),
      });
    }
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
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
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {cat.image_url && (
                        <div className="relative h-8 w-8 rounded-md overflow-hidden bg-muted shrink-0">
                          <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                        </div>
                      )}
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{cat.slug}</td>
                  <td className="p-3 hidden sm:table-cell">{cat.sort_order}</td>
                  <td className="p-3">
                    <Badge variant={cat.is_active ? "success" : "secondary"}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this category?")) deleteCategory(cat.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input {...register("name")} placeholder="Electronics" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...register("description")} placeholder="Category description" />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input {...register("image_url")} placeholder="https://example.com/image.jpg" />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input {...register("sort_order")} type="number" placeholder="0" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("is_active")} className="h-4 w-4" defaultChecked />
              <Label>Active</Label>
            </div>
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
    </div>
  );
}
