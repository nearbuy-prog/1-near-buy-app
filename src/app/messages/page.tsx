"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ChevronRight, ArrowLeft } from "lucide-react";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { storeById, productById } from "@/lib/data";
import { ResponseTimeBadge } from "@/components/common/ResponseTimeBadge";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import { t } from "@/lib/i18n/translations";

export default function MessagesListPage() {
  const conversations = useMessagesStore((s) => s.conversations);
  const messages = useMessagesStore((s) => s.messages);
  const locale = useLanguageStore((s) => s.locale);
  const { name } = useLocale();

  const rows = useMemo(() => {
    const sorted = [...conversations].sort(
      (a, b) => +new Date(b.updated_at) - +new Date(a.updated_at),
    );
    return sorted
      .map((c) => {
        const store = storeById(c.store_id);
        if (!store) return null;
        const product = c.product_id ? productById(c.product_id) : undefined;
        const lastMsg = [...messages]
          .filter((m) => m.conversation_id === c.id)
          .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
          .pop();
        return { c, store, product, lastMsg };
      })
      .filter(Boolean) as Array<{
      c: (typeof conversations)[number];
      store: NonNullable<ReturnType<typeof storeById>>;
      product?: ReturnType<typeof productById>;
      lastMsg?: (typeof messages)[number];
    }>;
  }, [conversations, messages]);

  return (
    <div className="container-app space-y-4 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.nav.profile[locale]}
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          {t.messages.title[locale]}
        </h1>
        <p className="text-sm text-warmgray">
          {t.messages.subtitle[locale]}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-olive">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-semibold text-charcoal">
            {t.messages.empty[locale]}
          </h2>
          <p className="max-w-xs text-sm text-warmgray">
            {t.messages.emptyDetail[locale]}
          </p>
          <Link
            href="/search"
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-charcoal px-5 py-2.5 text-sm font-medium text-ivory"
          >
            {t.messages.browse[locale]}
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map(({ c, store, product, lastMsg }) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex gap-3 rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-2xl bg-cream">
                  <Image
                    src={store.logo}
                    alt={name(store)}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-semibold text-charcoal">
                      {name(store)}
                    </h3>
                    <span className="flex-none text-[11px] text-warmgray">
                      {lastMsg
                        ? formatRelativeTime(lastMsg.created_at)
                        : formatRelativeTime(c.updated_at)}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-xs text-warmgray">
                    {lastMsg
                      ? `${lastMsg.role === "store" ? "" : t.messages.you[locale]}${lastMsg.text}`
                      : t.messages.startConvo[locale]}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <ResponseTimeBadge store={store} size="xs" />
                    {(c.unread_count ?? 0) > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-semibold text-ivory">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                  {product && (
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-cream/60 p-1.5">
                      <div className="relative h-8 w-8 flex-none overflow-hidden rounded-lg bg-white">
                        <Image
                          src={product.images[0]}
                          alt={product.name_en}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <p className="line-clamp-1 text-[11px] text-charcoal/80">
                        {product.name_en}
                      </p>
                      <ChevronRight className="ml-auto h-3 w-3 text-warmgray" />
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
