"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { to, notificationLabel } from "@/lib/i18n/orders-i18n";

export default function NotificationsPage() {
  const locale = useLanguageStore((s) => s.locale);
  const L = (o: { en: string; ar: string }) => o[locale];
  const items = useNotificationsStore((s) => s.items);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const mine = useMemo(() => items.filter((n) => n.audience === "customer"), [items]);

  // Mark read on view (a beat after mount so the unread badge is visible first).
  useEffect(() => {
    const t = setTimeout(() => markAllRead("customer"), 1200);
    return () => clearTimeout(t);
  }, [markAllRead]);

  return (
    <div className="container-app space-y-4 py-4 sm:py-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Link href="/profile" className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal">
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {L(to.orders.back)}
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal">{L(to.notif.title)}</h1>
        {mine.some((n) => !n.read) && (
          <button onClick={() => markAllRead("customer")} className="inline-flex items-center gap-1 text-xs font-medium text-olive">
            <CheckCheck className="h-3.5 w-3.5" />{L(to.notif.markAllRead)}
          </button>
        )}
      </div>

      {mine.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-warmgray-200 bg-white p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-warmgray" />
          <p className="mt-2 text-sm text-warmgray">{L(to.notif.empty)}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {mine.map((n) => (
            <li key={n.id}>
              <Link href={`/orders/${n.order_id}`}
                className={`flex items-start gap-3 rounded-2xl border p-3 transition-shadow hover:shadow-card ${n.read ? "border-warmgray-200/60 bg-white" : "border-olive/30 bg-olive/5"}`}>
                <span className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full ${n.read ? "bg-cream text-warmgray" : "bg-olive/15 text-olive"}`}>
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal">{L(notificationLabel[n.type])}</p>
                  <p className="text-xs text-warmgray">{L(to.notif.orderRef)} {n.order_number}</p>
                </div>
                <span className="text-[11px] text-warmgray">
                  {new Date(n.created_at).toLocaleDateString(locale === "ar" ? "ar-OM" : "en-OM", { day: "numeric", month: "short" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
