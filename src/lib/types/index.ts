/**
 * Domain types for Nearby.
 *
 * These types intentionally mirror what the future Postgres schema in Supabase
 * will look like. Bilingual fields use _en / _ar suffixes so we can drop in
 * Arabic content later without a migration. snake_case where it matches the DB.
 */

export type Locale = "en" | "ar";

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export type CityId = "muscat" | "salalah" | "sohar" | "nizwa" | "sur" | "barka";

export interface City {
  id: CityId;
  name_en: string;
  name_ar: string;
  /** Approximate city center — used for default map view & distance calc fallback. */
  center: { lat: number; lng: number };
  /** Map default zoom level when this city is selected. */
  zoom: number;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export type CategoryId =
  | "womens-clothing"
  | "mens-clothing"
  | "abayas"
  | "thobes"
  | "mukhawar-jalabiya"
  | "shoes"
  | "bags"
  | "beauty"
  | "perfumes"
  | "oud-bukhoor"
  | "accessories"
  | "kids"
  | "home"
  | "gifts"
  | "handmade-home";

export interface Category {
  id: CategoryId;
  slug: string;
  name_en: string;
  name_ar: string;
  /** Lucide icon name, resolved at render time. */
  icon: string;
  /** Hero/illustration image used on the category card. */
  image: string;
  /** Optional accent color override. */
  accent?: string;
}

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export interface Store {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  logo: string;
  cover: string;
  city: CityId;
  /** Full street/area address. */
  address_en: string;
  address_ar: string;
  /** Lat/lng — drives map pin and distance calculations. */
  location: { lat: number; lng: number };
  phone: string;
  /** Phone number in E.164 format for WhatsApp deep links. */
  whatsapp: string;
  /** Categories this store sells. */
  categories: CategoryId[];
  rating: number;
  review_count: number;
  /** Opening hours per day, 24h "HH:MM-HH:MM" or "closed". */
  hours: {
    sat: string;
    sun: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
  };
  /** True if store accepts in-app order requests. False = contact-only. */
  accepts_online_orders: boolean;
  /** True if the store delivers; details handled by store, not the app. */
  delivers: boolean;
  /** Optional badge: featured, verified, new arrivals etc. */
  badges?: Array<"verified" | "featured" | "new">;
  // --- Home / online-based creators (Handmade & Home Businesses) ---
  /** Online-only business with no physical shopfront. */
  online_only?: boolean;
  /** Runs from home. Home address is kept private. */
  home_based?: boolean;
  /** Small independent maker / local creator. */
  local_creator?: boolean;
  /** Delivery coverage label, e.g. "Delivery Across Oman". */
  delivery_area_en?: string;
  delivery_area_ar?: string;
  /** Offers pickup after the order is confirmed. */
  pickup_available?: boolean;
  /** False = does not receive visitors; hide map pin & directions. */
  accepts_visitors?: boolean;
  /**
   * Typical reply time for in-app messages. Used to render the trust badge
   * across product pages, store pages, and the chat list.
   */
  response_time?: ResponseTime;
  // --- Online ordering config (optional; defaults derive from
  //     accepts_online_orders / delivers / pickup_available) ---
  fulfillment_methods?: FulfillmentMethod[];
  payment_methods?: PaymentMethod[];
  /** Flat delivery fee in OMR. */
  delivery_fee?: number;
  cod_enabled?: boolean;
  pay_on_pickup_enabled?: boolean;
  prep_time_mins?: number;
}

export type ResponseTime =
  | "minutes"      // Usually replies in 5 minutes
  | "within-hour"  // Usually replies within 1 hour
  | "few-hours"    // Usually replies in a few hours
  | "day"          // Usually replies within a day
  | "slow";        // Slow response today


// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type ProductColor = {
  name_en: string;
  name_ar: string;
  hex: string;
};

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "Free" | string;

