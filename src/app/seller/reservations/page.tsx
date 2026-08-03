"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservationsStore } from "@/lib/stores/reservations-store";
import { useModeStore } from "@/lib/stores/mode-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { productById } from "@/lib/data";
import type { ReservationStatus } from "@/lib/types";
import { formatCountdown } from "@/lib/utils/relative-time";

const TABS: Array<{ id: ReservationStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "expired", label: "Expired" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold-50 text-gold-700",
  confirmed: "bg-olive/10 text-olive",
  cancelled: "bg-warmgray-100 text-warmgray-700",
  expired: "bg-terracotta/10 text-terracotta",
};

export default function SellerReservationsPage() {
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const allReservations = useReservationsStore((s) => s.items);
  const reservations = allReservations.filter(
    (r) => r.store_id === activeStoreId,
  );
  const setStatus = useReservationsStore((s) => s.setStatus);
  const openConvo = useMessagesStore((s) => s.openConversation);
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");

  const filtered = reservations.filter((r) =>
    tab === "all" ? true : r.status === tab,
  );

  return (
    <div className="container-app space-y-5 py-4 sm:py-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Reservations
        </h1>
        <p className="text-xs text-warmgray">
          Confirm or decline customer reservations. Each hold lasts 2 hours.
        </p>
      </header>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const count =
            t.id === "all"
              ? reservations.length
              : reservations.filter((r) => r.status === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-none rounded-full px-3.5 py-1.5 text-xs font-medium ${
                tab === t.id
                  ? "bg-charcoal text-ivory"
                  : "bg-white text-charcoal hover:bg-cream"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className="ml-1.5 opacity-70">· {count}</span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm text-warmgray">
            No reservations in this status.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => {
            const product = productById(r.product_id);
            if (!product) return null;
            return (
              <li
                key={r.id}
                className="space-y-3 rounded-2xl bg-white p-3 shadow-card"
              >
                <div className="flex gap-3">
                  <Link
                    href={`/product/${product.id}`}
                    className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-cream"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name_en}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-charcoal">
                        {product.name_en}
                      </p>
                      <span
                        className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-warmgray">
                      Reserved by{" "}
                      <span className="font-medium text-charcoal/80">
                        {r.customer_name}
                      </span>
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-charcoal/70">
                      {r.selected_size && (
                        <span className="rounded-full bg-cream px-2 py-0.5">
                          Size {r.selected_size}
                        </span>
                      )}
                      {r.selected_color && (
                        <span className="rounded-full bg-cream px-2 py-0.5">
                          {r.selected_color}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-charcoal/70">
                      <Clock className="h-3 w-3" />
                      {formatCountdown(r.expires_at)}
                    </p>
                    {r.customer_note && (
                      <p className="mt-2 rounded-xl bg-cream/60 px-3 py-2 text-xs italic text-charcoal/80">
                        “{r.customer_note}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    disabled={r.status !== "pending"}
                    onClick={() => setStatus(r.id, "confirmed")}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={r.status !== "pending"}
                    onClick={() => setStatus(r.id, "cancelled")}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const convo = openConvo({
                        store_id: r.store_id,
                        product_id: r.product_id,
                      });
                      router.push(`/messages/${convo.id}`);
                    }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Message
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
