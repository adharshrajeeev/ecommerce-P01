import { HeroBanner } from "@/features/home/components/hero-banner";
import { PromoStrip } from "@/features/home/components/promo-strip";
import { CategoriesSection } from "@/features/home/components/categories-section";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { NewArrivals } from "@/features/home/components/new-arrivals";

export default function HomePage() {
  return (
    <div className="pb-16">
      {/* Full-bleed hero carousel */}
      <HeroBanner />

      {/* Perks strip */}
      <PromoStrip />

      <div className="container mx-auto px-4 space-y-14 mt-12">
        {/* Category circles */}
        <CategoriesSection />

        {/* Featured products */}
        <FeaturedProducts />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Just In</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* New arrivals */}
        <NewArrivals />
      </div>
    </div>
  );
}
