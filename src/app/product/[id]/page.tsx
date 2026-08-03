"use client";

import { useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Clock, MapPin, Star, Truck } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { Badge } from "@/components/ui/badge";
import { ResponseTimeBadge } from "@/components/common/ResponseTimeBadge";
import { PriceTag } from "@/components/common/PriceTag";
import { Rating } from "@/components/common/Rating";
import { Distance } from "@/components/common/Distance";
import { Separator } from "@/components/ui/separator";
import { ProductRail } from "@/components/product/ProductRail";
import { CompleteTheLook } from "@/components/product/CompleteTheLook";
import {
  productById,
  products,
  productsByStore,
  stores,
  storeById,
  reviewsForProduct,
  reviewsForStore,
  cityById,
} from "@/lib/data";
import { distanceKm } from "@/lib/utils/distance";
import { useCityStore } from "@/lib/stores/city-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { t } from "@/lib/i18n/translations";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const product = productById(params.id);
  const store = product ? storeById(product.store_id) : undefined;
  const city = useCityStore((s) => s.city);
  const cityRecord = cityById(city)!;
  const { name, description, address, comment } = useLocale();
  const locale = useLanguageStore((s) => s.locale);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes[0] ? String(product.sizes[0]) : undefined,
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors[0]?.name_en,
  );

  const distance = useMemo(
    () =>
      store
        ? distanceKm(cityRecord.center, store.location)
        : undefined,
    [store, cityRecord.center],
  );

  // Gallery shows the selected colour's photos when the product has a
  // per-colour gallery; otherwise it falls back to the default images.
  const galleryImages = useMemo(() => {
    const perColor =
      selectedColor && product?.images_by_color?.[selectedColor];
    return perColor && perColor.length > 0 ? perColor : product?.images ?? [];
  }, [product, selectedColor]);

  if (!product || !store) notFound();

  const productReviews = reviewsForProduct(product.id);
  const storeReviews = reviewsForStore(store.id);
  const reviews = productReviews.length > 0 ? productReviews : storeReviews.slice(0, 3);

  const otherFromStore = productsByStore(store.id)
    .filter((p) => p.id !== product.id)
    .slice(0, 6)
    .map((p) => ({ product: p, store }));

  return (
    <div className="container-app space-y-6 py-4 sm:py-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t.common.backToSearch[locale]}
      </button>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery
          productId={product.id}
          images={galleryImages}
          alt={name(product)}
          badges={
            <>
              {product.original_price && <Badge variant="sale">Sale</Badge>}
              {product.featured && <Badge variant="gold">Featured</Badge>}
              {!product.in_stock && <Badge variant="muted">Out of stock</Badge>}
            </>
          }
        />

        <div className="space-y-6">
          <div className="space-y-3">
            <Link
              href={`/store/${store.id}`}
              className="inline-flex items-center gap-2 text-xs font-medium text-warmgray hover:text-charcoal"
            >
              <span className="relative h-6 w-6 overflow-hidden rounded-full bg-cream">
                <Image
                  src={store.logo}
                  alt={store.name_en}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </span>
              {name(store)} ·{" "}
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-gold text-gold" />
                {store.rating.toFixed(1)}
              </span>
            </Link>

            <ResponseTimeBadge store={store} size="sm" />

            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-charcoal sm:text-3xl">
              {name(product)}
            </h1>

            <PriceTag
              price={product.price}
              originalPrice={product.original_price}
              size="lg"
            />

            {product.fulfillment && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="olive">
                  {product.fulfillment === "ready"
                    ? t.handmade.fReady[locale]
                    : product.fulfillment === "made-to-order"
                      ? t.handmade.fMadeToOrder[locale]
                      : t.handmade.fCustomizable[locale]}
                </Badge>
                {(locale === "ar"
                  ? product.prep_time_ar
                  : product.prep_time_en) && (
                  <span className="inline-flex items-center gap-1 text-xs text-warmgray">
                    <Clock className="h-3.5 w-3.5" />
                    {t.handmade.prepTime[locale]}:{" "}
                    {locale === "ar"
                      ? product.prep_time_ar
                      : product.prep_time_en}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-warmgray">
              <span className="inline-flex items-center gap-1">
                {product.in_stock ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-sage" />
                    <span className="font-medium text-sage">{t.common.inStock[locale]}</span>
                  </>
                ) : (
                  <span className="font-medium text-terracotta">{t.common.outOfStock[locale]}</span>
                )}
              </span>
              {store.delivers && (
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  {t.common.deliversAvailable[locale]}
                </span>
              )}
              {!store.accepts_online_orders && (
                <span>{t.common.contactStore[locale]}</span>
              )}
            </div>
          </div>

          {product.sizes.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
                {t.product.sizes[locale]}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => {
                  const value = String(s);
                  const active = selectedSize === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedSize(value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                        active
                          ? "border-charcoal bg-charcoal text-ivory"
                          : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {product.colors.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
                {t.product.colors[locale]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const active = selectedColor === c.name_en;
                  return (
                    <button
                      key={c.name_en}
                      onClick={() => setSelectedColor(c.name_en)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                        active
                          ? "border-charcoal bg-charcoal text-ivory"
                          : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"
                      }`}
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-warmgray-200"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name_en}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Store address — explicitly requested as visible on the product page */}
          <Link
            href={`/store/${store.id}`}
            className="flex gap-3 rounded-2xl border border-warmgray-200/60 bg-white p-3 transition-shadow hover:shadow-card"
          >
            <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-cream">
              <Image
                src={store.cover}
                alt={store.name_en}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-charcoal">
                {name(store)}
              </p>
              <p className="line-clamp-1 text-xs text-warmgray">
                <MapPin className="mr-0.5 inline h-3 w-3" />
                {address(store)}
              </p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-warmgray">
                <Rating value={store.rating} reviewCount={store.review_count} size="xs" />
                <Distance km={distance} />
              </div>
            </div>
          </Link>

          <ProductActions
            product={product}
            store={store}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />

          {product.description_en && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
                {t.product.description[locale]}
              </h3>
              <p className="text-sm leading-relaxed text-charcoal/80">
                {description(product)}
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Complete the Look — AI-style cross-category recommendations */}
      <Separator />
      <CompleteTheLook
        product={product}
        allProducts={products}
        stores={stores}
        city={city}
        cityCenter={cityRecord.center}
      />

      {/* Reviews */}
      {reviews.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
                {t.product.reviews[locale]}
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
                  <p className="mt-2 text-[11px] text-warmgray">
                    {new Date(r.created_at).toLocaleDateString("en-OM", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* More from this store */}
      {otherFromStore.length > 0 && (
        <>
          <Separator />
          <ProductRail
            title={`${t.product.moreFrom[locale]} ${name(store)}`}
            items={otherFromStore}
            href={`/store/${store.id}`}
          />
        </>
      )}
    </div>
  );
}
