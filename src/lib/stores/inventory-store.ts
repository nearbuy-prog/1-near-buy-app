"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";
import { variantKey } from "@/lib/orders/config";

/**
 * Client-side inventory for the prototype. Initial per-variant stock is
 * derived from the product (deterministic), and we persist only what has been
 * *consumed* by orders. Real anti-oversell enforcement needs the Phase-2
 * backend — this mirrors the intended server logic so it can move there
 * unchanged.
 */

const DEFAULT_STOCK = 8;

/** Forced initial stock for specific variants — gives predictable test cases. */
const FORCED: Record<string, number> = {
  // p-003 = an abaya at Dar Al Anaqa (store-001), has size M/S and colour Black.
  "p-003::M|Black": 0, // fully out of stock — test the disabled variant
  "p-003::S|Black": 2, // low stock — test the quantity cap
};

function initialStock(product: Product, vkey: string): number {
  if (!product.in_stock) return 0;
  const forced = FORCED[`${product.id}::${vkey}`];
  if (forced !== undefined) return forced;
  const vs = product.ordering?.variant_stock?.[vkey];
  if (vs !== undefined) return vs;
  if (product.ordering?.stock !== undefined) return product.ordering.stock;
  return DEFAULT_STOCK;
}

interface InventoryState {
  /** productId::variantKey -> units consumed by placed orders. */
  consumed: Record<string, number>;
  available: (product: Product, size?: string, color?: string) => number;
  isOutOfStock: (product: Product, size?: string, color?: string) => boolean;
  decrement: (productId: string, vkey: string, qty: number) => void;
  restore: (productId: string, vkey: string, qty: number) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      consumed: {},
      available: (product, size, color) => {
        const vkey = variantKey(size, color);
        const used = get().consumed[`${product.id}::${vkey}`] ?? 0;
        return Math.max(0, initialStock(product, vkey) - used);
      },
      isOutOfStock: (product, size, color) =>
        get().available(product, size, color) <= 0,
      decrement: (productId, vkey, qty) =>
        set((s) => {
          const key = `${productId}::${vkey}`;
          return { consumed: { ...s.consumed, [key]: (s.consumed[key] ?? 0) + qty } };
        }),
      restore: (productId, vkey, qty) =>
        set((s) => {
          const key = `${productId}::${vkey}`;
          return {
            consumed: { ...s.consumed, [key]: Math.max(0, (s.consumed[key] ?? 0) - qty) },
          };
        }),
    }),
    { name: "nearby:inventory" },
  ),
);
