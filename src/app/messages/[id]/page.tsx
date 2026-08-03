"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImagePlus, Send } from "lucide-react";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { storeById, productById } from "@/lib/data";
import { ResponseTimeBadge } from "@/components/common/ResponseTimeBadge";
import { useModeStore } from "@/lib/stores/mode-store";
import { cn } from "@/lib/utils/cn";

const QUICK_REPLIES_CUSTOMER = [
  "Is this still available?",
  "Can I reserve this?",
  "Do you have another size?",
  "Where is your store located?",
];

const QUICK_REPLIES_STORE = [
  "Yes, available!",
  "We can reserve it for 2 hours.",
  "Currently sold out — back next week.",
  "We're open until 10pm.",
];

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const conversations = useMessagesStore((s) => s.conversations);
  const messages = useMessagesStore((s) => s.messages);
  const send = useMessagesStore((s) => s.send);
  const markRead = useMessagesStore((s) => s.markRead);
  const mode = useModeStore((s) => s.mode);

  const convo = conversations.find((c) => c.id === params.id);
  const store = convo ? storeById(convo.store_id) : undefined;
  const product = convo?.product_id ? productById(convo.product_id) : undefined;

  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = useMemo(() => {
    if (!convo) return [];
    return messages
      .filter((m) => m.conversation_id === convo.id)
      .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  }, [messages, convo]);

  useEffect(() => {
    if (convo) markRead(convo.id, mode === "seller" ? "store" : "customer");
  }, [convo, markRead, mode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [thread.length]);

  if (!convo || !store) {
    notFound();
  }

  const role = mode === "seller" ? "store" : "customer";
  const isCurrent = (r: string) => r === role;
  const quickReplies = role === "store" ? QUICK_REPLIES_STORE : QUICK_REPLIES_CUSTOMER;
  const backHref = mode === "seller" ? "/seller/messages" : "/messages";

  const onSend = (value?: string) => {
    const body = (value ?? text).trim();
    if (!body) return;
    send({ conversation_id: convo.id, text: body, role });
    setText("");
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <header className="sticky top-0 z-10 -mx-4 border-b border-warmgray-200/60 bg-ivory/95 px-4 py-3 backdrop-blur">
        <div className="container-app flex items-center gap-3 px-0">
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/70 hover:bg-cream"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="relative h-10 w-10 flex-none overflow-hidden rounded-full bg-cream">
            <Image
              src={store.logo}
              alt={store.name_en}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="line-clamp-1 text-sm font-semibold text-charcoal">
              {store.name_en}
            </h1>
            <ResponseTimeBadge store={store} size="xs" />
          </div>
        </div>
      </header>

      {product && (
        <Link
          href={`/product/${product.id}`}
          className="container-app mt-3 flex items-center gap-3 rounded-2xl border border-warmgray-200/60 bg-white p-2.5 shadow-soft"
        >
          <div className="relative h-12 w-12 flex-none overflow-hidden rounded-xl bg-cream">
            <Image
              src={product.images[0]}
              alt={product.name_en}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-xs font-semibold text-charcoal">
              {product.name_en}
            </p>
            <p className="text-[11px] text-warmgray">Tap to view product</p>
          </div>
          <p className="flex-none text-sm font-semibold text-olive">
            OMR {product.price.toFixed(3)}
          </p>
        </Link>
      )}

      <div
        ref={scrollRef}
        className="container-app flex-1 space-y-2 overflow-y-auto py-4"
      >
        {thread.map((m) => {
          const mine = isCurrent(m.role);
          return (
            <div
              key={m.id}
              className={cn(
                "flex max-w-[80%] flex-col gap-1",
                mine ? "ml-auto items-end" : "mr-auto items-start",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-soft",
                  mine
                    ? "rounded-br-md bg-olive text-ivory"
                    : "rounded-bl-md bg-white text-charcoal",
                )}
              >
                {m.text}
              </div>
              <span className="px-1 text-[10px] text-warmgray">
                {new Date(m.created_at).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="container-app sticky bottom-0 -mx-4 space-y-2 border-t border-warmgray-200/60 bg-ivory/95 px-4 py-3 backdrop-blur">
        <div className="-mx-2 flex gap-1.5 overflow-x-auto px-2 pb-1">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSend(q)}
              className="flex-none rounded-full border border-warmgray-200 bg-white px-3 py-1.5 text-xs text-charcoal hover:bg-cream"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex items-center gap-2 rounded-full border border-warmgray-200 bg-white px-3 py-1.5"
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 hover:bg-cream"
            aria-label="Add image"
            onClick={() => {
              // Prototype: pretend to attach an image.
              onSend("📎 (image attached)");
            }}
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm placeholder:text-warmgray focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-olive text-ivory transition-opacity disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
