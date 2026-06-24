"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/product/product-grid";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import type { ProductFilters } from "@/types/product";

export function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sortBy, setSortBy] = useState<ProductFilters["sortBy"]>(
    (searchParams.get("sort") as ProductFilters["sortBy"]) ?? "latest"
  );

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useProducts({
    search: search || undefined,
    category: category || undefined,
    sortBy,
  });

  const products = data?.products ?? [];

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sortBy && sortBy !== "latest") params.set("sort", sortBy);
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSortBy("latest");
    router.push("/products");
  };

  const hasFilters = search || category || (sortBy && sortBy !== "latest");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-muted-foreground">Discover our complete collection</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as ProductFilters["sortBy"])}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={applyFilters} className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Apply
        </Button>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {search && <Badge variant="secondary">Search: {search}</Badge>}
          {category && <Badge variant="secondary">Category: {category}</Badge>}
          {sortBy && sortBy !== "latest" && (
            <Badge variant="secondary">Sort: {sortBy}</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-destructive h-7"
          >
            Clear All
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${products.length} products`}
        </p>
      </div>

      <ProductGrid products={products} isLoading={isLoading} cols={4} />
    </div>
  );
}
