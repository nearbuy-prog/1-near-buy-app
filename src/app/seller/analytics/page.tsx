"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, TrendingUp, Eye, MessageSquare, Bookmark } from "lucide-react";
import { useModeStore } from "@/lib/stores/mode-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useReservationsStore } from "@/lib/stores/reservations-store";
import { productsByStore, storeById, categories } from "@/lib/data";
import { formatOMR } from "@/lib/utils/currency";

/**
 * Deterministic pseudo-analytics so the prototype looks rich without a real
 * backend. Every number is derived from product/store ids so it stays stable
 * across reloads.
 */
function viewsFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 480) + 20;
}

const SEARCH_TERMS = [
  "evening abaya",
  "stone embroidery",
  "black dishdasha",
  "oud areen",
  "linen blouse",
  "white kumma",
  "khanjar",
  "pearl necklace",
];

export default function SellerAnalyticsPage() {
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const store = storeById(activeStoreId);
  const products = store ? productsByStore(store.id) : [];

  const conversations = useMessagesStore((s) => s.conversations);
  const totalMessages = conversations.filter(
    (c) => c.store_id === activeStoreId,
  ).length;
  const allReservations = useReservationsStore((s) => s.items);
  const totalReservations = allReservations.filter(
    (r) => r.store_id === activeStoreId,
  ).length;

  const sortedByViews = [...products].sort(
    (a, b) => viewsFor(b.id) - viewsFor(a.id),
  );
  const top = sortedByViews.slice(0, 5);
  const totalViews = sortedByViews.reduce((sum, p) => sum + viewsFor(p.id), 0);

  // Popular categories within this store's catalogue.
  const catCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const popularCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (!store) {
    return <p className="container-app py-10 text-sm">No active store.</p>;
  }

  return (
    <div className="container-app space-y-5 py-4 sm:py-6">
      <Link
        href="/seller"
        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Analytics
        </h1>
        <p className="text-xs text-warmgray">Last 30 days</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={Eye}
          label="Total product views"
          value={totalViews.toLocaleString()}
        />
        <Stat
          icon={MessageSquare}
          label="Total messages"
          value={String(totalMessages)}
        />
        <Stat
          icon={Bookmark}
          label="Total reservations"
          value={String(totalReservations)}
        />
        <Stat
          icon={TrendingUp}
          label="Avg basket value"
          value={formatOMR(
            (products.reduce((s, p) => s + p.price, 0) /
              Math.max(products.length, 1)) * 1.4,
          )}
        />
      </section>

      {/* Most viewed products */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
          Most viewed products
        </h2>
        <ul className="space-y-2">
          {top.map((p) => {
            const v = viewsFor(p.id);
            const pct = Math.min(100, (v / (viewsFor(top[0].id) || 1)) * 100);
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card"
              >
                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-xl bg-cream">
                  <Image
                    src={p.images[0]}
                    alt={p.name_en}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-charcoal">
                    {p.name_en}
                  </p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full bg-olive"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <p className="flex-none text-sm font-semibold text-charcoal">
                  {v}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Top search terms */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
          Most searched in your store
        </h2>
        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-white p-3 shadow-card">
          {SEARCH_TERMS.map((t) => (
            <span
              key={t}
              className="rounded-full bg-cream px-3 py-1.5 text-xs text-charcoal"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Popular categories */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
          Popular categories
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {popularCats.map(([id, count]) => {
            const cat = categories.find((c) => c.id === id);
            return (
              <div
                key={id}
                className="rounded-2xl bg-white p-3 shadow-card"
              >
                <p className="font-display text-2xl font-semibold text-charcoal">
                  {count}
                </p>
                <p className="text-xs text-warmgray">
                  {cat?.name_en ?? id}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1 rounded-2xl bg-white p-3 shadow-card">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-olive">
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-2xl font-semibold text-charcoal">
        {value}
      </p>
      <p className="text-[11px] text-warmgray">{label}</p>
    </div>
  );
}
