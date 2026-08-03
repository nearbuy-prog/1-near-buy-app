import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product, Store } from "@/lib/types";

interface ProductRailProps {
  title: string;
  subtitle?: string;
  items: Array<{ product: Product; store: Store; distance_km?: number }>;
  href?: string;
  seeAllLabel?: string;
}

export function ProductRail({
  title,
  subtitle,
  items,
  href,
  seeAllLabel = "See all",
}: ProductRailProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-4 sm:px-0">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-warmgray sm:text-sm">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-charcoal/70 hover:text-olive sm:text-sm"
          >
            {seeAllLabel} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="-mx-4 sm:mx-0">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:px-0">
          {items.map(({ product, store, distance_km }) => (
            <div
              key={product.id}
              className="w-[160px] flex-none snap-start sm:w-[180px]"
            >
              <ProductCard
                product={product}
                store={store}
                distanceKm={distance_km}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