export interface Product {
  id: string;
  store_id: string;
  category: CategoryId;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  /** Price in OMR. Always 3-decimal in display layer. */
  price: number;
  /** Original price if discounted. Undefined if not on sale. */
  original_price?: number;
  /** Primary image plus optional gallery shots. */
  images: string[];
  /**
   * Optional per-colour gallery. Keyed by the colour's `name_en` (e.g.
   * "Green"). When a shopper selects a colour that has an entry here, the
   * gallery swaps to that colour's photos. Colours without an entry fall back
   * to `images`.
   */
  images_by_color?: Record<string, string[]>;
  sizes: ProductSize[];
  colors: ProductColor[];
  /** Free-text tags used by search ("red", "embroidered", "summer", etc.). */
  tags: string[];
  in_stock: boolean;
  /**
   * How the product is fulfilled — drives the "Ready to Buy / Made to Order /
   * Customizable" label and the "Request Customization" flow. Undefined =
   * treated as a normal ready-to-buy product.
   */
  fulfillment?: "ready" | "made-to-order" | "customizable";
  /** Estimated preparation / turnaround time, e.g. "3–5 days". */
  prep_time_en?: string;
  prep_time_ar?: string;
  /** Featured = appears in home highlight rail. */
  featured?: boolean;
  /** Trending = high search-volume products in the city. */
  trending?: boolean;
  /** Optional overrides for the shared online-ordering feature. */
  ordering?: ProductOrderingOverrides;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  store_id: string;
  product_id?: string;
  author_name: string;
  rating: number;
  comment_en: string;
  comment_ar?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Favorites — local-only in v1, will sync to user account in Phase 2.
// ---------------------------------------------------------------------------

export interface FavoriteEntry {
  product_id: string;
  added_at: string;
}

// ---------------------------------------------------------------------------
// Search & filters
// ---------------------------------------------------------------------------

export interface SearchFilters {
  city?: CityId;
  category?: CategoryId;
  query?: string;
  min_price?: number;
  max_price?: number;
  colors?: string[];
  sizes?: string[];
  on_sale?: boolean;
  in_stock_only?: boolean;
  min_rating?: number;
  /** Sort key. */
  sort?: "relevance" | "price-asc" | "price-desc" | "rating" | "distance" | "newest";
}

export interface SearchResult {
  product: Product;
  store: Store;
  distance_km?: number;
}

// ---------------------------------------------------------------------------
// Reservations — local-only, simulates a 2-hour hold the store can confirm.
// ---------------------------------------------------------------------------

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired";

export interface Reservation {
  id: string;
  product_id: string;
  store_id: string;
  selected_size?: string;
  selected_color?: string;
  customer_note?: string;
  customer_name: string;
  status: ReservationStatus;
  /** ISO timestamp when the reservation was created. */
  created_at: string;
  /** ISO timestamp when the hold expires (created_at + 2h). */
  expires_at: string;
}

// ---------------------------------------------------------------------------
// In-app chat — prototype only, stored in local state.
// ---------------------------------------------------------------------------

export type ChatRole = "customer" | "store";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: ChatRole;
  text: string;
  /** Optional image upload (data URL or static path). */
  image?: string;
  created_at: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  store_id: string;
  /** Optional product the conversation started from. */
  product_id?: string;
  created_at: string;
  updated_at: string;
  /** Cached unread count for the customer side. */
  unread_count?: number;
}

// ---------------------------------------------------------------------------
// App mode — customer vs. seller. Local-only; in production these would be
// separate accounts. For the prototype, we allow switching freely.
// ---------------------------------------------------------------------------

export type AppMode = "customer" | "seller";

// ---------------------------------------------------------------------------
// Online ordering — checkout, orders, inventory, addresses.
//
// This is a client-side prototype: the "order service" (src/lib/orders) is the
// single source of truth and is written so it can be swapped for Supabase +
// a payment gateway later without changing the UI. Nothing here is a real
// server; server-side enforcement (authz, anti-oversell, payments) arrives in
// Phase 2.
// ---------------------------------------------------------------------------

export type FulfillmentMethod = "delivery" | "pickup";

export type PaymentMethod =
  | "card"          // online card — requires a gateway (sandbox/unavailable for now)
  | "apple_pay"
  | "google_pay"
  | "cod"           // cash on delivery
  | "pay_on_pickup";

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "pay_on_delivery"
  | "pay_on_pickup"
  | "failed"
  | "refund_pending"
  | "refunded";

export type OrderStatus =
  | "pending_payment"
  | "order_placed"
  | "awaiting_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "rejected"
  | "cancelled"
  | "payment_failed"
  | "refunded";

export interface CustomerAddress {
  id: string;
  label?: string;
  full_name: string;
  phone: string;
  email?: string;
  /** Governorate / city. */
  governorate: string;
  area: string;
  /** Street / building / villa / apartment details. */
  street: string;
  landmark?: string;
  instructions?: string;
  is_default?: boolean;
}

/** Line item — a snapshot frozen at purchase time (survives later product edits). */
export interface OrderItemSnapshot {
  product_id: string;
  store_id: string;
  name_en: string;
  name_ar: string;
  image: string;
  unit_price: number;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  line_total: number;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  by: "customer" | "store" | "system";
  note?: string;
}

export interface Order {
  id: string;
  order_number: string;
  /** Idempotency key — repeated submits with the same key return the same order. */
  client_key: string;
  /** Local marker for "this browser's" orders (stand-in for a real user id). */
  mine?: boolean;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: OrderItemSnapshot[];
  fulfillment: FulfillmentMethod;
  address?: CustomerAddress;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  history: OrderStatusEvent[];
  customer_note?: string;
  reject_reason?: string;
  needs_refund?: boolean;
  estimated_ready_at?: string;
  created_at: string;
  updated_at: string;
}

/** Optional per-product overrides for the shared online-ordering feature. */
export interface ProductOrderingOverrides {
  /** Turn online ordering off for a single product. */
  online_ordering?: boolean;
  /** Fallback total stock when no per-variant map is given. */
  stock?: number;
  /** Per-variant stock, keyed by `${size}|${color}` (see variantKey()). */
  variant_stock?: Record<string, number>;
  fulfillment_methods?: FulfillmentMethod[];
  payment_methods?: PaymentMethod[];
}

export type NotificationAudience = "customer" | "seller";

export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_rejected"
  | "order_status"
  | "order_ready"
  | "order_out_for_delivery"
  | "order_delivered"
  | "order_cancelled"
  | "payment_completed"
  | "payment_failed"
  | "refund_initiated"
  | "refund_completed";

export interface NotificationItem {
  id: string;
  audience: NotificationAudience;
  /** Present for seller notifications — which store it belongs to. */
  store_id?: string;
  order_id: string;
  order_number: string;
  type: NotificationType;
  status?: OrderStatus;
  created_at: string;
  read: boolean;
}

