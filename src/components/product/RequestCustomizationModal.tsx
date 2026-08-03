"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, Store } from "@/lib/types";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { t } from "@/lib/i18n/translations";

interface Props {
  product: Product;
  store: Store;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Collects the details for a made-to-order / personalized request, then hands
 * off to the existing in-app chat with a pre-composed message. No separate
 * messaging system — this reuses the messages store + conversation route.
 */
export function RequestCustomizationModal({
  product,
  store,
  open,
  onOpenChange,
}: Props) {
  const locale = useLanguageStore((s) => s.locale);
  const { name } = useLocale();
  const openConvo = useMessagesStore((s) => s.openConversation);
  const send = useMessagesStore((s) => s.send);
  const router = useRouter();

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [text, setText] = useState("");
  const [qty, setQty] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const L = t.handmade;

  const handleSend = () => {
    const lines = [
      `${L.reqMsgIntro[locale]} ${name(product)}`,
      color && `• ${L.fColor[locale]}: ${color}`,
      size && `• ${L.fSize[locale]}: ${size}`,
      text && `• ${L.fText[locale]}: ${text}`,
      qty && `• ${L.fQty[locale]}: ${qty}`,
      date && `• ${L.fDate[locale]}: ${date}`,
      notes && `• ${L.fNotes[locale]}: ${notes}`,
    ].filter(Boolean);

    const convo = openConvo({ store_id: store.id, product_id: product.id });
    send({ conversation_id: convo.id, text: lines.join("\n"), role: "customer" });
    onOpenChange(false);
    router.push(`/messages/${convo.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-olive" />
            {L.requestTitle[locale]}
          </DialogTitle>
          <DialogDescription>{L.requestSubtitle[locale]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          <Field label={L.fColor[locale]} value={color} onChange={setColor} />
          <Field label={L.fSize[locale]} value={size} onChange={setSize} />
          <Field label={L.fText[locale]} value={text} onChange={setText} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label={L.fQty[locale]} value={qty} onChange={setQty} type="number" />
            <Field label={L.fDate[locale]} value={date} onChange={setDate} type="date" />
          </div>
          <Field label={L.fNotes[locale]} value={notes} onChange={setNotes} />
        </div>

        <DialogFooter>
          <Button variant="primary" size="lg" className="w-full" onClick={handleSend}>
            <Send className="h-4 w-4" />
            {L.sendRequest[locale]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-charcoal/70">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl"
      />
    </label>
  );
}
