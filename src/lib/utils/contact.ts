/**
 * Helpers for the contact actions: tel: links and WhatsApp deep links.
 *
 * WhatsApp expects an E.164 number with no `+` and a URL-encoded prefilled
 * message. We use wa.me which works on both web and native clients.
 */

import type { Product, Store } from "@/lib/types";
import { formatOMR } from "./currency";

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function whatsappStoreHref(store: Store, productName?: string): string {
  const number = digitsOnly(store.whatsapp || store.phone);
  const lines = [
    `Hello ${store.name_en},`,
    productName
      ? `I'm interested in "${productName}" I saw on SOUBAK.`
      : `I found your store on SOUBAK and I have a question.`,
    "Is it available?",
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}

export function whatsappProductHref(store: Store, product: Product): string {
  const number = digitsOnly(store.whatsapp || store.phone);
  const lines = [
    `Hello ${store.name_en},`,
    `I would like to ask about: ${product.name_en}`,
    `Price on SOUBAK: ${formatOMR(product.price)}`,
    `Is it available? Can I order or reserve it?`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}

export function mapHref(lat: number, lng: number, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${lat},${lng}`;
}

export function appleMapsHref(lat: number, lng: number, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://maps.apple.com/?q=${q}&ll=${lat},${lng}`;
}
