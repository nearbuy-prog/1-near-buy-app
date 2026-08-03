"use client";

import Link from "next/link";
import { Heart, MapPin, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CitySelector } from "@/components/layout/CitySelector";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useFavoritesStore } from "@/lib/stores/favorites-store";

export function TopBar() {
  const favCount = useFavoritesStore((s) => s.ids.length);

  return (
    <header className="sticky top-0 z-40 border-b border-warmgray-200/60 bg-ivory/85 backdrop-blur-md">
      <div className="container-app flex h-14 items-center justify-between gap-3 safe-top">
        <Link href="/" aria-label="Nearby home" className="flex items-center">
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-1">
          <CitySelector />
          <Link
            href="/search"
            aria-label="Search"
            className="hidden items-center justify-center rounded-full p-2.5 text-charcoal/70 transition-colors hover:bg-cream sm:inline-flex"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/map"
            aria-label="Map"
            className="hidden items-center justify-center rounded-full p-2.5 text-charcoal/70 transition-colors hover:bg-cream sm:inline-flex"
          >
            <MapPin className="h-5 w-5" />
          </Link>
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="relative inline-flex items-center justify-center rounded-full p-2.5 text-charcoal/70 transition-colors hover:bg-cream"
          >
            <Heart className="h-5 w-5" />
            {favCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-ivory">
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </Link>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
