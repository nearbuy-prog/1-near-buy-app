import type {
  Product,
  Store,
  FulfillmentMethod,
  PaymentMethod,
} from "@/lib/types";

/**
 * Whether a real payment gateway is wired up. There is none yet, so online
 * card / Apple Pay / Google Pay are shown but disabled ("sandbox / not
 * available"). Flip this (and add the integration) in Phase 2.
 */
export const PAYMENT_GATEWAY_CONNECTED = false;

export const DEFAULT_DELIVERY_FEE = 1.5; // OMR
export const DEFAULT_PREP_MINS = 60;
export const VAT_RATE = 0; // Oman VAT (5%) — prices are treated VAT-inclusive for now.

/** Stable key for a size/color combination. Products without variants use "-|-" . */
export function variantKey(size?: string, color?: string): string {
  return `${size ?? "-"}|${color ?? "-"}`;
}

export interface OrderingConfig {
  /** Online ordering available for this product right now. */
  onlineEnabled: boolean;
  methods: { delivery: boolean; pickup: boolean };
  /** Which payment methods the store supports (before gateway availability). */
  payments: { card: boolean; applePay: boolean; googlePay: boolean; cod: boolean; payOnPickup: boolean };
  /** A real gateway is connected — card family is actually chargeable. */
  gatewayConnected: boolean;
  deliveryFee: number;
  prepMins: number;
}

/**
 * The single place that decides how online ordering behaves for a product.
 * Product-level overrides win; otherwise we derive sensible defaults from the
 * store flags that already exist in the seed data.
 */
export function getOrderingConfig(product: Product, store: Store): OrderingConfig {
  const o = product.ordering ?? {};

  const onlineEnabled =
    (o.online_ordering ?? store.accepts_online_orders) === true && product.in_stock === true;

  const fm: FulfillmentMethod[] | undefined =
    o.fulfillment_methods ?? store.fulfillment_methods;
  const delivery = fm ? fm.includes("delivery") : store.delivers === true;
  const pickup = fm
    ? fm.includes("pickup")
    : store.pickup_available ?? store.accepts_visitors !== false;

  const pm: PaymentMethod[] | undefined = o.payment_methods ?? store.payment_methods;
  const has = (m: PaymentMethod, fallback: boolean) => (pm ? pm.includes(m) : fallback);

  return {
    onlineEnabled,
    methods: { delivery, pickup },
    payments: {
      card: has("card", true),
      applePay: has("apple_pay", true),
      googlePay: has("google_pay", true),
      cod: has("cod", store.cod_enabled ?? true),
      payOnPickup: has("pay_on_pickup", store.pay_on_pickup_enabled ?? true),
    },
    gatewayConnected: PAYMENT_GATEWAY_CONNECTED,
    deliveryFee: store.delivery_fee ?? DEFAULT_DELIVERY_FEE,
    prepMins: store.prep_time_mins ?? DEFAULT_PREP_MINS,
  };
}
