"use client";

import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = [
  "from-rose-100 to-rose-200",
  "from-amber-100 to-amber-200",
  "from-emerald-100 to-emerald-200",
  "from-sky-100 to-sky-200",
  "from-violet-100 to-violet-200",
  "from-orange-100 to-orange-200",
];

export function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="py-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Shop by Category</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 shrink-0">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-2">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-1 w-8 bg-primary rounded-full" />
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Shop by Category</h2>
      </div>

      {/* Horizontal scroll strip — Myntra-style circles */}
      <div className="flex gap-5 md:gap-8 overflow-x-auto pb-3 scrollbar-hide justify-start md:justify-center">
        {categories.map((category, i) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group flex flex-col items-center gap-2.5 shrink-0"
          >
            <div
              className={cn(
                "relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all duration-200",
                !category.image_url && `bg-gradient-to-br ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`
              )}
            >
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="96px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary/60">
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs md:text-sm font-medium text-center leading-tight max-w-[80px] group-hover:text-primary transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
