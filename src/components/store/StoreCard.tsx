"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Store } from "@/lib/types";
import { Rating } from "@/components/common/Rating";
import { Distance } from "@/components/common/Distance";
import { Badge } from "@/components/ui/badge";
import { ResponseTimeBadge } from "@/components/common/ResponseTimeBadge";
import { useLocale } from "@/lib/hooks/use-locale";
import { cn } from "@/lib/utils/cn";

interface StoreCardProps {
  store: Store;
  distanceKm?: number;
  variant?: "compact" | "wide";
  className?: string;
}

export function StoreCard({
  store,
  distanceKm,
  variant = "compact",
  className,
}: StoreCardProps) {
  const { name, address } = useLocale();

  if (variant === "wide") {
    return (
      <Link
        href={`/store/${store.id}`}
        className={cn(
          "group flex gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover",
          className,
        )}
      >
        <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-cream">
          <Image
            src={store.cover}
            alt={name(store)}
            fill
            sizes="80px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-charcoal">
              {name(store)}
            </h3>
            {store.badges?.includes("verified") && (
              <span
                title="Verified"
                className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-olive text-[8px] font-bold text-ivory"
              >
                ✓
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-warmgray">
            {address(store)}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-warmgray">
            <Rating value={store.rating} reviewCount={store.review_count} size="xs" />
            <Distance km={distanceKm} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/store/${store.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-cream">
        <Image
          src={store.cover}
          alt={name(store)}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex gap-1">
          {store.badges?.includes("featured") && (
            <Badge variant="gold">Featured</Badge>
          )}
          {store.badges?.includes("verified") && (
            <Badge variant="verified">Verified</Badge>
          )}
          {store.badges?.includes("new") && <Badge variant="new">New</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-charcoal">
          {name(store)}
        </h3>
        <p className="line-clamp-1 text-xs text-warmgray">
          <MapPin className="mr-1 inline h-3 w-3" />
          {address(store)}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs">
          <Rating value={store.rating} reviewCount={store.review_count} size="xs" />
          {distanceKm !== undefined && <Distance km={distanceKm} />}
        </div>
        <ResponseTimeBadge store={store} size="xs" className="mt-1 self-start" />
      </div>
    </Link>
  );
}
