"use client";

import type {
  Order,
  OrderStatus,
  Product,
  Store,
  FulfillmentMethod,
  PaymentMethod,
  CustomerAddress,
  NotificationType,
} from "@/lib/types";
import { useOrdersStore } from "@/lib/stores/orders-store";
import { useInventoryStore } from "@/lib/stores/inventory-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { getOrderingConfig, variantKey, VAT_RATE } from "./config";

// ── helpers ────────────────────────────────────────────────────────────────

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** NB-YYMMDD-XXXX with a crypto-random suffix. */
function secureOrderNumber(): string {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const bytes = new Uint8Array(3);
  globalThis.crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes)
    .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 31])
    .join("");
  return `NB-${ymd}-${suffix}`;
}

function makeId() {
  return `o-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function notify(
  audience: "customer" | "seller",
  order: Pick<Order, "id" | "order_number" | "store_id" | "status">,
  type: NotificationType,
) {
  useNotificationsStore.getState().push({
    audience,
    store_id: audience === "seller" ? order.store_id : undefined,
    order_id: order.id,
    order_number: order.order_number,
    type,
    status: order.status,
  });
}

const STATUS_TO_NOTIFICATION: Partial<Record<OrderStatus, NotificationType>> = {
  confirmed: "order_confirmed",
  ready_for_pickup: "order_ready",
  out_for_delivery: "order_out_for_delivery",
  delivered: "order_delivered",
  completed: "order_delivered",
  rejected: "order_rejected",
  cancelled: "order_cancelled",
};

// ── place order ──────────────────────────────────────────────────────────────

export interface PlaceOrderInput {
  product: Product;
  store: Store;
  quantity: number;
  size?: string;
  color?: string;
  fulfillment: FulfillmentMethod;
  address?: CustomerAddress;
  paymentMethod: PaymentMethod;
  note?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  /** Idempotency key — the same key never creates a second order. */
  clientKey: string;
}

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: "out_of_stock" | "insufficient_stock" | "payment_unavailable" | "invalid"; available?: number };

export function placeOrder(input: PlaceOrderInput): PlaceOrderResult {
  const orders = useOrdersStore.getState();
  const inventory = useInventoryStore.getState();

  // Idempotent: a repeated submit returns the same order.
  const existing = orders.byClientKey(input.clientKey);
  if (existing) return { ok: true, order: existing };

  const { product, store } = input;
  const cfg = getOrderingConfig(product, store);
  const isCard =
    input.paymentMethod === "card" ||
    input.paymentMethod === "apple_pay" ||
    input.paymentMethod === "google_pay";
  if (isCard && !cfg.gatewayConnected) return { ok: false, error: "payment_unavailable" };

  const qty = Math.floor(input.quantity);
  if (!qty || qty < 1) return { ok: false, error: "invalid" };

  // Re-validate stock at placement (mirrors the server check we'll add later).
  const available = inventory.available(product, input.size, input.color);
  if (available <= 0) return { ok: false, error: "out_of_stock", available: 0 };
  if (qty > available) return { ok: false, error: "insufficient_stock", available };

  // Totals are recomputed here from canonical data — never trust the client form.
  const unit = product.price;
  const subtotal = round3(unit * qty);
  const delivery_fee = input.fulfillment === "delivery" ? round3(cfg.deliveryFee) : 0;
  const discount = 0;
  const tax = round3(subtotal * VAT_RATE);
  const total = round3(subtotal + delivery_fee - discount + tax);

  const payment_status =
    input.paymentMethod === "cod"
      ? "pay_on_delivery"
      : input.paymentMethod === "pay_on_pickup"
        ? "pay_on_pickup"
        : "pending";

  const nowIso = new Date().toISOString();
  const readyOffset = (cfg.prepMins + (input.fulfillment === "delivery" ? 30 : 0)) * 60 * 1000;

  const order: Order = {
    id: makeId(),
    order_number: secureOrderNumber(),
    client_key: input.clientKey,
    mine: true,
    store_id: store.id,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    items: [
      {
        product_id: product.id,
        store_id: store.id,
        name_en: product.name_en,
        name_ar: product.name_ar,
        image: product.images[0] ?? "",
        unit_price: unit,
        quantity: qty,
        selected_size: input.size,
        selected_color: input.color,
        line_total: subtotal,
      },
    ],
    fulfillment: input.fulfillment,
    address: input.fulfillment === "delivery" ? input.address : undefined,
    subtotal,
    delivery_fee,
    discount,
    tax,
    total,
    payment_method: input.paymentMethod,
    payment_status,
    status: "awaiting_confirmation",
    history: [
      { status: "order_placed", at: nowIso, by: "customer" },
      { status: "awaiting_confirmation", at: nowIso, by: "system" },
    ],
    customer_note: input.note?.trim() || undefined,
    estimated_ready_at: new Date(Date.now() + readyOffset).toISOString(),
    created_at: nowIso,
    updated_at: nowIso,
  };

  orders._add(order);
  inventory.decrement(product.id, variantKey(input.size, input.color), qty);

  notify("seller", order, "order_placed");
  notify("customer", order, "order_placed");

  return { ok: true, order };
}

// ── lifecycle transitions ────────────────────────────────────────────────────

function restoreStock(order: Order) {
  const inventory = useInventoryStore.getState();
  for (const it of order.items) {
    inventory.restore(it.product_id, variantKey(it.selected_size, it.selected_color), it.quantity);
  }
}

export function cancelByCustomer(orderId: string): boolean {
  const orders = useOrdersStore.getState();
  const order = orders.byId(orderId);
  if (!order) return false;
  const cancellable: OrderStatus[] = [
    "pending_payment",
    "order_placed",
    "awaiting_confirmation",
    "confirmed",
    "preparing",
  ];
  if (!cancellable.includes(order.status)) return false;

  const needs_refund = order.payment_status === "paid";
  orders._patch(
    orderId,
    { status: "cancelled", needs_refund, payment_status: needs_refund ? "refund_pending" : order.payment_status },
    { status: "cancelled", at: new Date().toISOString(), by: "customer" },
  );
  restoreStock(order);
  notify("seller", { ...order, status: "cancelled" }, "order_cancelled");
  if (needs_refund) notify("customer", { ...order, status: "cancelled" }, "refund_initiated");
  return true;
}

export function sellerAccept(orderId: string): void {
  const orders = useOrdersStore.getState();
  const order = orders.byId(orderId);
  if (!order) return;
  orders._patch(
    orderId,
    { status: "confirmed" },
    { status: "confirmed", at: new Date().toISOString(), by: "store" },
  );
  notify("customer", { ...order, status: "confirmed" }, "order_confirmed");
}

export function sellerReject(orderId: string, reason: string): void {
  const orders = useOrdersStore.getState();
  const order = orders.byId(orderId);
  if (!order) return;
  const needs_refund = order.payment_status === "paid";
  orders._patch(
    orderId,
    {
      status: "rejected",
      reject_reason: reason,
      needs_refund,
      payment_status: needs_refund ? "refund_pending" : order.payment_status,
    },
    { status: "rejected", at: new Date().toISOString(), by: "store", note: reason },
  );
  restoreStock(order);
  notify("customer", { ...order, status: "rejected" }, "order_rejected");
  if (needs_refund) notify("customer", { ...order, status: "rejected" }, "refund_initiated");
}

export function advanceStatus(orderId: string, status: OrderStatus): void {
  const orders = useOrdersStore.getState();
  const order = orders.byId(orderId);
  if (!order) return;
  const patch: Partial<Order> = { status };
  // Cash orders settle on delivery / completion.
  if ((status === "delivered" || status === "completed") && (order.payment_method === "cod" || order.payment_method === "pay_on_pickup")) {
    patch.payment_status = "paid";
  }
  orders._patch(orderId, patch, { status, at: new Date().toISOString(), by: "store" });
  const type = STATUS_TO_NOTIFICATION[status];
  if (type) notify("customer", { ...order, status }, type);
}

/** Seller's allowed next steps, depending on fulfilment method. */
export function nextStatuses(order: Order): OrderStatus[] {
  const flowDelivery: OrderStatus[] = ["confirmed", "preparing", "out_for_delivery", "delivered", "completed"];
  const flowPickup: OrderStatus[] = ["confirmed", "preparing", "ready_for_pickup", "completed"];
  const flow = order.fulfillment === "delivery" ? flowDelivery : flowPickup;
  const idx = flow.indexOf(order.status);
  if (idx === -1 || idx === flow.length - 1) return [];
  return [flow[idx + 1]];
}
