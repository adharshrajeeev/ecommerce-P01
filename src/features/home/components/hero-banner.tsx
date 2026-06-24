"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
}

const FALLBACK_SLIDES = [
  {
    id: "1",
    title: "New Season Arrivals",
    subtitle: "Discover the latest trends in fashion",
    image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=700&fit=crop",
    link_url: "/products",
    cta: "Shop Now",
    bg: "from-stone-900/70",
  },
  {
    id: "2",
    title: "Up to 50% Off",
    subtitle: "On selected products — limited time offer",
    image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=700&fit=crop",
    link_url: "/products",
    cta: "Explore Deals",
    bg: "from-amber-900/60",
  },
  {
    id: "3",
    title: "Premium Collection",
    subtitle: "Handpicked quality products for every lifestyle",
    image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=700&fit=crop",
    link_url: "/products?featured=true",
    cta: "View Collection",
    bg: "from-slate-900/70",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data: dbBanners } = useQuery({
    queryKey: ["banners", "active"],
    queryFn: async () => {
      const { data } = await createClient()
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return (data ?? []) as Banner[];
    },
    staleTime: 5 * 60_000,
  });

  const slides = dbBanners && dbBanners.length > 0
    ? dbBanners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle ?? "",
        image_url: b.image_url,
        link_url: b.link_url ?? "/products",
        cta: "Shop Now",
        bg: "from-black/60",
      }))
    : FALLBACK_SLIDES;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, paused, slides.length]);

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(320px, 55vw, 620px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={s.image_url}
            alt={s.title}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className={cn("absolute inset-0 bg-gradient-to-r to-transparent", s.bg)} />
        </div>
      ))}

      {/* Text overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-lg">
            <p className="text-white/80 text-sm font-medium tracking-widest uppercase mb-3 animate-fade-in">
              ShopElite Collection
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-white/85 text-base md:text-lg mb-8 max-w-md">
                {slide.subtitle}
              </p>
            )}
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 font-semibold px-8"
              asChild
            >
              <Link href={slide.link_url ?? "/products"}>{slide.cta}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
