"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Map, List, SearchX } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { Filters } from "@/components/search/Filters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { StoreMap } from "@/components/map/StoreMap";
import { products, stores, cityById } from "@/lib/data";
import type { SearchFilters } from "@/lib/types";
import { searchProducts } from "@/lib/utils/search";
import { useCityStore } from "@/lib/stores/city-store";
import { cn } from "@/lib/utils/cn";

function SearchInner() {
  const params = useSearchParams();
  const city = useCityStore((s) => s.city);
  const cityRecord = cityById(city)!;

  const initialQuery = params.get("q") ?? "";
  const initialCategory = params.get("category") ?? undefined;
  const onSale = params.get("sale") === "1";

  const [filters, setFilters] = useState<SearchFilters>({
    city,
    query: initialQuery,
    category: initialCategory as SearchFilters["category"],
    on_sale: onSale,
    sort: initialQuery ? "relevance" : "newest",
  });

  const [view, setView] = useState<"list" | "map">("list");
  // Which store pin is currently selected on the map (shows its product card).
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const results = useMemo(
    () =>
      searchProducts({
        products,
        stores,
        filters: { ...filters, city },
        userLocation: cityRecord.center,
      }),
    [filters, city, cityRecord.center],
  );

  const markerData = results.map((r) => ({
    store: r.store,
    product: r.product,
    distance_km: r.distance_km,
  }));

  // Clear the selected pin whenever the search/filters change so a stale card
  // from a previous query doesn't linger.
  useEffect(() => {
    setActiveStoreId(null);
  }, [filters.query, filters.category, filters.on_sale, city]);

  return (
    <div className="container-app space-y-4 py-4 sm:py-6">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBar
            defaultValue={filters.query ?? ""}
            navigate={false}
            onSearch={(q) =>
              setFilters((f) => ({ ...f, query: q, sort: q ? "relevance" : f.sort }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm">
          {filters.query ? (
            <>
              <span className="font-semibold text-charcoal">
                {results.length}
              </span>{" "}
              <span className="text-warmgray">
                results for &ldquo;{filters.query}&rdquo;
              </span>
            </>
          ) : (
            <span className="text-warmgray">
              {results.length} products in {cityRecord.name_en}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filters
            value={filters}
            onChange={(f) => setFilters({ ...f, city })}
            productCount={results.length}
          />

          <div className="inline-flex items-center rounded-full bg-cream p-1 text-xs font-medium">
            <button
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5",
                view === "list" ? "bg-charcoal text-ivory" : "text-charcoal/70",
              )}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setView("map")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5",
                view === "map" ? "bg-charcoal text-ivory" : "text-charcoal/70",
              )}
            >
              <Map className="h-3.5 w-3.5" /> Map
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-warmgray-200 bg-white p-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cream">
            <SearchX className="h-5 w-5 text-warmgray" />
          </div>
          <h3 className="font-display text-lg font-semibold">No matches yet</h3>
          <p className="mt-1 max-w-sm text-sm text-warmgray">
            Try a different keyword, change your city, or remove a filter.
          </p>
        </div>
      ) : view === "list" ? (
        <ProductGrid items={results} />
      ) : (
        <div className="h-[70vh] min-h-[480px] overflow-hidden rounded-3xl">
          <StoreMap
            markers={markerData}
            city={city}
            activeId={activeStoreId ?? undefined}
            onActiveChange={setActiveStoreId}
          />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="container-app py-6 text-warmgray">Loading…</div>}
    >
      <SearchInner />
    </Suspense>
  );
}
