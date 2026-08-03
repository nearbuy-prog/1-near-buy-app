"use client";

import Link from "next/link";
import {
  Building2,
  Layers,
  MapPinned,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import { categories, cities, products, stores, reviews } from "@/lib/data";

const STAT_CARDS = [
  {
    title: "Stores",
    icon: Building2,
    href: "#stores",
    accent: "bg-olive/10 text-olive",
    getValue: () => stores.length,
  },
  {
    title: "Products",
    icon: ShoppingBag,
    href: "#products",
    accent: "bg-gold/15 text-gold-700",
    getValue: () => products.length,
  },
  {
    title: "Categories",
    icon: Layers,
    href: "#categories",
    accent: "bg-cream text-charcoal",
    getValue: () => categories.length,
  },
  {
    title: "Cities",
    icon: MapPinned,
    href: "#cities",
    accent: "bg-warmgray-100 text-warmgray-700",
    getValue: () => cities.length,
  },
] as const;

export default function AdminPage() {
  const onSale = products.filter((p) => p.original_price).length;
  const outOfStock = products.filter((p) => !p.in_stock).length;
  const verified = stores.filter((s) =>
    s.badges?.includes("verified"),
  ).length;
  const avgRating =
    stores.reduce((acc, s) => acc + s.rating, 0) / Math.max(1, stores.length);

  return (
    <div className="container-app space-y-6 py-4 sm:py-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive">
          Admin · v1
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal">
          Overview
        </h1>
        <p className="max-w-2xl text-sm text-warmgray">
          Read-only snapshot of stores, products, categories and cities. Wire
          this dashboard to Supabase in Phase 2 and add CRUD for stores,
          products, sales and featured flags.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_CARDS.map(({ title, icon: Icon, href, accent, getValue }) => (
          <a
            key={title}
            href={href}
            className="rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-charcoal">
              {getValue()}
            </p>
            <p className="text-xs text-warmgray">{title}</p>
          </a>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warmgray">
            <TrendingUp className="h-4 w-4" /> On sale
          </div>
          <p className="mt-2 text-2xl font-semibold">{onSale}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warmgray">
            <Building2 className="h-4 w-4" /> Verified stores
          </div>
          <p className="mt-2 text-2xl font-semibold">{verified}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warmgray">
            <Star className="h-4 w-4" /> Avg rating
          </div>
          <p className="mt-2 text-2xl font-semibold">{avgRating.toFixed(2)}</p>
        </div>
      </div>

      {/* Stores table */}
      <section id="stores" className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal">
            Stores
          </h2>
          <p className="text-xs text-warmgray">{stores.length} total</p>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-xs font-semibold uppercase tracking-wide text-warmgray">
              <tr>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Online</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmgray-200/40">
              {stores.map((s) => {
                const productCount = products.filter(
                  (p) => p.store_id === s.id,
                ).length;
                return (
                  <tr key={s.id} className="hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/store/${s.id}`}
                        className="font-medium hover:underline"
                      >
                        {s.name_en}
                      </Link>
                      <p className="text-xs text-warmgray">{s.name_ar}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{s.city}</td>
                    <td className="px-4 py-3">{productCount}</td>
                    <td className="px-4 py-3">
                      {s.rating.toFixed(1)}{" "}
                      <span className="text-warmgray">
                        ({s.review_count})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.accepts_online_orders ? (
                        <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[11px] font-medium text-sage">
                          yes
                        </span>
                      ) : (
                        <span className="rounded-full bg-warmgray-100 px-2 py-0.5 text-[11px] text-warmgray">
                          no
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Categories list */}
      <section id="categories" className="space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal">
          Categories
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-card"
              >
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    {c.name_en}
                  </p>
                  <p className="text-xs text-warmgray">{c.name_ar}</p>
                </div>
                <span className="text-xs text-warmgray">{count} products</span>
              </div>
            );
          })}
        </div>
      </section>

      <p className="rounded-2xl bg-cream p-4 text-xs text-warmgray">
        Reviews loaded: {reviews.length}. Out-of-stock products: {outOfStock}.
        Connect Supabase to make this data live and editable.
      </p>
    </div>
  );
}
