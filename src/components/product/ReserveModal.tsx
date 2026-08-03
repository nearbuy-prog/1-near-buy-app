"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product, Store } from "@/lib/types";
import { useReservationsStore } from "@/lib/stores/reservations-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { t } from "@/lib/i18n/translations";
import { useRouter } from "next/navigation";

interface ReserveModalProps {
  product: Product;
  store: Store;
  selectedSize?: string;
  selectedColor?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReserveModal({
  product,
  store,
  selectedSize,
  selectedColor,
  open,
  onOpenChange,
}: ReserveModalProps) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const create = useReservationsStore((s) => s.create);
  const openConvo = useMessagesStore((s) => s.openConversation);
  const locale = useLanguageStore((s) => s.locale);
  const { name } = useLocale();
  const router = useRouter();

  const reset = () => {
    setNote("");
    setSubmitting(false);
    setSubmitted(false);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    create({
      product_id: product.id,
      store_id: store.id,
      selected_size: selectedSize,
      selected_color: selectedColor,
      customer_note: note || undefined,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const messageStore = () => {
    const convo = openConvo({
      store_id: store.id,
      product_id: product.id,
    });
    onOpenChange(false);
    setTimeout(reset, 250);
    router.push(`/messages/${convo.id}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 250);
      }}
    >
      <DialogContent className="max-w-md">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive/15 text-olive">
              <Check className="h-7 w-7" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-center font-display text-xl">
                {t.reserve.successTitle[locale]}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t.reserve.successDetail[locale]}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="!flex-col gap-2">
              <Link href="/profile" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  {t.reserve.viewMy[locale]}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={messageStore}
              >
                {t.reserve.messageStore[locale]}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                {t.common.done[locale]}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {t.reserve.title[locale]}
              </DialogTitle>
              <DialogDescription>
                {t.reserve.subtitle[locale]}
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 flex gap-3 rounded-2xl bg-cream p-3">
              <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-white">
                <Image
                  src={product.images[0]}
                  alt={name(product)}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="line-clamp-1 text-sm font-semibold text-charcoal">
                  {name(product)}
                </p>
                <p className="text-xs text-warmgray">{name(store)}</p>
                <div className="flex flex-wrap gap-1 pt-1 text-[11px] text-charcoal/70">
                  {selectedSize && (
                    <span className="rounded-full bg-white px-2 py-0.5">
                      {t.reserve.size[locale]} {selectedSize}
                    </span>
                  )}
                  {selectedColor && (
                    <span className="rounded-full bg-white px-2 py-0.5">
                      {selectedColor}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-olive-100 bg-olive-50 px-3 py-2 text-xs text-olive-700">
              <Clock className="mr-1.5 inline h-3.5 w-3.5" />
              <strong>{t.reserve.hold[locale]}</strong> · {t.reserve.holdDetail[locale]}
            </div>

            <div className="mt-4 space-y-2">
              <label className="block text-xs font-medium text-charcoal">
                {t.reserve.note[locale]}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder={t.reserve.notePlaceholder[locale]}
                className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm placeholder:text-warmgray focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
              />
              <p className="text-right text-[11px] text-warmgray">
                {note.length}/280
              </p>
            </div>

            <DialogFooter className="!flex-col gap-2 pt-1">
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full"
                onClick={handleConfirm}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.reserve.submitting[locale]}
                  </>
                ) : (
                  t.reserve.confirm[locale]
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                {t.reserve.cancel[locale]}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
