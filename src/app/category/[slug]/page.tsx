"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles } from "lucide-react";
import {
  categoryBySlug,
  products,
  stores,
  cityById,
} from "@/lib/data";
import { searchProducts } from "@/lib/utils/search";
import {
  subcategoriesFor,
  productMatchesSubcategory,
} from "@/lib/data/subcategories";
import { useCityStore } from "@/lib/stores/city-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { cn } from "@/lib/utils/cn";
import { t } from "@/lib/i18n/translations";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const category = categoryBySlug(params.slug);
  const city = useCityStore((s) => s.city);
  const cityRecord = cityById(city)!;
  const { name } = useLocale();
  const locale = useLanguageStore((s) => s.locale);
  const [activeSub, setActiveSub] = useState<string>("all");

  if (!category) notFound();

  const baseResults = useMemo(
    () =>
      searchProducts({
        products,
        stores,
        filters: { city, category: category.id, sort: "newest" },
        userLocation: cityRecord.center,
      }),
    [city, category.id, cityRecord.center],
  );

  const subs = subcategoriesFor(category.id);
  const hasSubs = subs.length > 0;
  const isHandmade = category.id === "handmade-home";
  const featuredCreators = isHandmade
    ? baseResults.filter((r) => r.product.featured).slice(0, 8)
    : [];

  // Pre-compute counts per subcategory so the chips can show "(3)".
  const subCounts = useMemo(() => {
    const out: Record<string, number> = { all: baseResults.length };
    subs.forEach((sub) => {
      out[sub.id] = baseResults.filter((r) =>
        productMatchesSubcategory(r.product, sub),
      ).length;
    });
    return out;
  }, [baseResults, subs]);

  const filtered = useMemo(() => {
    if (!hasSubs || activeSub === "all") return baseResults;
    const sub = subs.find((s) => s.id === activeSub);
    if (!sub) return baseResults;
    return baseResults.filter((r) => productMatchesSubcategory(r.product, sub));
  }, [activeSub, baseResults, hasSubs, subs]);

  return (
    <div className="container-app space-y-4 py-4 sm:py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t.common.back[locale]}
      </Link>

      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive">
          {t.categoryPage.label[locale]}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal">
          {name(category)}
        </h1>
        <p className="text-sm text-warmgray">
          {filtered.length} {t.categoryPage.productsIn[locale]} {name(cityRecord)}
        </p>
      </header>

      {isHandmade && (
        <>
          <div className="rounded-2xl border border-olive-100 bg-olive-50/60 p-4 text-sm leading-relaxed text-charcoal/80">
            {t.handmade.intro[locale]}
          </div>

          {featuredCreators.length > 0 && (
            <section className="space-y-3">
              <div className="space-y-0.5">
                <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-charcoal">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-olive/10 text-olive">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  {t.handmade.featuredTitle[locale]}
                </h2>
                <p className="text-xs text-warmgray sm:text-sm">
                  {t.handmade.featuredSubtitle[locale]}
                </p>
              </div>
              <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                <ul className="flex gap-3">
                  {featuredCreators.map((r) => (
                    <li key={r.product.id} className="w-40 flex-none sm:w-44">
                      <ProductCard
                        product={r.product}
                        store={r.store}
                        distanceKm={r.distance_km}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      {hasSubs && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <SubChip
            label={t.categoryPage.subAll[locale]}
            count={subCounts.all}
            active={activeSub === "all"}
            onClick={() => setActiveSub("all")}
          />
          {subs.map((sub) => (
            <SubChip
              key={sub.id}
              label={locale === "ar" ? sub.name_ar : sub.name_en}
              count={subCounts[sub.id]}
              active={activeSub === sub.id}
              onClick={() => setActiveSub(sub.id)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-warmgray-200 bg-white p-10 text-center text-sm text-warmgray">
          {activeSub === "all"
            ? t.categoryPage.empty[locale]
            : t.categoryPage.subEmpty[locale]}
        </div>
      ) : (
        <ProductGrid items={filtered} />
      )}
    </div>
  );
}

function SubChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-none rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-charcoal text-ivory"
          : "bg-white text-charcoal hover:bg-cream",
      )}
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            "ml-1.5",
            active ? "opacity-70" : "text-warmgray",
          )}
        >
          · {count}
        </span>
      )}
    </button>
  );
}
