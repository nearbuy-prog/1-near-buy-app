"use client";

import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StoreMap, type MapMarker } from "@/components/map/StoreMap";
import { stores, cityById } from "@/lib/data";
import { useCityStore } from "@/lib/stores/city-store";
import { distanceKm } from "@/lib/utils/distance";
import { useLocale } from "@/lib/hooks/use-locale";
import { Rating } from "@/components/common/Rating";
import { Distance } from "@/components/common/Distance";
import { cn } from "@/lib/utils/cn";

export default function MapPage() {
  const city = useCityStore((s) => s.city);
  const cityRecord = cityById(city)!;
  const { name } = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null);

  const markers: MapMarker[] = useMemo(
    () =>
      stores
        .filter((s) => s.city === city)
        .map((store) => ({
          store,
          distance_km: distanceKm(cityRecord.center, store.location),
        }))
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0)),
    [city, cityRecord.center],
  );

  return (
    <div className="container-app space-y-4 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <p className="text-xs text-warmgray">
          {markers.length} stores in {cityRecord.name_en}
        </p>
      </div>

      <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
        Stores near you
      </h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="h-[70vh] min-h-[480px] overflow-hidden rounded-3xl">
          <StoreMap
            markers={markers}
            city={city}
            activeId={activeId ?? undefined}
            onActiveChange={setActiveId}
          />
        </div>

        <aside className="hidden max-h-[70vh] min-h-[480px] flex-col gap-2 overflow-y-auto rounded-3xl bg-white p-3 shadow-card lg:flex">
          {markers.map((m) => (
            <button
              key={m.store.id}
              onClick={() => setActiveId(m.store.id)}
              className={cn(
                "flex flex-col gap-1 rounded-xl border p-3 text-left transition-all",
                activeId === m.store.id
                  ? "border-olive bg-olive-50"
                  : "border-warmgray-200/40 bg-white hover:bg-cream",
              )}
            >
              <span className="text-sm font-semibold text-charcoal">
                {name(m.store)}
              </span>
              <span className="line-clamp-1 text-xs text-warmgray">
                {m.store.address_en}
              </span>
              <div className="flex items-center gap-3 text-xs">
                <Rating
                  value={m.store.rating}
                  reviewCount={m.store.review_count}
                  size="xs"
                />
                <Distance km={m.distance_km} />
              </div>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}
