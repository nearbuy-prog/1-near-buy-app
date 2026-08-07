"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X, MessageCircle, Phone } from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { useOrdersStore } from "@/lib/stores/orders-store";
import { useModeStore } from "@/lib/stores/mode-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { formatOMR } from "@/lib/utils/currency";
import { telHref } from "@/lib/utils/contact";
import { sellerAccept, sellerReject, advanceStatus, nextStatuses } from "@/lib/orders/order-service";
import { to, orderStatusLabel, paymentStatusLabel, paymentMethodLabel, fulfillmentLabel, tpl } from "@/lib/i18n/orders-i18n";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";

const STATUS_ACTION: Partial<Record<OrderStatus, { en: string; ar: string }>> = {
  preparing: to.seller.markPreparing,
  ready_for_pickup: to.seller.markReady,
  out_for_delivery: to.seller.markOutForDelivery,
  delivered: to.seller.markDelivered,
  completed: to.seller.markCompleted,
};

export default function SellerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const L = (o: { en: string; ar: string }) => o[locale];
  const rtl = locale === "ar";
  const storeId = useModeStore((s) => s.activeStoreId);
  const order = useOrdersStore((s) => s.items.find((o) => o.id === params.id && o.store_id === storeId));
  const openConvo = useMessagesStore((s) => s.openConversation);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (!order) {
    return (
      <div className="container-app py-16 text-center text-warmgray">
        <p>{L(to.seller.none)}</p>
        <Link href="/seller/orders" className="mt-3 inline-block text-sm font-medium text-olive">{L(to.seller.orders)}</Link>
      </div>
    );
  }

  const isAwaiting = order.status === "awaiting_confirmation";
  const next = nextStatuses(order);
  const contact = () => {
    const c = openConvo({ store_id: order.store_id, product_id: order.items[0]?.product_id });
    router.push(`/messages/${c.id}`);
  };

  return (
    <div className="container-app space-y-5 py-4 sm:py-6 pb-28" dir={rtl ? "rtl" : "ltr"}>
      <Link href="/seller/orders" className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal">
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {L(to.seller.orders)}
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-warmgray">{order.order_number}</p>
          <p className="text-xs text-warmgray">{new Date(order.created_at).toLocaleString(rtl ? "ar-OM" : "en-OM", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <OrderStatusBadge status={order.status} className="mt-1" />
      </header>

      {order.needs_refund && <p className="rounded-xl bg-terracotta/10 p-3 text-sm text-terracotta">{L(to.seller.needsRefund)}</p>}

      {/* customer */}
      <section className="rounded-2xl border border-warmgray-200/60 bg-white p-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{L(to.seller.customer)}</p>
        <p className="mt-1.5 font-semibold text-charcoal">{order.customer_name}</p>
        <p className="text-warmgray">{order.customer_phone}{order.customer_email ? ` · ${order.customer_email}` : ""}</p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={contact}><MessageCircle className="h-4 w-4" />{L(to.seller.contactCustomer)}</Button>
          <a href={telHref(order.customer_phone)}><Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button></a>
        </div>
      </section>

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
                <p className="text-xs text-warmgray">{[it.selected_size, it.selected_color].filter(Boolean).join(" · ")} {it.selected_size || it.selected_color ? "· " : ""}×{it.quantity}</p>
                <p className="text-[11px] text-warmgray">{tpl(L(to.seller.stockReduced), { n: it.quantity })}</p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{formatOMR(it.line_total)}</p>
            </div>
          );
        })}
        <div className="space-y-1 border-t border-warmgray-200/60 pt-3 text-sm">
          <Line k={L(to.checkout.subtotal)} v={formatOMR(order.subtotal)} />
          <Line k={L(to.checkout.deliveryFee)} v={formatOMR(order.delivery_fee)} />
          <Line k={L(to.checkout.total)} v={formatOMR(order.total)} strong />
        </div>
        {order.customer_note && <p className="rounded-xl bg-cream p-2.5 text-xs text-charcoal">“{order.customer_note}”</p>}
      </section>

      {/* fulfilment + payment */}
      <section className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded-2xl border border-warmgray-200/60 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{L(fulfillmentLabel[order.fulfillment])}</p>
          {order.fulfillment === "delivery" && order.address ? (
            <p className="mt-1.5 text-charcoal">{order.address.street}, {order.address.area}, {order.address.governorate}
              {order.address.landmark && <span className="block text-xs text-warmgray">{order.address.landmark}</span>}
              {order.address.instructions && <span className="block text-xs text-warmgray">“{order.address.instructions}”</span>}
            </p>
          ) : (
            <p className="mt-1.5 text-warmgray">{L(to.checkout.storePickup)}</p>
          )}
        </div>
        <div className="rounded-2xl border border-warmgray-200/60 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{L(to.checkout.payment)}</p>
          <p className="mt-1.5 text-charcoal">{L(paymentMethodLabel[order.payment_method])}</p>
          <p className="text-xs text-warmgray">{L(paymentStatusLabel[order.payment_status])}</p>
        </div>
      </section>

      {order.reject_reason && <p className="rounded-xl bg-terracotta/10 p-3 text-sm text-terracotta">{L(to.seller.rejectReason)}: {order.reject_reason}</p>}

      {/* actions */}
      <section className="space-y-3">
        {isAwaiting && !rejecting && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" size="lg" onClick={() => sellerAccept(order.id)}><Check className="h-4 w-4" />{L(to.seller.accept)}</Button>
            <Button variant="outline" size="lg" className="border-terracotta text-terracotta hover:bg-terracotta/10" onClick={() => setRejecting(true)}><X className="h-4 w-4" />{L(to.seller.reject)}</Button>
          </div>
        )}
        {isAwaiting && rejecting && (
          <div className="space-y-2 rounded-2xl border border-terracotta/40 bg-terracotta/5 p-3">
            <label className="text-xs font-semibold text-terracotta">{L(to.seller.rejectReason)}</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder={L(to.seller.rejectPlaceholder)}
              className="w-full rounded-xl border border-warmgray-200 bg-white px-3 py-2 text-sm focus:border-terracotta focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setRejecting(false); setReason(""); }}>{L(to.common.cancel)}</Button>
              <Button variant="outline" size="sm" disabled={reason.trim().length < 3} className="border-terracotta text-terracotta hover:bg-terracotta/10"
                onClick={() => { sellerReject(order.id, reason.trim()); setRejecting(false); }}>{L(to.seller.confirmReject)}</Button>
            </div>
          </div>
        )}
        {!isAwaiting && next.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{L(to.seller.updateStatus)}</p>
            {next.map((st) => (
              <Button key={st} variant="primary" size="lg" className="w-full" onClick={() => advanceStatus(order.id, st)}>
                {L(STATUS_ACTION[st] ?? orderStatusLabel[st])}
              </Button>
            ))}
          </div>
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
