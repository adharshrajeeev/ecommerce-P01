"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2, Star, X, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminProducts, useDeleteProduct } from "@/hooks/use-products";
import { useAdminCategories } from "@/hooks/use-categories";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPrice, slugify } from "@/lib/utils";
import type { ProductWithImages } from "@/types/product";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/hooks/use-products";

const supabase = createClient();

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  compare_price: z.coerce.number().positive().optional().or(z.literal("")),
  category_id: z.string().optional(),
  stock_quantity: z.coerce.number().min(0),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sku: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ImagePreview {
  url: string;
  file?: File;
  dbId?: string;
  is_primary: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nullify(val: string | undefined | null | number | ""): string | null {
  if (val === undefined || val === null || val === "" || val === 0) return null;
  return String(val);
}

async function uploadImage(file: File, productId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `products/${productId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });
  if (error) throw new Error("Image upload failed: " + error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

// ─── Product Form Dialog ──────────────────────────────────────────────────────

function ProductDialog({
  open,
  onClose,
  editing,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  editing: ProductWithImages | null;
  categories: { id: string; name: string }[];
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImagePreview[]>(() =>
    (editing?.product_images ?? []).map((img) => ({
      url: img.url,
      dbId: img.id,
      is_primary: img.is_primary,
    }))
  );
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      price: editing?.price ?? undefined,
      compare_price: editing?.compare_price ?? undefined,
      category_id: editing?.category_id ?? "",
      stock_quantity: editing?.stock_quantity ?? 0,
      is_featured: editing?.is_featured ?? false,
      is_new_arrival: editing?.is_new_arrival ?? false,
      is_active: editing?.is_active ?? true,
      sku: editing?.sku ?? "",
    },
  });

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const previews: ImagePreview[] = files.map((file, i) => ({
      url: URL.createObjectURL(file),
      file,
      is_primary: images.length === 0 && i === 0,
    }));
    setImages((prev) => {
      const next = [...prev, ...previews];
      // Ensure exactly one primary
      if (!next.some((img) => img.is_primary) && next.length > 0) next[0].is_primary = true;
      return next;
    });
    e.target.value = "";
  };

  const setPrimary = (idx: number) =>
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === idx })));

  const removeImage = async (idx: number) => {
    const img = images[idx];
    if (img.dbId) {
      await supabase.from("product_images").delete().eq("id", img.dbId);
    }
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (img.is_primary && next.length > 0) next[0].is_primary = true;
      return next;
    });
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        slug: slugify(data.name),
        description: nullify(data.description) ,
        price: data.price,
        compare_price: data.compare_price && data.compare_price !== "" ? Number(data.compare_price) : null,
        // Guard against empty string being sent as UUID — must be null if unset
        category_id: data.category_id && data.category_id.length > 10 ? data.category_id : null,
        stock_quantity: data.stock_quantity,
        is_featured: data.is_featured,
        is_new_arrival: data.is_new_arrival,
        is_active: data.is_active,
        sku: nullify(data.sku),
        tags: null as null,
      };

      let productId: string;

      if (editing) {
        const { data: updated, error } = await supabase
          .from("products")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editing.id)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        productId = updated.id;
      } else {
        const { data: created, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        productId = created.id;
      }

      // Upload new images sequentially
      for (const img of images) {
        if (!img.file) {
          // Existing — just update is_primary if it changed
          if (img.dbId) {
            await supabase.from("product_images").update({ is_primary: img.is_primary }).eq("id", img.dbId);
          }
          continue;
        }
        const url = await uploadImage(img.file, productId);
        const { error } = await supabase.from("product_images").insert({
          product_id: productId,
          url,
          is_primary: img.is_primary,
          sort_order: 0,
          alt: null,
        });
        if (error) throw new Error("Failed to save image: " + error.message);
      }

      await qc.invalidateQueries({ queryKey: productKeys.admin() });
      await qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(editing ? "Product updated" : "Product created");
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{editing ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">

          {/* ── Images ── */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Photos</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group h-24 w-24 rounded-xl overflow-hidden border border-border shrink-0">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="96px" />

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        title="Set as primary"
                        className={`h-6 w-6 rounded-full flex items-center justify-center ${img.is_primary ? "bg-amber-400" : "bg-white/20 hover:bg-amber-400"}`}
                      >
                        <Star className={`h-3 w-3 ${img.is_primary ? "fill-white text-white" : "text-white"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="h-6 w-6 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                    {img.is_primary && (
                      <span className="text-[9px] text-white font-medium text-center bg-amber-400 rounded-full px-1.5 py-0.5 self-center">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary hover:bg-muted/40 transition-colors shrink-0"
              >
                {images.length === 0 ? (
                  <>
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Add Photos</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px]">More</span>
                  </>
                )}
              </button>
            </div>

            {images.length === 0 && (
              <p className="text-xs text-muted-foreground">Upload multiple images. First upload becomes the primary/cover photo.</p>
            )}
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground">Hover an image — ★ to set cover, ✕ to remove.</p>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
          </div>

          <Separator />

          {/* ── Basic Info ── */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Info</p>

            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input {...register("name")} placeholder="e.g. Classic White Sneakers" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Brief product description…"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* ── Pricing ── */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing & Inventory</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input {...register("price")} type="number" min="0" step="0.01" placeholder="999" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Compare Price (₹)</Label>
                <Input {...register("compare_price")} type="number" min="0" step="0.01" placeholder="1499 (optional)" />
              </div>
              <div className="space-y-2">
                <Label>Stock *</Label>
                <Input {...register("stock_quantity")} type="number" min="0" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input {...register("sku")} placeholder="SKU-001 (optional)" />
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Category & Flags ── */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category & Visibility</p>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                defaultValue={editing?.category_id ?? ""}
                onValueChange={(v) => setValue("category_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["is_active", "is_featured", "is_new_arrival"] as const).map((field) => {
                const labels: Record<string, string> = {
                  is_active: "Active",
                  is_featured: "Featured",
                  is_new_arrival: "New Arrival",
                };
                const descs: Record<string, string> = {
                  is_active: "Visible in store",
                  is_featured: "Show on homepage",
                  is_new_arrival: "Tag as new",
                };
                return (
                  <label
                    key={field}
                    className="relative flex flex-col gap-1 p-3 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{labels[field]}</span>
                      <input type="checkbox" {...register(field)} className="h-4 w-4 accent-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{descs[field]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? "Saving…" : editing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductWithImages | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithImages | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p: ProductWithImages) => { setEditing(p); setDialogOpen(true); };
  const onClose = () => { setDialogOpen(false); setEditing(null); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">{products.length} total products</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="border rounded-xl p-16 text-center text-muted-foreground">
          No products yet.{" "}
          <button onClick={openCreate} className="text-primary hover:underline">Add your first product.</button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Stock</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const img = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0];
                  const imgCount = product.product_images?.length ?? 0;
                  return (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-secondary shrink-0">
                            {img
                              ? <Image src={img.url} alt={product.name} fill className="object-cover" sizes="44px" />
                              : <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                            }
                            {imgCount > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 leading-4 rounded-tl">
                                {imgCount}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[160px]">{product.name}</p>
                            {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell text-sm">
                        {product.categories?.name ?? <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{formatPrice(product.price)}</p>
                        {product.compare_price && (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_price)}</p>
                        )}
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className={product.stock_quantity === 0 ? "text-destructive font-medium" : ""}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge variant={product.is_active ? "success" : "secondary"} className="text-xs">
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dialogOpen && (
        <ProductDialog
          open={dialogOpen}
          onClose={onClose}
          editing={editing}
          categories={categories}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently remove the product and all its images. This action cannot be undone."
        confirmLabel="Delete Product"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
