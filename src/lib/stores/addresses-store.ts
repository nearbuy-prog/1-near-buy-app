"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerAddress } from "@/lib/types";

function makeId() {
  return `addr-${Math.random().toString(36).slice(2, 9)}`;
}

const SEED: CustomerAddress[] = [
  {
    id: "addr-seed-1",
    label: "Home",
    full_name: "Maryam Al Balushi",
    phone: "+968 9123 4567",
    email: "maryam@example.com",
    governorate: "Muscat",
    area: "Al Khuwair",
    street: "Building 231, Way 3042, Villa 12",
    landmark: "Behind Zawawi Mosque",
    instructions: "Call on arrival — gate on the left.",
    is_default: true,
  },
];

interface AddressesState {
  items: CustomerAddress[];
  add: (a: Omit<CustomerAddress, "id">) => CustomerAddress;
  update: (id: string, patch: Partial<CustomerAddress>) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => CustomerAddress | undefined;
}

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set, get) => ({
      items: SEED,
      add: (a) => {
        const addr: CustomerAddress = { ...a, id: makeId() };
        set((s) => {
          const items = addr.is_default
            ? s.items.map((x) => ({ ...x, is_default: false }))
            : s.items;
          // First address is default by default.
          if (items.length === 0) addr.is_default = true;
          return { items: [addr, ...items] };
        });
        return addr;
      },
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === id
              ? { ...x, ...patch }
              : patch.is_default
                ? { ...x, is_default: false }
                : x,
          ),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      setDefault: (id) =>
        set((s) => ({
          items: s.items.map((x) => ({ ...x, is_default: x.id === id })),
        })),
      getDefault: () =>
        get().items.find((x) => x.is_default) ?? get().items[0],
    }),
    { name: "nearby:addresses" },
  ),
);
