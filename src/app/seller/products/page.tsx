"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, EyeOff, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModeStore } from "@/lib/stores/mode-store";
import { productsByStore } from "@/lib/data";
import { formatOMR } from "@/lib/utils/currency";

export default function SellerProductsPage() {
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const products = productsByStore(activeStoreId);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  const filtered = products.filter((p) =>
    p.name_en.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="container-app space-y-5 py-4 sm:py-6">
      <header className="flex items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            Manage Products
          </h1>
          <p className="text-xs text-warmgray">
            {products.length} product{products.length === 1 ? "" : "s"} in your
            catalogue
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </Link>
      </header>

      <div className="flex items-center gap-2 rounded-full border border-warmgray-200 bg-white px-4 py-2">
        <Search className="h-4 w-4 text-charcoal/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your products"
          className="flex-1 bg-transparent text-sm placeholder:text-warmgray focus:outline-none"
        />
      </div>

      <ul className="space-y-2">
        {filtered.map((p) => {
          const isHidden = hidden[p.id];
          // Fake "views" derived from id length so each row gets a stable number.
          const views = (p.id.length * 13) % 480;
          return (
            <li
              key={p.id}
              className={`flex gap-3 rounded-2xl bg-white p-3 shadow-card ${isHidden ? "opacity-60" : ""}`}
            >
              <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-cream">
                <Image
                  src={p.images[0]}
                  alt={p.name_en}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                {p.original_price && (
                  <span className="absolute left-1 top-1 rounded-full bg-terracotta px-1.5 py-0.5 text-[9px] font-semibold uppercase text-ivory">
                    Sale
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm font-semibold text-charcoal">
                  {p.name_en}
                </p>
                <p className="text-sm font-semibold text-olive">
                  {formatOMR(p.price)}
                </p>
                <div className="flex flex-wrap gap-1 text-[11px] text-warmgray">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      p.in_stock
                        ? "bg-olive/10 text-olive"
                        : "bg-terracotta/10 text-terracotta"
                    }`}
                  >
                    {p.in_stock ? "In stock" : "Out of stock"}
                  </span>
                  <span className="rounded-full bg-cream px-2 py-0.5">
                    {views} views
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Link href={`/seller/products/${p.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </Link>
                  <button
                    onClick={() =>
                      setHidden((s) => ({ ...s, [p.id]: !s[p.id] }))
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-warmgray-100"
                  >
                    {isHidden ? (
                      <>
                        <Eye className="h-3 w-3" /> Show
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> Hide
                      </>
                    )}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm text-warmgray">No products match that search.</p>
        </div>
      )}
    </div>
  );
}
