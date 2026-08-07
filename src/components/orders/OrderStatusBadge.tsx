"use client";

import type { OrderStatus } from "@/lib/types";
import { useLanguageStore } from "@/lib/stores/language-store";
import { orderStatusLabel } from "@/lib/i18n/orders-i18n";

const TONE: Record<OrderStatus, string> = {
  pending_payment: "bg-gold/15 text-gold-700",
  order_placed: "bg-gold/15 text-gold-700",
  awaiting_confirmation: "bg-gold/15 text-gold-700",
  confirmed: "bg-olive/15 text-olive-700",
  preparing: "bg-olive/15 text-olive-700",
  ready_for_pickup: "bg-olive/15 text-olive-700",
  out_for_delivery: "bg-olive/15 text-olive-700",
  delivered: "bg-sage/15 text-sage",
  completed: "bg-sage/15 text-sage",
  rejected: "bg-terracotta/15 text-terracotta",
  cancelled: "bg-terracotta/15 text-terracotta",
  payment_failed: "bg-terracotta/15 text-terracotta",
  refunded: "bg-warmgray-100 text-warmgray-700",
};

export function OrderStatusBadge({ status, className = "" }: { status: OrderStatus; className?: string }) {
  const locale = useLanguageStore((s) => s.locale);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[status]} ${className}`}>
      {orderStatusLabel[status][locale]}
    </span>
  );
}
