"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import { useNewArrivals } from "@/hooks/use-products";

export function NewArrivals() {
  const { data: products = [], isLoading } = useNewArrivals();

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 bg-amber-400 rounded-full" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
              New Arrivals
              <Sparkles className="h-5 w-5 text-amber-400" />
            </h2>
            <p className="text-sm text-muted-foreground">Fresh additions this week</p>
          </div>
        </div>
        <Button variant="ghost" className="text-sm font-medium gap-1 hover:gap-2 transition-all" asChild>
          <Link href="/products?new=true">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </section>
  );
}
