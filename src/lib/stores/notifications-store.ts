"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationItem } from "@/lib/types";

function makeId() {
  return `ntf-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

interface NotificationsState {
  items: NotificationItem[];
  push: (n: Omit<NotificationItem, "id" | "created_at" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: (audience: NotificationItem["audience"], storeId?: string) => void;
  forCustomer: () => NotificationItem[];
  forSeller: (storeId: string) => NotificationItem[];
  unreadCustomer: () => number;
  unreadSeller: (storeId: string) => number;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      push: (n) =>
        set((s) => ({
          items: [
            { ...n, id: makeId(), created_at: new Date().toISOString(), read: false },
            ...s.items,
          ].slice(0, 100),
        })),
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((x) => (x.id === id ? { ...x, read: true } : x)),
        })),
      markAllRead: (audience, storeId) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.audience === audience && (!storeId || x.store_id === storeId)
              ? { ...x, read: true }
              : x,
          ),
        })),
      forCustomer: () => get().items.filter((x) => x.audience === "customer"),
      forSeller: (storeId) =>
        get().items.filter((x) => x.audience === "seller" && x.store_id === storeId),
      unreadCustomer: () =>
        get().items.filter((x) => x.audience === "customer" && !x.read).length,
      unreadSeller: (storeId) =>
        get().items.filter(
          (x) => x.audience === "seller" && x.store_id === storeId && !x.read,
        ).length,
    }),
    { name: "nearby:notifications" },
  ),
);
