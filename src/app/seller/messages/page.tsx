"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ChevronRight } from "lucide-react";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useModeStore } from "@/lib/stores/mode-store";
import { productById } from "@/lib/data";
import { formatRelativeTime } from "@/lib/utils/relative-time";

const CUSTOMER_NAMES = [
  "Maryam A.",
  "Salma K.",
  "Khalid R.",
  "Ahmed M.",
  "Aisha B.",
  "Fatma S.",
  "Yousef A.",
];

function customerLabelFor(conversationId: string) {
  let h = 0;
  for (let i = 0; i < conversationId.length; i++)
    h = (h * 31 + conversationId.charCodeAt(i)) >>> 0;
  return CUSTOMER_NAMES[h % CUSTOMER_NAMES.length];
}

export default function SellerMessagesPage() {
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const conversations = useMessagesStore((s) => s.conversations);
  const messages = useMessagesStore((s) => s.messages);

  const rows = useMemo(() => {
    return [...conversations]
      .filter((c) => c.store_id === activeStoreId)
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
      .map((c) => {
        const product = c.product_id ? productById(c.product_id) : undefined;
        const lastMsg = [...messages]
          .filter((m) => m.conversation_id === c.id)
          .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
          .pop();
        const unreadCustomer = messages.filter(
          (m) =>
            m.conversation_id === c.id && m.role === "customer" && !m.read,
        ).length;
        return { c, product, lastMsg, unreadCustomer };
      });
  }, [conversations, messages, activeStoreId]);

  return (
    <div className="container-app space-y-4 py-4 sm:py-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Customer Messages
        </h1>
        <p className="text-xs text-warmgray">
          Reply quickly to keep your response-time badge green.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-olive">
            <MessageSquare className="h-5 w-5" />
          </div>
          <p className="text-sm text-warmgray">
            No conversations yet. Customers will appear here once they message
            your store.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map(({ c, product, lastMsg, unreadCustomer }) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex gap-3 rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-cream font-display text-lg font-semibold text-charcoal/70">
                  {customerLabelFor(c.id).charAt(0)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-semibold text-charcoal">
                      {customerLabelFor(c.id)}
                    </h3>
                    <span className="flex-none text-[11px] text-warmgray">
                      {lastMsg ? formatRelativeTime(lastMsg.created_at) : ""}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-xs text-warmgray">
                    {lastMsg?.text ?? "Open conversation"}
                  </p>
                  {product && (
                    <div className="mt-1 flex items-center gap-2 rounded-xl bg-cream/60 p-1.5">
                      <div className="relative h-7 w-7 flex-none overflow-hidden rounded-md bg-white">
                        <Image
                          src={product.images[0]}
                          alt={product.name_en}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <p className="line-clamp-1 text-[11px] text-charcoal/70">
                        Re: {product.name_en}
                      </p>
                      <ChevronRight className="ml-auto h-3 w-3 text-warmgray" />
                    </div>
                  )}
                  {unreadCustomer > 0 && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-semibold text-ivory">
                      {unreadCustomer} new
                    </span>
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
