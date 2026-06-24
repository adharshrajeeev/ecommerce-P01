"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useToggleWishlist } from "@/hooks/use-wishlist";
import { useAddToCart } from "@/hooks/use-cart";
import type { ProductWithImages } from "@/types/product";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: ProductWithImages;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isWishlisted } = useWishlistStore();
  const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const images = product.product_images ?? [];
  const primaryImage = images.find((img) => img.is_primary) ?? images[0];
  const hoverImage = images.length > 1 ? images.find((img) => !img.is_primary) ?? images[1] : null;

  const isOutOfStock = product.stock_quantity === 0;
  const discount = product.compare_price
    ? getDiscountPercent(product.price, product.compare_price)
    : 0;
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/auth/login"); return; }
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/auth/login"); return; }
    if (!isOutOfStock) addToCart({ productId: product.id });
  };

  return (
    <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
      {/* Image container — portrait ratio like Myntra */}
      <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[3/4] mb-3">

        {/* Primary image */}
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}

        {/* Hover second image */}
        {hoverImage && (
          <Image
            src={hoverImage.url}
            alt={hoverImage.alt ?? product.name}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        )}

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 font-bold">
              {discount}% OFF
            </Badge>
          )}
          {product.is_new_arrival && !discount && (
            <Badge className="text-[10px] px-1.5 py-0.5 bg-emerald-600 text-white border-0">NEW</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">OUT OF STOCK</Badge>
          )}
        </div>

        {/* Wishlist button — always visible on mobile, hover on desktop */}
        <button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          className={cn(
            "absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white shadow flex items-center justify-center transition-all",
            "md:opacity-0 md:scale-90 md:group-hover:opacity-100 md:group-hover:scale-100"
          )}
        >
          <Heart
            className={cn("h-4 w-4 transition-colors", wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground")}
          />
        </button>

        {/* Add to cart — slides up on hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full bg-primary text-primary-foreground text-xs font-semibold py-3 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              ADD TO CART
            </button>
          </div>
        )}

        {/* Image count dots for multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.slice(0, 4).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300 bg-white/70",
                  i === 0 ? "w-4 group-hover:w-1" : "w-1 group-hover:first:w-1",
                  i === 1 && "group-hover:w-4"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-1 px-0.5">
        {product.categories && (
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {product.categories.name}
          </p>
        )}
        <h3 className="font-medium text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm md:text-base">{formatPrice(product.price)}</span>
          {product.compare_price && (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
              {discount > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">({discount}% off)</span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
