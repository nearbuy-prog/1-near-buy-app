"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, ArrowRight, X } from "lucide-react";
import type { Product, Store, CityId } from "@/lib/types";
import {
  getCompleteTheLookRecommendations,
  getFallbackRecommendations,
  MATCH_REASON_META,
  type MatchReason,
  type Recommendation,
} from "@/lib/utils/complete-the-look";
import { PriceTag } from "@/components/common/PriceTag";
import { useLocale } from "@/lib/hooks/use-locale";
import { useLanguageStore } from "@/lib/stores/language-store";
import { distanceKm } from "@/lib/utils/distance";
import { cn } from "@/lib/utils/cn";
import { categoryById } from "@/lib/data";

interface CompleteTheLookProps {
  product: Product;
  allProducts: Product[];
  stores: Store[];
  city: CityId;
  cityCenter: { lat: number; lng: number };
}

const REASON_TONE: Record<MatchReason, string> = {
  color: "bg-rose-50 text-rose-700 ring-rose-100",
  style: "bg-olive-50 text-olive-700 ring-olive-100",
  occasion: "bg-gold-50 text-gold-700 ring-gold-100",
  best: "bg-cream text-charcoal/80 ring-warmgray-200",
};

export function CompleteTheLook({
  product,
  allProducts,
  stores,
  city,
  cityCenter,
}: CompleteTheLookProps) {
  const { name } = useLocale();
  const locale = useLanguageStore((s) => s.locale);
  const [expanded, setExpanded] = useState(false);

  const computeDistance = useMemo(
    () => (loc: { lat: number; lng: number }) => distanceKm(cityCenter, loc),
    [cityCenter],
  );

  // Try smart matching first. Fall back to "you may also like" if we couldn't
  // find at least 3 strong cross-category picks.
  const { items, isFallback } = useMemo(() => {
    const matches = getCompleteTheLookRecommendations({
      currentProduct: product,
      allProducts,
      stores,
      selectedCity: city,
      computeDistance,
      limit: 8,
    });
    if (matches.length >= 3) {
      return { items: matches, isFallback: false };
    }
    return {
      items: getFallbackRecommendations({
        currentProduct: product,
        allProducts,
        stores,
        selectedCity: city,
        computeDistance,
        limit: 8,
      }),
      isFallback: true,
    };
  }, [product, allProducts, stores, city, computeDistance]);

  if (items.length === 0) return null;

  const titleEn = isFallback ? "You may also like" : "Complete the Look";
  const titleAr = isFallback ? "قد يعجبك أيضاً" : "أكمل الإطلالة";
  const subtitleEn = isFallback
    ? "Picked from local stores in your city"
    : "AI-picked items that match this product";
  const subtitleAr = isFallback
    ? "مختارة من متاجر مدينتك"
    : "مختارة بالذكاء الاصطناعي لتناسب هذا المنتج";

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div className="space-y-0.5">
          <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
            {!isFallback && (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-olive/10 text-olive">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            )}
            {locale === "ar" ? titleAr : titleEn}
          </h2>
          <p className="text-xs text-warmgray sm:text-sm">
            {locale === "ar" ? subtitleAr : subtitleEn}
          </p>
        </div>
        {items.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex flex-none items-center gap-0.5 text-xs font-medium text-charcoal/70 hover:text-olive sm:text-sm"
          >
            {locale === "ar" ? "عرض الكل" : "View all"}
            <ChevronRight className={cn("h-4 w-4", locale === "ar" && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Horizontal scroller — same SHEIN-style feel as the product rails. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <ul className="flex gap-3 snap-x">
          {items.map((r) => (
            <li
              key={r.product.id}
              className="w-40 flex-none snap-start sm:w-44"
            >
              <RecommendationCard
                rec={r}
                nameFor={(p) => name(p)}
                storeNameFor={(s) => name(s)}
                showReason
              />
            </li>
          ))}
        </ul>
      </div>

      {expanded && (
        <ExpandedSheet
          recommendations={items}
          onClose={() => setExpanded(false)}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Recommendation card — small, reusable, follows existing product-card style.
// ---------------------------------------------------------------------------

function RecommendationCard({
  rec,
  nameFor,
  storeNameFor,
  showReason,
}: {
  rec: Recommendation;
  nameFor: (p: Product) => string;
  storeNameFor: (s: Store) => string;
  showReason: boolean;
}) {
  const locale = useLanguageStore((s) => s.locale);
  const reasonMeta = MATCH_REASON_META[rec.reason];
  return (
    <Link
      href={`/product/${rec.product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <Image
          src={rec.product.images[0]}
          alt={nameFor(rec.product)}
          fill
          sizes="(max-width: 640px) 45vw, 180px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showReason && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
              REASON_TONE[rec.reason],
            )}
          >
            {locale === "ar" ? reasonMeta.label_ar : reasonMeta.label_en}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-charcoal">
          {nameFor(rec.product)}
        </h3>
        <PriceTag
          price={rec.product.price}
          originalPrice={rec.product.original_price}
          size="sm"
        />
        <div className="mt-0.5 space-y-0.5 text-[11px] text-warmgray">
          <p className="truncate">{storeNameFor(rec.store)}</p>
          {rec.distance_km !== undefined && (
            <p>
              {rec.distance_km < 1
                ? `${Math.round(rec.distance_km * 1000)} m`
                : `${rec.distance_km.toFixed(1)} km`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// "View all" — grouped expanded sheet.
// ---------------------------------------------------------------------------

const GROUP_LABELS: Record<string, { en: string; ar: string }> = {
  shoes: { en: "Shoes", ar: "أحذية" },
  bags: { en: "Bags", ar: "حقائب" },
  accessories: { en: "Accessories", ar: "إكسسوارات" },
  perfumes: { en: "Perfumes", ar: "عطور" },
  beauty: { en: "Beauty", ar: "تجميل" },
  abayas: { en: "Abayas", ar: "عبايات" },
  "mukhawar-jalabiya": { en: "Mukhawar & Jalabiya", ar: "مخوّر وجلابية" },
  "womens-clothing": { en: "Women's Clothing", ar: "ملابس نسائية" },
  "mens-clothing": { en: "Men's Clothing", ar: "ملابس رجالية" },
  thobes: { en: "Thobes", ar: "ثياب" },
  "oud-bukhoor": { en: "Oud & Bukhoor", ar: "عود وبخور" },
  kids: { en: "Kids", ar: "أطفال" },
  home: { en: "Home", ar: "المنزل" },
  gifts: { en: "Gifts", ar: "هدايا" },
};

function ExpandedSheet({
  recommendations,
  onClose,
}: {
  recommendations: Recommendation[];
  onClose: () => void;
}) {
  const { name } = useLocale();
  const locale = useLanguageStore((s) => s.locale);

  // Group by category for the "Shoes / Bags / Perfumes" sections.
  const grouped = useMemo(() => {
    const map = new Map<string, Recommendation[]>();
    for (const r of recommendations) {
      const arr = map.get(r.product.category) ?? [];
      arr.push(r);
      map.set(r.product.category, arr);
    }
    return Array.from(map.entries());
  }, [recommendations]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-charcoal/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mt-auto max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-warmgray-200/60 bg-ivory/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-olive">
              {locale === "ar" ? "أكمل الإطلالة" : "Complete the Look"}
            </p>
            <h2 className="font-display text-xl font-semibold text-charcoal">
              {locale === "ar" ? "كل التوصيات" : "All recommendations"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-charcoal/70 hover:bg-warmgray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6 px-5 pt-5">
          {grouped.map(([categoryId, items]) => {
            const cat =
              GROUP_LABELS[categoryId] ?? {
                en: categoryById(categoryId)?.name_en ?? categoryId,
                ar: categoryById(categoryId)?.name_ar ?? categoryId,
              };
            return (
              <section key={categoryId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-charcoal">
                    {locale === "ar" ? cat.ar : cat.en}
                  </h3>
                  <Link
                    href={`/category/${categoryId}`}
                    className="ml-auto inline-flex items-center gap-0.5 text-xs font-medium text-charcoal/60 hover:text-olive"
                    onClick={onClose}
                  >
                    {locale === "ar" ? "كل المنتجات" : "See all"}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map((r) => (
                    <li key={r.product.id}>
                      <RecommendationCard
                        rec={r}
                        nameFor={(p) => name(p)}
                        storeNameFor={(s) => name(s)}
                        showReason
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
