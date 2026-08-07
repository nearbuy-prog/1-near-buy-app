"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus, OrderStatusEvent, PaymentStatus } from "@/lib/types";

const HOUR = 60 * 60 * 1000;
const NOW = Date.now();

/** Demo orders so My Orders and the seller dashboard aren't empty on first run. */
const SEED: Order[] = [
  {
    id: "o-seed-1",
    order_number: "NB-260801-4Q7M",
    client_key: "seed-1",
    mine: true,
    store_id: "store-001",
    customer_name: "Maryam Al Balushi",
    customer_phone: "+968 9123 4567",
    customer_email: "maryam@example.com",
    items: [
      {
        product_id: "p-003",
        store_id: "store-001",
        name_en: "Embroidered Evening Abaya",
        name_ar: "عباية سهرة مطرزة",
        image: "/abaya-p003-1.jpg",
        unit_price: 45,
        quantity: 1,
        selected_size: "M",
        selected_color: "Black",
        line_total: 45,
      },
    ],
    fulfillment: "delivery",
    address: {
      id: "addr-seed-1",
      full_name: "Maryam Al Balushi",
      phone: "+968 9123 4567",
      governorate: "Muscat",
      area: "Al Khuwair",
      street: "Building 231, Way 3042, Villa 12",
      landmark: "Behind Zawawi Mosque",
    },
    subtotal: 45,
    delivery_fee: 1.5,
    discount: 0,
    tax: 0,
    total: 46.5,
    payment_method: "cod",
    payment_status: "pay_on_delivery",
    status: "confirmed",
    history: [
      { status: "order_placed", at: new Date(NOW - HOUR * 5).toISOString(), by: "customer" },
      { status: "awaiting_confirmation", at: new Date(NOW - HOUR * 5).toISOString(), by: "system" },
      { status: "confirmed", at: new Date(NOW - HOUR * 4).toISOString(), by: "store" },
    ],
    customer_note: "Please gift-wrap if possible.",
    estimated_ready_at: new Date(NOW + HOUR * 20).toISOString(),
    created_at: new Date(NOW - HOUR * 5).toISOString(),
    updated_at: new Date(NOW - HOUR * 4).toISOString(),
  },
  {
    id: "o-seed-2",
    order_number: "NB-260802-8XK2",
    client_key: "seed-2",
    mine: false,
    store_id: "store-001",
    customer_name: "Salma Al Hinai",
    customer_phone: "+968 9988 7766",
    items: [
      {
        product_id: "p-004",
        store_id: "store-001",
        name_en: "Daytime Crepe Abaya",
        name_ar: "عباية كريب نهارية",
        image: "/abaya-p003-1.jpg",
        unit_price: 38,
        quantity: 2,
        selected_size: "L",
        selected_color: "Charcoal",
        line_total: 76,
      },
    ],
    fulfillment: "pickup",
    subtotal: 76,
    delivery_fee: 0,
    discount: 0,
    tax: 0,
    total: 76,
    payment_method: "pay_on_pickup",
    payment_status: "pay_on_pickup",
    status: "awaiting_confirmation",
    history: [
      { status: "order_placed", at: new Date(NOW - HOUR * 1).toISOString(), by: "customer" },
      { status: "awaiting_confirmation", at: new Date(NOW - HOUR * 1).toISOString(), by: "system" },
    ],
    estimated_ready_at: new Date(NOW + HOUR * 2).toISOString(),
    created_at: new Date(NOW - HOUR * 1).toISOString(),
    updated_at: new Date(NOW - HOUR * 1).toISOString(),
  },
];

interface OrdersState {
  items: Order[];
  _add: (order: Order) => Order;
  _patch: (id: string, patch: Partial<Order>, event?: OrderStatusEvent) => void;
  setPaymentStatus: (id: string, status: PaymentStatus) => void;
  byId: (id: string) => Order | undefined;
  byClientKey: (key: string) => Order | undefined;
  forCustomer: () => Order[];
  forStore: (storeId: string) => Order[];
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      items: SEED,
      _add: (order) => {
        const existing = get().items.find((o) => o.client_key === order.client_key);
        if (existing) return existing; // idempotent — no duplicate on double-submit
        set((s) => ({ items: [order, ...s.items] }));
        return order;
      },
      _patch: (id, patch, event) =>
        set((s) => ({
          items: s.items.map((o) =>
            o.id === id
              ? {
                  ...o,
                  ...patch,
                  history: event ? [...o.history, event] : o.history,
                  updated_at: new Date().toISOString(),
                }
              : o,
          ),
        })),
      setPaymentStatus: (id, status) =>
        set((s) => ({
          items: s.items.map((o) =>
            o.id === id ? { ...o, payment_status: status, updated_at: new Date().toISOString() } : o,
          ),
        })),
      byId: (id) => get().items.find((o) => o.id === id),
      byClientKey: (key) => get().items.find((o) => o.client_key === key),
      forCustomer: () =>
        get()
          .items.filter((o) => o.mine)
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
      forStore: (storeId) =>
        get()
          .items.filter((o) => o.store_id === storeId)
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    }),
    { name: "nearby:orders" },
  ),
);

/** Status groups used across the UI. */
export const CANCELLABLE_STATUSES: OrderStatus[] = [
  "pending_payment",
  "order_placed",
  "awaiting_confirmation",
  "confirmed",
  "preparing",
];

export const ACTIVE_STATUSES: OrderStatus[] = [
  "pending_payment",
  "order_placed",
  "awaiting_confirmation",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
];
