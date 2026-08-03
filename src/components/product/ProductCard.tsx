"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Product, Store } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/common/PriceTag";
import { Rating } from "@/components/common/Rating";
import { Distance } from "@/components/common/Distance";
import { ColorSwatches } from "@/components/common/ColorSwatches";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { HoverGallery } from "@/components/common/HoverGallery";
import { useLocale } from "@/lib/hooks/use-locale";
import { useLanguageStore } from "@/lib/stores/language-store";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils/cn";

/** Small handmade/fulfillment badge shown on creator products. */
function fulfillmentBadge(product: Product, locale: "en" | "ar") {
  if (product.fulfillment === "made-to-order")
    return { label: t.handmade.fMadeToOrder[locale], variant: "olive" as const };
  if (product.fulfillment === "customizable")
    return { label: t.handmade.fCustomizable[locale], variant: "olive" as const };
  if (product.tags?.includes("handmade"))
    return { label: t.handmade.handmadeBadge[locale], variant: "new" as const };
  return null;
}

interface ProductCardProps {
  product: Product;
  store: Store;
  distanceKm?: number;
  variant?: "grid" | "row" | "list";
  className?: string;
}

export function ProductCard({
  product,
  store,
  distanceKm,
  variant = "grid",
  className,
}: ProductCardProps) {
  const { name } = useLocale();
  const locale = useLanguageStore((s) => s.locale);
  const onSale = !!product.original_price;
  const madeBadge = fulfillmentBadge(product, locale);

  if (variant === "list") {
    return (
      <Link
        href={`/product/${product.id}`}
        className={cn(
          "group flex gap-3 rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover",
          className,
        )}
      >
        <div className="relative aspect-square h-28 w-28 flex-none overflow-hidden rounded-xl bg-cream">
          <HoverGallery
            images={product.images}
            alt={name(product)}
            sizes="112px"
            showDots={false}
          />
          {onSale && (
            <Badge variant="sale" className="absolute left-1.5 top-1.5 z-10">
              Sale
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-charcoal">
              {name(product)}
            </h3>
            <PriceTag
              price={product.price}
              originalPrice={product.original_price}
              size="sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-warmgray">
              <span className="truncate">{name(store)}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-warmgray">
              <Rating value={store.rating} reviewCount={store.review_count} size="xs" />
              {distanceKm !== undefined && <Distance km={distanceKm} />}
              {product.colors.length > 0 && (
                <ColorSwatches colors={product.colors} size="xs" max={4} />
              )}
            </div>
          </div>
        </div>

        <FavoriteButton productId={product.id} size="sm" className="self-start" />
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <HoverGallery
          images={product.images}
          alt={name(product)}
          sizes="(max-width: 640px) 50vw, 25vw"
        />

        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5">
          {onSale && <Badge variant="sale">Sale</Badge>}
          {madeBadge && <Badge variant={madeBadge.variant}>{madeBadge.label}</Badge>}
          {product.featured && !madeBadge && <Badge variant="gold">Featured</Badge>}
          {!product.in_stock && <Badge variant="muted">Out of stock</Badge>}
        </div>

        <FavoriteButton
          productId={product.id}
          size="sm"
          floating
          className="absolute right-2 top-2 z-10"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-charcoal">
          {name(product)}
        </h3>

        <PriceTag
          price={product.price}
          originalPrice={product.original_price}
          size="sm"
        />

        <div className="space-y-1 text-xs text-warmgray">
          <div className="truncate">{name(store)}</div>
          <div className="flex items-center gap-2">
            <Rating value={store.rating} size="xs" />
            {distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1">
                <span className="text-warmgray/40">·</span>
                <MapPin className="h-3 w-3" />
                {distanceKm < 1
                  ? `${Math.round(distanceKm * 1000)} m`
                  : `${distanceKm.toFixed(1)} km`}
              </span>
            )}
          </div>
        </div>

        {product.colors.length > 0 && (
          <ColorSwatches colors={product.colors} size="xs" max={5} className="mt-1" />
        )}
      </div>
    </Link>
  );
}
