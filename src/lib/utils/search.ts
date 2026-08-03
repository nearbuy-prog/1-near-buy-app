/**
 * Pure search/filter logic. Lives in utils so it can be reused by the
 * client (Zustand) and later by Supabase RPCs / server components.
 */

import type {
  CityId,
  Product,
  SearchFilters,
  SearchResult,
  Store,
} from "@/lib/types";
import { distanceKm } from "./distance";

const STOPWORDS = new Set([
  "a",
  "the",
  "an",
  "for",
  "of",
  "in",
  "with",
  "and",
  "or",
  "to",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\w\s؀-ۿ]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

function productHaystack(product: Product, store: Store): string {
  return [
    product.name_en,
    product.name_ar,
    product.description_en,
    product.tags.join(" "),
    store.name_en,
    store.name_ar,
    product.colors.map((c) => c.name_en).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function relevanceScore(query: string, product: Product, store: Store): number {
  if (!query) return 0;
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;
  const hay = productHaystack(product, store);
  let score = 0;
  for (const t of tokens) {
    if (product.name_en.toLowerCase().includes(t)) score += 5;
    if (product.tags.some((tag) => tag.toLowerCase().includes(t))) score += 3;
    if (hay.includes(t)) score += 1;
  }
  return score;
}

export interface SearchInput {
  products: Product[];
  stores: Store[];
  filters: SearchFilters;
  /** User's location for distance-based sort & filter. Falls back to city center. */
  userLocation?: { lat: number; lng: number };
}

export function searchProducts({
  products,
  stores,
  filters,
  userLocation,
}: SearchInput): SearchResult[] {
  const storeById = new Map(stores.map((s) => [s.id, s]));

  const results: SearchResult[] = [];

  for (const product of products) {
    const store = storeById.get(product.store_id);
    if (!store) continue;

    // Online-only creators (home businesses) deliver across Oman, so they are
    // not tied to the shopper's selected city.
    if (filters.city && store.city !== filters.city && !store.online_only)
      continue;
    if (filters.category && product.category !== filters.category) continue;
    if (filters.in_stock_only && !product.in_stock) continue;
    if (filters.on_sale && !product.original_price) continue;
    if (filters.min_price !== undefined && product.price < filters.min_price) continue;
    if (filters.max_price !== undefined && product.price > filters.max_price) continue;
    if (filters.min_rating !== undefined && store.rating < filters.min_rating) continue;

    if (filters.colors && filters.colors.length > 0) {
      const hasColor = product.colors.some((c) =>
        filters.colors!.some(
          (q) => c.name_en.toLowerCase() === q.toLowerCase(),
        ),
      );
      if (!hasColor) continue;
    }

    if (filters.sizes && filters.sizes.length > 0) {
      const hasSize = product.sizes.some((s) =>
        filters.sizes!.includes(String(s)),
      );
      if (!hasSize) continue;
    }

    if (filters.query) {
      const score = relevanceScore(filters.query, product, store);
      if (score === 0) continue;
    }

    const distance =
      userLocation && store.location
        ? distanceKm(userLocation, store.location)
        : undefined;

    results.push({ product, store, distance_km: distance });
  }

  // Sort
  const sort = filters.sort ?? (filters.query ? "relevance" : "newest");
  results.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.product.price - b.product.price;
      case "price-desc":
        return b.product.price - a.product.price;
      case "rating":
        return b.store.rating - a.store.rating;
      case "distance":
        return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
      case "newest":
        return (
          new Date(b.product.created_at).getTime() -
          new Date(a.product.created_at).getTime()
        );
      case "relevance":
      default:
        return (
          relevanceScore(filters.query ?? "", b.product, b.store) -
          relevanceScore(filters.query ?? "", a.product, a.store)
        );
    }
  });

  return results;
}

export function nearbyStoresInCity(
  stores: Store[],
  city: CityId | undefined,
  userLocation?: { lat: number; lng: number },
  limit = 10,
): Array<Store & { distance_km?: number }> {
  return stores
    .filter((s) => !city || s.city === city)
    .map((s) => ({
      ...s,
      distance_km: userLocation ? distanceKm(userLocation, s.location) : undefined,
    }))
    .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
    .slice(0, limit);
}
