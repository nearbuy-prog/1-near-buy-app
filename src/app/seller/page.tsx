"use client";

import Link from "next/link";
import {
  Plus,
  Boxes,
  MessageSquare,
  CalendarClock,
  Store,
  BarChart3,
  Eye,
  TrendingUp,
} from "lucide-react";
import { useModeStore } from "@/lib/stores/mode-store";
import { useReservationsStore } from "@/lib/stores/reservations-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { storeById, productsByStore } from "@/lib/data";
import { ResponseTimeBadge } from "@/components/common/ResponseTimeBadge";

const QUICK_ACTIONS: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "olive" | "gold" | "default";
}> = [
  { href: "/seller/products/new", label: "Add Product", icon: Plus, tone: "olive" },
  { href: "/seller/products", label: "Manage Products", icon: Boxes, tone: "default" },
  { href: "/seller/messages", label: "Messages", icon: MessageSquare, tone: "default" },
  { href: "/seller/reservations", label: "Reservations", icon: CalendarClock, tone: "gold" },
  { href: "/seller/store", label: "Store Profile", icon: Store, tone: "default" },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3, tone: "default" },
];

export default function SellerDashboardPage() {
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const store = storeById(activeStoreId);

  const products = store ? productsByStore(store.id) : [];

  const allReservations = useReservationsStore((s) => s.items);
  const reservations = allReservations.filter(
    (r) => r.store_id === activeStoreId,
  );
  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  const conversations = useMessagesStore((s) => s.conversations);
  const newMessages = conversations
    .filter((c) => c.store_id === activeStoreId)
    .reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  // Fake "views today" — derived from product list length.
  const viewsToday = products.length * 28 + 47;

  if (!store) {
    return (
      <div className="container-app py-10 text-center text-sm text-warmgray">
        No active store. Please switch back to customer mode.
      </div>
    );
  }

  return (
    <div className="container-app space-y-6 py-4 sm:py-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-olive">
          Welcome back
        </p>
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-charcoal sm:text-3xl">
          {store.name_en}
        </h1>
        <ResponseTimeBadge store={store} size="sm" />
      </header>

      {/* Today's overview */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Products"
          value={products.length}
          icon={Boxes}
          accent="olive"
        />
        <StatTile
          label="New messages"
          value={newMessages}
          icon={MessageSquare}
          accent="gold"
          highlight={newMessages > 0}
        />
        <StatTile
          label="Pending reservations"
          value={pendingCount}
          icon={CalendarClock}
          accent="olive"
          highlight={pendingCount > 0}
        />
        <StatTile
          label="Views today"
          value={viewsToday}
          icon={Eye}
          accent="default"
        />
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon, tone }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  tone === "olive"
                    ? "bg-olive text-ivory"
                    : tone === "gold"
                    ? "bg-gold text-charcoal"
                    : "bg-cream text-charcoal"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-charcoal">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top product */}
      {products.length > 0 && (
        <section className="space-y-3 rounded-3xl bg-charcoal p-5 text-ivory">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold-300">
            <TrendingUp className="h-3.5 w-3.5" /> Top viewed today
          </div>
          <p className="font-display text-xl font-semibold">
            {products[0].name_en}
          </p>
          <p className="text-sm text-ivory/70">
            {Math.floor(viewsToday * 0.4)} views · {Math.floor(products.length * 1.4)}{" "}
            chats started · {pendingCount} reservations
          </p>
          <Link
            href="/seller/analytics"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:text-gold-200"
          >
            See full analytics →
          </Link>
        </section>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: "olive" | "gold" | "default";
  highlight?: boolean;
}) {
  return (
    <div
      className={`space-y-2 rounded-2xl p-4 shadow-card ${
        highlight ? "bg-gold-50 ring-1 ring-gold-200" : "bg-white"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          accent === "olive"
            ? "bg-olive/15 text-olive"
            : accent === "gold"
            ? "bg-gold-100 text-gold-700"
            : "bg-cream text-charcoal"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-2xl font-semibold text-charcoal">
        {value}
      </p>
      <p className="text-[11px] text-warmgray">{label}</p>
    </div>
  );
}
