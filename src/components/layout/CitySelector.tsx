"use client";

import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { cities } from "@/lib/data";
import { useCityStore } from "@/lib/stores/city-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { cn } from "@/lib/utils/cn";

export function CitySelector() {
  const { city, hasSelected, setCity } = useCityStore();
  const { name } = useLocale();
  const [open, setOpen] = useState(false);

  // Open the sheet automatically the very first time a user lands.
  useEffect(() => {
    if (!hasSelected) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [hasSelected]);

  const current = cities.find((c) => c.id === city) ?? cities[0];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-sm font-medium text-charcoal hover:bg-warmgray-100"
      >
        <MapPin className="h-4 w-4 text-olive" />
        <span>{name(current)}</span>
        <ChevronDown className="h-3.5 w-3.5 text-charcoal/60" />
      </button>

      <SheetContent side="bottom" className="rounded-t-3xl border-0 px-0 pb-8 pt-6">
        <SheetHeader className="px-6">
          <SheetTitle className="font-display text-2xl">
            Choose your city
          </SheetTitle>
          <SheetDescription>
            Results, stores, and the map will be filtered to this city.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-2 gap-3 px-6">
          {cities.map((c) => {
            const active = c.id === city;
            return (
              <SheetClose asChild key={c.id}>
                <button
                  onClick={() => setCity(c.id)}
                  className={cn(
                    "group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-olive bg-olive-50 shadow-soft"
                      : "border-warmgray-200/60 bg-white hover:border-olive/40 hover:bg-cream",
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-base font-semibold text-charcoal">
                      {name(c)}
                    </span>
                    {active && <Check className="h-4 w-4 text-olive" />}
                  </div>
                  <span className="text-xs text-warmgray">{c.name_ar}</span>
                </button>
              </SheetClose>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
