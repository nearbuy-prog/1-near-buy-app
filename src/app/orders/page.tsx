"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PackageOpen, ChevronRight } from "lucide-react";
import { useOrdersStore, ACTIVE_STATUSES } from "@/lib/stores/orders-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { formatOMR } from "@/lib/utils/currency";
import { to } from "@/lib/i18n/orders-i18n";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export default function MyOrdersPage() {
  const locale = useLanguageStore((s) => s.locale);
  const L = (o: { en: string; ar: string }) => o[locale];
  const items = useOrdersStore((s) => s.items);
  const [tab, setTab] = useState<"current" | "past">("current");

  const mine = useMemo(
    () => items.filter((o) => o.mine).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [items],
  );
  const current = mine.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const past = mine.filter((o) => !ACTIVE_STATUSES.includes(o.status));
  const list = tab === "current" ? current : past;

  return (
    <div className="container-app space-y-4 py-4 sm:py-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Link href="/profile" className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal">
        <ArrowLeft className="h-3.5 w-3.5" /> {L(to.orders.back)}
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal">{L(to.orders.my)}</h1>

      <div className="flex gap-1.5">
        {(["current", "past"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === k ? "bg-charcoal text-ivory" : "bg-white text-charcoal hover:bg-cream"}`}>
            {L(k === "current" ? to.orders.current : to.orders.past)}
            <span className="ms-1.5 text-xs opacity-70">{k === "current" ? current.length : past.length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-warmgray-200 bg-white p-10 text-center">
          <PackageOpen className="mx-auto h-8 w-8 text-warmgray" />
          <p className="mt-2 text-sm text-warmgray">{L(to.orders.empty)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const first = o.items[0];
            const name = locale === "ar" ? first.name_ar : first.name_en;
            return (
              <Link key={o.id} href={`/orders/${o.id}`}
                className="flex items-center gap-3 rounded-2xl border border-warmgray-200/60 bg-white p-3 transition-shadow hover:shadow-card">
                <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-cream">
                  {first.image && <Image src={first.image} alt={name} fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-warmgray">{o.order_number}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-charcoal">{name}</p>
                  <p className="text-xs text-warmgray">
                    {o.items.length > 1 ? `${o.items.length} ${L(to.orders.items)} · ` : ""}
                    {new Date(o.created_at).toLocaleDateString(locale === "ar" ? "ar-OM" : "en-OM", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-semibold tabular-nums text-charcoal">{formatOMR(o.total)}</p>
                  <ChevronRight className="ms-auto mt-1 h-4 w-4 text-warmgray rtl:rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
