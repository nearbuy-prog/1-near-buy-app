"use client";

import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Separator } from "@/components/ui/separator";
import { Rating } from "@/components/common/Rating";
import { Distance } from "@/components/common/Distance";
import {
  storeById,
  productsByStore,
  reviewsForStore,
  cityById,
  categoryById,
} from "@/lib/data";
import { useCityStore } from "@/lib/stores/city-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { t } from "@/lib/i18n/translations";
import { distanceKm } from "@/lib/utils/distance";
import { useLocale } from "@/lib/hooks/use-locale";
import {
  telHref,
  whatsappStoreHref,
  mapHref,
} from "@/lib/utils/contact";

const DAY_LABELS: { key: keyof import("@/lib/types").Store["hours"]; label: string }[] = [
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
];

export default function StorePage() {
  const params = useParams<{ id: string }>();
  const store = storeById(params.id);
  const city = useCityStore((s) => s.city);
  const cityRecord = cityById(city)!;
  const { name, address, description, comment } = useLocale();
  const locale = useLanguageStore((s) => s.locale);

  if (!store) notFound();

  // Online / home-based creators don't receive visitors → hide map & directions.
  const showMap = store.accepts_visitors !== false;
  const deliveryArea =
    locale === "ar" ? store.delivery_area_ar : store.delivery_area_en;

  const items = productsByStore(store.id).map((p) => ({ product: p, store }));
  const reviews = reviewsForStore(store.id).slice(0, 6);
  const distance = useMemo(
    () => distanceKm(cityRecord.center, store.location),
    [cityRecord.center, store.location],
  );

  return (
    <div className="container-app space-y-6 py-4 sm:py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      {/* Hero */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-cream sm:aspect-[21/9]">
        <Image
          src={store.cover}
          alt={name(store)}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1080px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-3 p-4 sm:p-6">
          <div className="relative h-14 w-14 flex-none overflow-hidden rounded-2xl border-2 border-ivory bg-cream sm:h-16 sm:w-16">
            <Image
              src={store.logo}
              alt={name(store)}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 text-ivory">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-tight sm:text-3xl">
                {name(store)}
              </h1>
              {store.badges?.includes("verified") && (
                <CheckCircle2 className="h-4 w-4 text-gold" />
              )}
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-ivory/85 sm:text-sm">
              <MapPin className="mr-0.5 inline h-3 w-3" />
              {address(store)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-ivory/85">
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                {store.rating.toFixed(1)} ({store.review_count})
              </span>
              <Distance km={distance} className="text-ivory/85" />
            </div>
          </div>
        </div>
      </div>

      {/* Badges & quick info */}
      <div className="flex flex-wrap gap-2">
        {store.categories.map((c) => {
          const cat = categoryById(c);
          if (!cat) return null;
          return (
            <Link
              key={c}
              href={`/category/${cat.slug}`}
              className="chip chip-default"
            >
              {cat.name_en}
            </Link>
          );
        })}
        {store.online_only && (
          <span className="chip chip-default">{t.handmade.onlineOnly[locale]}</span>
        )}
        {store.home_based && (
          <span className="chip chip-default">{t.handmade.homeBusiness[locale]}</span>
        )}
        {store.local_creator && (
          <span className="chip chip-default">{t.handmade.localCreator[locale]}</span>
        )}
        {store.accepts_online_orders && (
          <span className="chip chip-default">Online orders</span>
        )}
        {deliveryArea ? (
          <span className="chip chip-default">
            <Truck className="h-3 w-3" /> {deliveryArea}
          </span>
        ) : (
          store.delivers && (
            <span className="chip chip-default">
              <Truck className="h-3 w-3" /> Delivery
            </span>
          )
        )}
        {store.pickup_available && (
          <span className="chip chip-default">{t.handmade.pickupAvailable[locale]}</span>
        )}
      </div>

      {/* Action bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a href={whatsappStoreHref(store)} target="_blank" rel="noreferrer">
          <Button variant="whatsapp" size="lg" className="w-full">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </a>
        <a href={telHref(store.phone)}>
          <Button variant="primary" size="lg" className="w-full">
            <Phone className="h-4 w-4" />
            Call
          </Button>
        </a>
        {showMap && (
          <a
            href={mapHref(store.location.lat, store.location.lng, store.name_en)}
            target="_blank"
            rel="noreferrer"
            className="col-span-2 sm:col-span-1"
          >
            <Button variant="outline" size="lg" className="w-full">
              <MapPin className="h-4 w-4" />
              View map
            </Button>
          </a>
        )}
        <Link href="/map" className="col-span-2 sm:col-span-1">
          <Button variant="ghost" size="lg" className="w-full">
            All stores
          </Button>
        </Link>
      </div>

      {/* About + Hours */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 shadow-card lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
            {description(store)}
          </p>
          <Separator className="my-4" />
          <div className="grid gap-2 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-warmgray" />
              <span>{address(store)}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-none text-warmgray" />
              <a href={telHref(store.phone)} className="hover:underline">
                {store.phone}
              </a>
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold">
            <Clock className="h-4 w-4 text-warmgray" /> Opening hours
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {DAY_LABELS.map(({ key, label }) => (
              <li
                key={key}
                className="flex items-center justify-between text-charcoal/80"
              >
                <span>{label}</span>
                <span className="text-warmgray">{store.hours[key]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Products */}
      {items.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
              Products
            </h2>
            <ProductGrid items={items} />
          </section>
        </>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
                Customer reviews
              </h2>
              <Rating
                value={store.rating}
                reviewCount={store.review_count}
                size="sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl bg-white p-4 shadow-card"
                >
                  <header className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-charcoal">
                      {r.author_name}
                    </h4>
                    <span className="inline-flex items-center gap-0.5 text-xs">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      {r.rating.toFixed(1)}
                    </span>
                  </header>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
                    {comment(r)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
