"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import type { SearchFilters } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface FiltersProps {
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
  productCount: number;
}

const SORT_OPTIONS: { id: NonNullable<SearchFilters["sort"]>; label: string }[] = [
  { id: "relevance", label: "Most relevant" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Highest rated" },
  { id: "distance", label: "Closest first" },
];

const PRICE_RANGES: { id: string; label: string; min?: number; max?: number }[] = [
  { id: "any", label: "Any" },
  { id: "0-25", label: "Under 25", max: 25 },
  { id: "25-50", label: "25–50", min: 25, max: 50 },
  { id: "50-100", label: "50–100", min: 50, max: 100 },
  { id: "100-plus", label: "100+", min: 100 },
];

export function Filters({ value, onChange, productCount }: FiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SearchFilters>(value);

  const activeCount = useMemo(() => {
    let n = 0;
    if (value.category) n++;
    if (value.min_price !== undefined || value.max_price !== undefined) n++;
    if (value.on_sale) n++;
    if (value.in_stock_only) n++;
    if (value.min_rating) n++;
    return n;
  }, [value]);

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };
  const reset = () => {
    const cleared: SearchFilters = { city: value.city, query: value.query };
    setDraft(cleared);
    onChange(cleared);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(value);
      }}
    >
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-warmgray-200 bg-white px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-cream"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-semibold text-ivory">
            {activeCount}
          </span>
        )}
      </button>

      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-0 px-0 pb-6 pt-6 max-h-[88vh] overflow-y-auto"
      >
        <SheetHeader className="px-6">
          <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6 px-6">
          {/* Category */}
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
              Category
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDraft({ ...draft, category: undefined })}
                className={cn(
                  "chip",
                  !draft.category ? "chip-active" : "chip-default",
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDraft({ ...draft, category: c.id })}
                  className={cn(
                    "chip",
                    draft.category === c.id ? "chip-active" : "chip-default",
                  )}
                >
                  {c.name_en}
                </button>
              ))}
            </div>
          </section>

          {/* Price */}
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
              Price (OMR)
            </h4>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((r) => {
                const active =
                  (r.id === "any" &&
                    draft.min_price === undefined &&
                    draft.max_price === undefined) ||
                  (draft.min_price === r.min && draft.max_price === r.max);
                return (
                  <button
                    key={r.id}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        min_price: r.min,
                        max_price: r.max,
                      })
                    }
                    className={cn("chip", active ? "chip-active" : "chip-default")}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Toggles */}
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
              Availability
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setDraft({ ...draft, on_sale: !draft.on_sale })
                }
                className={cn(
                  "chip",
                  draft.on_sale ? "chip-active" : "chip-default",
                )}
              >
                On sale
              </button>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    in_stock_only: !draft.in_stock_only,
                  })
                }
                className={cn(
                  "chip",
                  draft.in_stock_only ? "chip-active" : "chip-default",
                )}
              >
                In stock only
              </button>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    min_rating: draft.min_rating === 4.5 ? undefined : 4.5,
                  })
                }
                className={cn(
                  "chip",
                  draft.min_rating ? "chip-active" : "chip-default",
                )}
              >
                4.5+ rating
              </button>
            </div>
          </section>

          {/* Sort */}
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
              Sort by
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setDraft({ ...draft, sort: s.id })}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-xs transition-all",
                    draft.sort === s.id
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-warmgray-200 bg-white text-charcoal hover:bg-cream",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-warmgray-200/60 bg-ivory px-6 py-4">
          <Button variant="outline" size="lg" onClick={reset} className="flex-1">
            Reset
          </Button>
          <SheetClose asChild>
            <Button size="lg" onClick={apply} className="flex-1">
              Show {productCount}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
