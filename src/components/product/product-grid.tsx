import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductWithImages } from "@/types/product";

interface ProductGridProps {
  products: ProductWithImages[];
  isLoading?: boolean;
  cols?: 2 | 3 | 4;
}

const colsClass = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function ProductGrid({ products, isLoading, cols = 4 }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={`grid ${colsClass[cols]} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-xl font-medium text-muted-foreground">No products found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colsClass[cols]} gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
