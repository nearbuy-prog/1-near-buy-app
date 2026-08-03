"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Upload,
  Sparkles,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { products, stores } from "@/lib/data";
import { useCityStore } from "@/lib/stores/city-store";
import { distanceKm } from "@/lib/utils/distance";
import { cityById } from "@/lib/data";

const EXAMPLES = [
  { label: "Find a similar dress", icon: Sparkles },
  { label: "Find matching shoes", icon: Sparkles },
  { label: "Search from a screenshot", icon: ImageIcon },
];

const FILTER_PILLS = ["All", "Abayas", "Dresses", "Shoes", "Bags", "Perfumes"];

export default function VisualSearchPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<typeof products>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const city = useCityStore((s) => s.city);
  const cityRecord = cityById(city)!;

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setAnalyzing(true);
    setResults([]);
    // Prototype only — pretend an ML model picked 8 visually similar items.
    setTimeout(() => {
      const pool = [...products]
        .sort(() => Math.random() - 0.5)
        .filter((p) => p.in_stock)
        .slice(0, 8);
      setResults(pool);
      setAnalyzing(false);
    }, 1400);
  };

  const enriched = results
    .map((p) => {
      const store = stores.find((s) => s.id === p.store_id);
      if (!store) return null;
      return {
        product: p,
        store,
        distance_km: distanceKm(cityRecord.center, store.location),
      };
    })
    .filter(Boolean) as Array<{
    product: (typeof products)[number];
    store: (typeof stores)[number];
    distance_km?: number;
  }>;

  return (
    <div className="container-app space-y-6 py-4 sm:py-6">
      <Link
        href="/search"
        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to search
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-olive/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-olive">
          <Sparkles className="h-3 w-3" /> AI Visual Search
        </span>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-charcoal">
          Search by image
        </h1>
        <p className="text-sm text-warmgray">
          Upload a photo or screenshot to find similar items in real stores
          near you.
        </p>
      </header>

      {!preview ? (
        <div className="space-y-4">
          <label
            htmlFor="visual-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-warmgray-200 bg-white py-12 text-center transition-colors hover:border-olive hover:bg-olive/5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-olive">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-charcoal">
                Drop an image here
              </p>
              <p className="text-xs text-warmgray">
                PNG, JPG, WEBP — up to 10 MB
              </p>
            </div>
          </label>
          <input
            id="visual-upload"
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
          </div>

          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
              Try this
            </h2>
            <ul className="space-y-2">
              {EXAMPLES.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-charcoal">{label}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-card">
            <div className="relative h-24 w-24 flex-none overflow-hidden rounded-xl bg-cream">
              <Image
                src={preview}
                alt="Your search image"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  Searching from your image
                </p>
                <p className="text-xs text-warmgray">
                  {analyzing
                    ? "Analyzing colors, patterns and style…"
                    : `Found ${enriched.length} visually similar items`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  setResults([]);
                }}
                className="self-start"
              >
                Try another image
              </Button>
            </div>
          </div>

          {analyzing && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-cream"
                />
              ))}
            </div>
          )}

          {!analyzing && enriched.length > 0 && (
            <>
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-warmgray" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
                    Filter
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_PILLS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        activeFilter === f
                          ? "border-charcoal bg-charcoal text-ivory"
                          : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal">
                  Similar items near you
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {enriched.map((r) => (
                    <ProductCard
                      key={r.product.id}
                      product={r.product}
                      store={r.store}
                      distanceKm={r.distance_km}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
