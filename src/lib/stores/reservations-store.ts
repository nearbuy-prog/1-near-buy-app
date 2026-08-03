"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Reservation, ReservationStatus } from "@/lib/types";

interface CreateReservationInput {
  product_id: string;
  store_id: string;
  selected_size?: string;
  selected_color?: string;
  customer_note?: string;
  customer_name?: string;
}

interface ReservationsState {
  items: Reservation[];
  create: (input: CreateReservationInput) => Reservation;
  setStatus: (id: string, status: ReservationStatus) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function makeId() {
  return `r-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

// Demo seed so the My Reservations / seller Reservations screens are not empty
// on first load. Timestamps are relative so the countdown looks alive.
const HOUR = 60 * 60 * 1000;
const NOW = Date.now();
const SEED: Reservation[] = [
  {
    id: "r-seed-1",
    product_id: "p-003",
    store_id: "store-001",
    selected_size: "M",
    selected_color: "Black",
    customer_name: "Maryam A.",
    customer_note: "Could you set this aside? I'll pass by after Maghrib.",
    status: "pending",
    created_at: new Date(NOW - HOUR * 0.5).toISOString(),
    expires_at: new Date(NOW + HOUR * 1.5).toISOString(),
  },
  {
    id: "r-seed-2",
    product_id: "p-008",
    store_id: "store-022",
    selected_size: "Free",
    selected_color: "Navy",
    customer_name: "Salma K.",
    status: "confirmed",
    created_at: new Date(NOW - HOUR * 1).toISOString(),
    expires_at: new Date(NOW + HOUR * 1).toISOString(),
  },
];

/**
 * Customer reservations. Local-only for the prototype. Each reservation
 * defaults to "pending" with a 2-hour expiry. In Phase 2 this would post to
 * Supabase and the seller would confirm via the dashboard.
 */
export const useReservationsStore = create<ReservationsState>()(
  persist(
    (set) => ({
      items: SEED,
      create: (input) => {
        const now = new Date();
        const reservation: Reservation = {
          id: makeId(),
          product_id: input.product_id,
          store_id: input.store_id,
          selected_size: input.selected_size,
          selected_color: input.selected_color,
          customer_note: input.customer_note,
          customer_name: input.customer_name ?? "You",
          status: "pending",
          created_at: now.toISOString(),
          expires_at: new Date(now.getTime() + TWO_HOURS_MS).toISOString(),
        };
        set((s) => ({ items: [reservation, ...s.items] }));
        return reservation;
      },
      setStatus: (id, status) =>
        set((s) => ({
          items: s.items.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((r) => r.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "nearby:reservations" },
  ),
);
