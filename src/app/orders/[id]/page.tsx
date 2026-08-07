"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, MessageCircle, RotateCcw, XCircle, LifeBuoy } from "lucide-react";
import { useOrdersStore, CANCELLABLE_STATUSES } from "@/lib/stores/orders-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { storeById } from "@/lib/data";
import { formatOMR } from "@/lib/utils/currency";
import { mapHref } from "@/lib/utils/contact";
import { cancelByCustomer } from "@/lib/orders/order-service";
import { to, orderStatusLabel, paymentStatusLabel, paymentMethodLabel, fulfillmentLabel } from "@/lib/i18n/orders-i18n";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const L = (o: { en: string; ar: string }) => o[locale];
  const rtl = locale === "ar";
  const order = useOrdersStore((s) => s.items.find((o) => o.id === params.id && o.mine));
  const openConvo = useMessagesStore((s) => s.openConversation);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!order) {
    return (
      <div className="container-app py-16 text-center text-warmgray">
        <p>{L(to.orders.empty)}</p>
        <Link href="/orders" className="mt-3 inline-block text-sm font-medium text-olive">{L(to.orders.back)}</Link>
      </div>
    );
  }

  const store = storeById(order.store_id);
  const storeName = store ? (locale === "ar" ? store.name_ar : store.name_en) : order.store_id;
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  const contact = () => {
    const c = openConvo({ store_id: order.store_id, product_id: order.items[0]?.product_id });
    router.push(`/messages/${c.id}`);
  };

  return (
    <div className="container-app space-y-5 py-4 sm:py-6" dir={rtl ? "rtl" : "ltr"}>
      <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal">
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {L(to.orders.back)}
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-warmgray">{order.order_number}</p>
          <h1 className="font-display text-2xl font-semibold text-charcoal">{L(to.orders.details)}</h1>
        </div>
        <OrderStatusBadge status={order.status} className="mt-1" />
      </header>

      {order.reject_reason && (
        <p className="rounded-xl bg-terracotta/10 p-3 text-sm text-terracotta">{L(to.seller.rejectReason)}: {order.reject_reason}</p>
      )}

      {/* items */}
      <section className="space-y-2 rounded-2xl border border-warmgray-200/60 bg-white p-4">
        {order.items.map((it, i) => {
          const name = locale === "ar" ? it.name_ar : it.name_en;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-cream">
                {it.image && <Image src={it.image} alt={name} fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-charcoal">{name}</p>
                <p className="text-xs text-warmgray">
                  {[it.selected_size, it.selected_color].filter(Boolean).join(" · ")} {it.selected_size || it.selected_color ? "· " : ""}×{it.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{formatOMR(it.line_total)}</p>
            </div>
          );
        })}
        <div className="space-y-1 border-t border-warmgray-200/60 pt-3 text-sm">
          <Line k={L(to.checkout.subtotal)} v={formatOMR(order.subtotal)} />
          <Line k={L(to.checkout.deliveryFee)} v={formatOMR(order.delivery_fee)} />
          {order.discount > 0 && <Line k={L(to.checkout.discount)} v={`− ${formatOMR(order.discount)}`} />}
          {order.tax > 0 && <Line k={L(to.checkout.tax)} v={formatOMR(order.tax)} />}
          <Line k={L(to.checkout.total)} v={formatOMR(order.total)} strong />
        </div>
      </section>

      {/* fulfilment + payment */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-warmgray-200/60 bg-white p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{L(fulfillmentLabel[order.fulfillment])}</p>
          {order.fulfillment === "delivery" && order.address ? (
            <p className="mt-1.5 text-charcoal">
              {order.address.full_name}<br />
              <span className="text-warmgray">{order.address.street}, {order.address.area}, {order.address.governorate}</span>
              {order.address.landmark && <><br /><span className="text-xs text-warmgray">{order.address.landmark}</span></>}
            </p>
          ) : (
            <p className="mt-1.5 text-charcoal">
              {storeName}<br />
              <span className="text-warmgray">{store ? (locale === "ar" ? store.address_ar : store.address_en) : ""}</span>
              {store && (
                <a href={mapHref(store.location.lat, store.location.lng, store.name_en)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-olive">
                  <MapPin className="h-3.5 w-3.5" />{L(to.checkout.viewOnMap)}
                </a>
              )}
            </p>
          )}
          {order.estimated_ready_at && (
            <p className="mt-2 text-xs text-olive">{L(to.checkout.eta)}: {new Date(order.estimated_ready_at).toLocaleString(rtl ? "ar-OM" : "en-OM", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
          )}
        </div>
        <div className="rounded-2xl border border-warmgray-200/60 bg-white p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{L(to.checkout.payment)}</p>
          <p className="mt-1.5 text-charcoal">{L(paymentMethodLabel[order.payment_method])}</p>
          <p className="text-xs text-warmgray">{L(paymentStatusLabel[order.payment_status])}</p>
          {order.customer_note && <p className="mt-2 border-t border-warmgray-200/60 pt-2 text-xs text-warmgray">“{order.customer_note}”</p>}
        </div>
      </section>

      {/* timeline */}
      <section className="rounded-2xl border border-warmgray-200/60 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{L(to.orders.timeline)}</p>
        <ol className="mt-3 space-y-3">
          {order.history.map((e, i) => (
            <li key={i} className="flex gap-3">
              <div className="mt-1 h-2 w-2 flex-none rounded-full bg-olive" />
              <div>
                <p className="text-sm font-medium text-charcoal">{orderStatusLabel[e.status][locale]}</p>
                <p className="text-xs text-warmgray">{new Date(e.at).toLocaleString(rtl ? "ar-OM" : "en-OM", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                {e.note && <p className="text-xs text-warmgray">{e.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* actions */}
      <section className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="lg" onClick={contact}><MessageCircle className="h-4 w-4" />{L(to.orders.contactStore)}</Button>
        <Link href={`/product/${order.items[0]?.product_id}`}><Button variant="outline" size="lg" className="w-full"><RotateCcw className="h-4 w-4" />{L(to.orders.reorder)}</Button></Link>
        <Button variant="ghost" size="lg" onClick={contact}><LifeBuoy className="h-4 w-4" />{L(to.orders.assistance)}</Button>
        {canCancel && (
          confirmCancel ? (
            <Button variant="outline" size="lg" className="border-terracotta text-terracotta hover:bg-terracotta/10" onClick={() => { cancelByCustomer(order.id); setConfirmCancel(false); }}>
              <XCircle className="h-4 w-4" />{L(to.orders.cancelConfirm)}
            </Button>
          ) : (
            <Button variant="ghost" size="lg" className="text-terracotta" onClick={() => setConfirmCancel(true)}>
              <XCircle className="h-4 w-4" />{L(to.orders.cancel)}
            </Button>
          )
        )}
      </section>
    </div>
  );
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold text-charcoal" : "text-warmgray"}>{k}</span>
      <span className={`tabular-nums ${strong ? "font-semibold text-charcoal" : "text-charcoal"}`}>{v}</span>
    </div>
  );
}
