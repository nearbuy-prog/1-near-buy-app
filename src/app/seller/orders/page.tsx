"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PackageOpen, Check, ChevronRight } from "lucide-react";
import { useOrdersStore } from "@/lib/stores/orders-store";
import { useModeStore } from "@/lib/stores/mode-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { formatOMR } from "@/lib/utils/currency";
import { to, fulfillmentLabel } from "@/lib/i18n/orders-i18n";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { sellerAccept } from "@/lib/orders/order-service";
import { Button } from "@/components/ui/button";

export default function SellerOrdersPage() {
  const locale = useLanguageStore((s) => s.locale);
  const L = (o: { en: string; ar: string }) => o[locale];
  const storeId = useModeStore((s) => s.activeStoreId);
  const items = useOrdersStore((s) => s.items);
  const [tab, setTab] = useState<"new" | "all">("new");

  const orders = useMemo(
    () => items.filter((o) => o.store_id === storeId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [items, storeId],
  );
  const incoming = orders.filter((o) => o.status === "awaiting_confirmation");
  const list = tab === "new" ? incoming : orders;

  return (
    <div className="container-app space-y-4 py-4 sm:py-6 pb-24" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal">{L(to.seller.orders)}</h1>

      <div className="flex gap-1.5">
        {(["new", "all"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === k ? "bg-charcoal text-ivory" : "bg-white text-charcoal hover:bg-cream"}`}>
            {L(k === "new" ? to.seller.incoming : { en: "All", ar: "الكل" })}
            <span className="ms-1.5 text-xs opacity-70">{k === "new" ? incoming.length : orders.length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-warmgray-200 bg-white p-10 text-center">
          <PackageOpen className="mx-auto h-8 w-8 text-warmgray" />
          <p className="mt-2 text-sm text-warmgray">{L(to.seller.none)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const first = o.items[0];
            const name = locale === "ar" ? first.name_ar : first.name_en;
            return (
              <div key={o.id} className="rounded-2xl border border-warmgray-200/60 bg-white p-3">
                <Link href={`/seller/orders/${o.id}`} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-cream">
                    {first.image && <Image src={first.image} alt={name} fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-warmgray">{o.order_number}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-charcoal">{name} ×{first.quantity}</p>
                    <p className="text-xs text-warmgray">{o.customer_name} · {L(fulfillmentLabel[o.fulfillment])}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-semibold tabular-nums text-charcoal">{formatOMR(o.total)}</p>
                    <ChevronRight className="ms-auto mt-1 h-4 w-4 text-warmgray rtl:rotate-180" />
                  </div>
                </Link>
                {o.status === "awaiting_confirmation" && (
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-warmgray-200/60 pt-3">
                    <Button variant="primary" size="sm" onClick={() => sellerAccept(o.id)}>
                      <Check className="h-4 w-4" />{L(to.seller.accept)}
                    </Button>
                    <Link href={`/seller/orders/${o.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-terracotta">{L(to.seller.reject)}</Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
