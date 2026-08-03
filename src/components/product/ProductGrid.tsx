import { ProductCard } from "./ProductCard";
import type { Product, Store } from "@/lib/types";

interface ProductGridProps {
  items: Array<{ product: Product; store: Store; distance_km?: number }>;
  variant?: "grid" | "list";
}

export function ProductGrid({ items, variant = "grid" }: ProductGridProps) {
  if (variant === "list") {
    return (
      <div className="grid gap-3">
        {items.map(({ product, store, distance_km }) => (
          <ProductCard
            key={product.id}
            product={product}
            store={store}
            distanceKm={distance_km}
            variant="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ product, store, distance_km }) => (
        <ProductCard
          key={product.id}
          product={product}
          store={store}
          distanceKm={distance_km}
        />
      ))}
    </div>
  );
}
