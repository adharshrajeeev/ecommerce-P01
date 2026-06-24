"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Heart, ShoppingCart, Truck, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ProductGrid } from "@/components/product/product-grid";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { user } = useAuthStore();
  const { isWishlisted } = useWishlistStore();
  const { data: product, isLoading, error } = useProduct(slug);
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();

  const relatedQuery = useRelatedProducts(
    product?.category_id ?? "",
    product?.id ?? ""
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl font-medium text-muted-foreground">Product not found</p>
        <Button className="mt-4" asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-square w-20 rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.product_images ?? [];
  const currentImage = images[selectedImage];
  const isOutOfStock = product.stock_quantity === 0;
  const discount = product.compare_price
    ? getDiscountPercent(product.price, product.compare_price)
    : 0;

  const handleAddToCart = () => {
    if (!user) { router.push("/auth/login"); return; }
    addToCart({ productId: product.id, quantity });
  };

  const handleWishlist = () => {
    if (!user) { router.push("/auth/login"); return; }
    toggleWishlist(product.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/products">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.alt ?? product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="absolute top-4 left-4">
                -{discount}%
              </Badge>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0 border-2 transition-colors",
                    selectedImage === idx ? "border-primary" : "border-transparent"
                  )}
                >
                  <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {product.categories && (
            <Badge variant="secondary">{product.categories.name}</Badge>
          )}

          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <>
                <span className="text-muted-foreground line-through">
                  {formatPrice(product.compare_price)}
                </span>
                <Badge variant="destructive">{discount}% off</Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              isOutOfStock ? "bg-destructive" : "bg-green-500"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isOutOfStock ? "text-destructive" : "text-green-600"
            )}>
              {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock_quantity} available)`}
            </span>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <Separator />

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </Button>
                <span className="w-10 text-center text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlist}
              disabled={isTogglingWishlist}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  isWishlisted(product.id) && "fill-red-500 text-red-500"
                )}
              />
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              Free delivery on orders over ₹999
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              30-day return policy
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedQuery.data && relatedQuery.data.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <ProductGrid products={relatedQuery.data} cols={4} />
        </div>
      )}
    </div>
  );
}
