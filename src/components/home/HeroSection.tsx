"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { useCityStore } from "@/lib/stores/city-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { cityById } from "@/lib/data";
import { useLocale } from "@/lib/hooks/use-locale";
import { t } from "@/lib/i18n/translations";

export function HeroSection() {
  const city = useCityStore((s) => s.city);
  const { name } = useLocale();
  const locale = useLanguageStore((s) => s.locale);
  const cityRecord = cityById(city);

  const quickSearches: Array<{ q: string; en: string; ar: string }> = [
    { q: "oud", en: "oud", ar: "عود" },
    { q: "red dress", en: "red dress", ar: "فستان أحمر" },
    { q: "white thobe", en: "white thobe", ar: "ثوب أبيض" },
    { q: "bukhoor", en: "bukhoor", ar: "بخور" },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream via-ivory to-cream px-5 py-7 shadow-card sm:px-8 sm:py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-olive/10 blur-3xl" />

      <div className="relative space-y-4">
        <p className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-olive shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-olive" />
          {t.home.shoppingIn[locale]} {cityRecord ? name(cityRecord) : "Oman"}
        </p>

        <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-charcoal sm:text-4xl">
          {t.home.heroTitle1[locale]} <br />
          <span className="italic text-olive-700">{t.home.heroTitle2[locale]}</span>
        </h1>

        <p className="max-w-md text-sm text-warmgray sm:text-base">
          {t.home.heroSubtitle[locale]}
        </p>

        <div className="pt-2">
          <SearchBar size="lg" />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-warmgray">
          {quickSearches.map((s) => (
            <Link
              key={s.q}
              href={`/search?q=${encodeURIComponent(s.q)}`}
              className="rounded-full bg-white/70 px-3 py-1.5 hover:bg-white"
            >
              {locale === "ar" ? s.ar : s.en}
            </Link>
          ))}
          <Link
            href="/map"
            className="ml-auto inline-flex items-center gap-1 font-medium text-charcoal/70 hover:text-olive"
          >
            {t.home.mapView[locale]} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
