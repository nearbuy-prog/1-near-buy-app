"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { products, stores, cityById } from "@/lib/data";
import { distanceKm } from "@/lib/utils/distance";
import { useCityStore } from "@/lib/stores/city-store";

export default function FavoritesPage() {
  const ids = useFavoritesStore((s) => s.ids);
  const city = useCityStore((s) => s.city);
  const cityRecord = cityById(city)!;

  const items = ids
    .map((id) => {
      const product = products.find((p) => p.id === id);
      if (!product) return null;
      const store = stores.find((s) => s.id === product.store_id);
      if (!store) return null;
      return {
        product,
        store,
        distance_km: distanceKm(cityRecord.center, store.location),
      };
    })
    .filter(Boolean) as Array<{
    product: (typeof products)[number];
    store: (typeof stores)[number];
    distance_km: number;
  }>;

  return (
    <div className="container-app space-y-4 py-4 sm:py-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive">
          Your favorites
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal">
          Saved products
        </h1>
        <p className="text-sm text-warmgray">
          {items.length} item{items.length === 1 ? "" : "s"} you saved across stores
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-warmgray-200 bg-white p-10 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cream">
            <Heart className="h-6 w-6 text-warmgray" />
          </div>
          <h3 className="font-display text-lg font-semibold">No favorites yet</h3>
          <p className="mt-1 max-w-sm text-sm text-warmgray">
            Tap the heart on any product to save it here. Your favorites are
            stored on this device.
          </p>
          <Link href="/search" className="mt-4 inline-block">
            <Button size="lg" variant="primary">
              Browse products
            </Button>
          </Link>
        </div>
      ) : (
        <ProductGrid items={items} />
      )}
    </div>
  );
}
