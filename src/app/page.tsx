"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/product/ProductRail";
import { StoreCard } from "@/components/store/StoreCard";
import {
  cities,
  products,
  stores,
  trendingProducts,
  saleProducts,
  featuredProducts,
} from "@/lib/data";
import { useCityStore } from "@/lib/stores/city-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { distanceKm } from "@/lib/utils/distance";
import { nearbyStoresInCity } from "@/lib/utils/search";
import { t } from "@/lib/i18n/translations";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HomePage() {
  const city = useCityStore((s) => s.city);
  const cityRecord = cities.find((c) => c.id === city)!;
  const userOrigin = cityRecord.center;
  const locale = useLanguageStore((s) => s.locale);
  const { name } = useLocale();

  // Storefront helpers — always pass through the same product/store pipeline
  // so the Phase-2 Supabase swap is just an implementation change.
  const enrich = (
    list: typeof products,
  ): { product: (typeof products)[number]; store: (typeof stores)[number]; distance_km?: number }[] =>
    list
      .map((p) => {
        const store = stores.find((s) => s.id === p.store_id);
        if (!store) return null;
        return {
          product: p,
          store,
          distance_km: distanceKm(userOrigin, store.location),
        };
      })
      .filter(Boolean) as never;

  const inCity = (list: typeof products) =>
    list.filter((p) => {
      const store = stores.find((s) => s.id === p.store_id);
      return store?.city === city;
    });

  const trending = enrich(inCity(trendingProducts())).slice(0, 8);
  const sale = enrich(inCity(saleProducts())).slice(0, 8);
  const featured = enrich(inCity(featuredProducts())).slice(0, 8);
  const nearby = nearbyStoresInCity(stores, city, userOrigin, 6);

  return (
    <div className="container-app space-y-8 py-4 sm:space-y-10 sm:py-6">
      <HeroSection />

      {/* Categories */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
            {t.home.categories[locale]}
          </h2>
          <Link
            href="/search"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-charcoal/70 hover:text-olive sm:text-sm"
          >
            {t.common.seeAll[locale]} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <CategoryGrid />
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <ProductRail
          title={t.home.trending[locale]}
          subtitle={`${t.home.trendingSub[locale]} ${name(cityRecord)}`}
          items={trending}
          href="/search?sort=newest"
        />
      )}

      {/* On sale */}
      {sale.length > 0 && (
        <ProductRail
          title={t.home.onSale[locale]}
          subtitle={t.home.onSaleSub[locale]}
          items={sale}
          href="/search?sale=1"
        />
      )}

      {/* Nearby stores */}
      {nearby.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
              {t.home.nearbyStores[locale]}
            </h2>
            <Link
              href="/map"
              className="inline-flex items-center gap-0.5 text-xs font-medium text-charcoal/70 hover:text-olive sm:text-sm"
            >
              {t.home.mapView[locale]} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {nearby.map((s) => (
              <StoreCard key={s.id} store={s} distanceKm={s.distance_km} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <ProductRail
          title={t.home.forYou[locale]}
          subtitle={t.home.forYouSub[locale]}
          items={featured}
          href="/search"
        />
      )}

      <section className="rounded-3xl bg-charcoal px-6 py-8 text-ivory sm:px-10 sm:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
          Coming soon
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          For store owners
        </h3>
        <p className="mt-2 max-w-md text-sm text-ivory/70">
          Add your store, manage products, and reach customers across Oman.
          Store owner dashboard launches in our next release.
        </p>
      </section>
    </div>
  );
}
