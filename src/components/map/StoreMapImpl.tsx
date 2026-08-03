"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CityId, Product, Store } from "@/lib/types";
import { cityById } from "@/lib/data";
import { formatOMR } from "@/lib/utils/currency";
import { formatDistance } from "@/lib/utils/distance";

export interface MapMarker {
  store: Store;
  /** Optional product to feature in the popup card. */
  product?: Product;
  distance_km?: number;
}

interface StoreMapProps {
  markers: MapMarker[];
  city?: CityId;
  className?: string;
  /** Initial center override; defaults to the city center. */
  center?: { lat: number; lng: number };
  /** Active store id, will pop its marker open. */
  activeId?: string;
  onActiveChange?: (id: string | null) => void;
}

/**
 * Store map powered by Leaflet + OpenStreetMap. No API token required.
 * Tiles come from the public Carto Voyager basemap (or fall back to plain
 * OSM tiles), which gives a clean, light, NearBuy-tinted look without
 * needing a Mapbox account.
 */
export function StoreMap({
  markers,
  city,
  className,
  center,
  activeId,
  onActiveChange,
}: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerObjectsRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const cityRecord = cityById(city);
  const initialCenter =
    center ?? cityRecord?.center ?? { lat: 23.588, lng: 58.3829 };
  const initialZoom = cityRecord?.zoom ?? 11;

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true,
    });

    // CARTO Voyager — clean, light basemap, free for non-commercial use.
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    mapRef.current = map;
    // Defer one tick so React commits the container size before Leaflet measures.
    setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 50);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center when city changes.
  useEffect(() => {
    if (!mapRef.current || !cityRecord) return;
    mapRef.current.flyTo(
      [cityRecord.center.lat, cityRecord.center.lng],
      cityRecord.zoom,
      { duration: 0.8 },
    );
  }, [cityRecord]);

  // Render markers.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Drop markers we no longer need.
    markerObjectsRef.current.forEach((marker, id) => {
      if (!markers.find((m) => m.store.id === id)) {
        marker.remove();
        markerObjectsRef.current.delete(id);
      }
    });

    markers.forEach((m) => {
      const id = m.store.id;
      const existing = markerObjectsRef.current.get(id);
      if (existing) {
        existing.setLatLng([m.store.location.lat, m.store.location.lng]);
        return;
      }

      const icon = L.divIcon({
        className: "nearbuy-marker", // unstyled wrapper; html is the visual
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        html: `<button type="button" aria-label="${escapeHtml(m.store.name_en)}"
                 class="group flex h-9 w-9 -mb-9 items-center justify-center rounded-full bg-charcoal text-ivory shadow-lg transition-transform hover:scale-110 focus:outline-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s-8-7.5-8-13a8 8 0 0 1 16 0c0 5.5-8 13-8 13z"/>
                    <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
                  </svg>
                </button>`,
      });

      const marker = L.marker([m.store.location.lat, m.store.location.lng], {
        icon,
      }).addTo(map);

      marker.on("click", () => {
        onActiveChange?.(id);
      });

      markerObjectsRef.current.set(id, marker);
    });
  }, [markers, mapReady, onActiveChange]);

  // Pan to active store.
  useEffect(() => {
    if (!mapRef.current || !activeId) return;
    const target = markers.find((m) => m.store.id === activeId);
    if (!target) return;
    mapRef.current.flyTo(
      [target.store.location.lat, target.store.location.lng],
      Math.max(14, mapRef.current.getZoom()),
      { duration: 0.6 },
    );
  }, [activeId, markers]);

  const activeMarker = markers.find((m) => m.store.id === activeId);
  const card = activeMarker;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl",
        className,
      )}
    >
      <div ref={containerRef} className="h-full w-full" />

      {card && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] sm:left-auto sm:right-3 sm:max-w-xs">
          <Link
            href={
              card.product
                ? `/product/${card.product.id}`
                : `/store/${card.store.id}`
            }
            className="group flex gap-3 overflow-hidden rounded-2xl bg-white/95 p-3 shadow-card-hover backdrop-blur-md transition-shadow hover:shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-cream">
              <Image
                src={card.product?.images[0] ?? card.store.cover}
                alt={card.store.name_en}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="line-clamp-1 text-sm font-semibold text-charcoal">
                {card.product?.name_en ?? card.store.name_en}
              </p>
              <p className="line-clamp-1 text-xs text-warmgray">
                {card.store.name_en}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-warmgray">
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  {card.store.rating.toFixed(1)}
                </span>
                {card.distance_km !== undefined && (
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {formatDistance(card.distance_km)}
                  </span>
                )}
                {card.product && (
                  <span className="font-semibold text-charcoal">
                    {formatOMR(card.product.price)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
