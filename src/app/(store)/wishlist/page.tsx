"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlist, useToggleWishlist } from "@/hooks/use-wishlist";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const { data: items = [], isLoading } = useWishlist();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart } = useAddToCart();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to view wishlist</h1>
        <Button asChild className="mt-4">
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium text-muted-foreground mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-muted-foreground mb-6">Save items you love to your wishlist</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const primaryImage = item.products.product_images?.find((img) => img.is_primary) ?? item.products.product_images?.[0];
            return (
              <div key={item.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                  <Link href={`/products/${item.products.slug}`}>
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={item.products.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </Link>
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={() => toggleWishlist(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link href={`/products/${item.products.slug}`} className="text-sm font-medium hover:underline line-clamp-2">
                    {item.products.name}
                  </Link>
                  <p className="font-semibold text-sm">{formatPrice(item.products.price)}</p>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={item.products.stock_quantity === 0}
                    onClick={() => addToCart({ productId: item.product_id })}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.products.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
