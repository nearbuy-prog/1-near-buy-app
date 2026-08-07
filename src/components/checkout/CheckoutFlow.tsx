"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X, Minus, Plus, Check, MapPin, Truck, Store as StoreIcon,
  CreditCard, Banknote, Loader2, ShieldCheck, ChevronRight, ChevronLeft,
} from "lucide-react";
import type {
  Product, Store, FulfillmentMethod, PaymentMethod, CustomerAddress, Order,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatOMR } from "@/lib/utils/currency";
import { mapHref } from "@/lib/utils/contact";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useAddressesStore } from "@/lib/stores/addresses-store";
import { useInventoryStore } from "@/lib/stores/inventory-store";
import { getOrderingConfig, VAT_RATE } from "@/lib/orders/config";
import { placeOrder } from "@/lib/orders/order-service";
import { to, tpl, paymentMethodLabel, paymentStatusLabel } from "@/lib/i18n/orders-i18n";

interface Props {
  product: Product;
  store: Store;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSize?: string;
  initialColor?: string;
}

const STEPS = ["stepOptions", "stepDelivery", "stepPayment", "stepReview"] as const;

export function CheckoutFlow({ product, store, open, onOpenChange, initialSize, initialColor }: Props) {
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const L = (o: { en: string; ar: string }) => o[locale];
  const rtl = locale === "ar";

  const cfg = useMemo(() => getOrderingConfig(product, store), [product, store]);
  const availableFn = useInventoryStore((s) => s.available);
  const consumed = useInventoryStore((s) => s.consumed); // subscribe so stock updates
  const addresses = useAddressesStore((s) => s.items);
  const addAddress = useAddressesStore((s) => s.add);
  const getDefaultAddr = useAddressesStore((s) => s.getDefault);

  const name = locale === "ar" ? product.name_ar : product.name_en;
  const storeName = locale === "ar" ? store.name_ar : store.name_en;
  const storeAddress = locale === "ar" ? store.address_ar : store.address_en;
  const hasSizes = product.sizes.length > 0;
  const hasColors = product.colors.length > 0;

  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [size, setSize] = useState<string | undefined>(initialSize ?? (hasSizes ? String(product.sizes[0]) : undefined));
  const [color, setColor] = useState<string | undefined>(initialColor ?? product.colors[0]?.name_en);
  const [qty, setQty] = useState(1);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>(cfg.methods.delivery ? "delivery" : "pickup");
  const [addressMode, setAddressMode] = useState<"saved" | "new">(addresses.length ? "saved" : "new");
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(getDefaultAddr()?.id);
  const [payment, setPayment] = useState<PaymentMethod | undefined>(undefined);
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientKey = useRef<string>("");

  // Address form (also used for pickup contact)
  const d = getDefaultAddr();
  const [form, setForm] = useState({
    full_name: d?.full_name ?? "", phone: d?.phone ?? "", email: d?.email ?? "",
    governorate: d?.governorate ?? "Muscat", area: d?.area ?? "", street: d?.street ?? "",
    landmark: d?.landmark ?? "", instructions: d?.instructions ?? "", save: false,
  });
  const [touched, setTouched] = useState(false);

  // Reset when (re)opened fresh.
  useEffect(() => {
    if (open && !placed) {
      clientKey.current = `ck-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
      setStep(0);
      setError(null);
    }
    if (!open) {
      const t = setTimeout(() => {
        setPlaced(null); setStep(0); setQty(1); setAgree(false); setPayment(undefined);
        setNote(""); setError(null); setTouched(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const variantOOS = (s?: string, c?: string) => availableFn(product, s, c) <= 0;
  const available = availableFn(product, size, color);
  const unit = product.price;
  const subtotal = unit * qty;
  const deliveryFee = fulfillment === "delivery" ? cfg.deliveryFee : 0;
  const tax = subtotal * VAT_RATE;
  const total = subtotal + deliveryFee + tax;

  const enabledPayments: PaymentMethod[] = [
    ...(fulfillment === "delivery" && cfg.payments.cod ? (["cod"] as PaymentMethod[]) : []),
    ...(fulfillment === "pickup" && cfg.payments.payOnPickup ? (["pay_on_pickup"] as PaymentMethod[]) : []),
  ];
  useEffect(() => {
    if (payment && !enabledPayments.includes(payment)) setPayment(undefined);
  }, [fulfillment]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedAddress: CustomerAddress | undefined =
    addressMode === "saved" ? addresses.find((a) => a.id === selectedAddressId) ?? d : undefined;

  const addrValid = (a: { full_name: string; phone: string; governorate: string; area: string; street: string }) =>
    a.full_name.trim().length >= 2 && a.phone.trim().length >= 8 && a.governorate.trim() && a.area.trim() && a.street.trim();

  // ── step validation ──
  const canLeaveOptions = (!hasSizes || !!size) && (!hasColors || !!color) && available > 0 && qty <= available && qty >= 1;
  const deliveryValid =
    fulfillment === "delivery"
      ? addressMode === "saved" ? !!selectedAddress : addrValid(form)
      : form.full_name.trim().length >= 2 && form.phone.trim().length >= 8; // pickup contact
  const canLeaveDelivery = (fulfillment === "delivery" ? cfg.methods.delivery : cfg.methods.pickup) && deliveryValid;
  const canLeavePayment = !!payment && enabledPayments.includes(payment);
  const canPlace = agree && !submitting;

  function handlePlace() {
    if (!canPlace) { setTouched(true); return; }
    setSubmitting(true);
    setError(null);
    // Build the address / contact used for the order.
    let address: CustomerAddress | undefined;
    if (fulfillment === "delivery") {
      if (addressMode === "saved" && selectedAddress) address = selectedAddress;
      else {
        const newAddr: Omit<CustomerAddress, "id"> = {
          full_name: form.full_name, phone: form.phone, email: form.email || undefined,
          governorate: form.governorate, area: form.area, street: form.street,
          landmark: form.landmark || undefined, instructions: form.instructions || undefined,
        };
        address = form.save ? addAddress(newAddr) : { ...newAddr, id: "addr-inline" };
      }
    }
    const contactName = address?.full_name ?? form.full_name;
    const contactPhone = address?.phone ?? form.phone;
    const contactEmail = (address?.email ?? form.email) || undefined;

    const res = placeOrder({
      product, store, quantity: qty, size, color, fulfillment,
      address, paymentMethod: payment!, note,
      customerName: contactName, customerPhone: contactPhone, customerEmail: contactEmail,
      clientKey: clientKey.current,
    });
    setSubmitting(false);
    if (!res.ok) {
      if (res.error === "insufficient_stock") setError(tpl(L(to.checkout.onlyLeft), { n: res.available ?? 0 }));
      else if (res.error === "out_of_stock") setError(L(to.checkout.outOfStock));
      else if (res.error === "payment_unavailable") setError(L(to.checkout.cardUnavailable));
      else setError(L(to.checkout.placeError));
      return;
    }
    setPlaced(res.order);
  }

  if (!open) return null;

  const money = (n: number) => formatOMR(n);

  // ── confirmation view ──
  if (placed) {
    return (
      <Overlay rtl={rtl} onClose={() => onOpenChange(false)} title={L(to.checkout.confirmed)}>
        <div className="mx-auto max-w-md space-y-5 p-4 pb-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
            <Check className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">{L(to.checkout.confirmed)}</h2>
            <p className="mt-1 text-sm text-warmgray">{L(to.checkout.confirmedSub)}</p>
          </div>
          <div className="space-y-2 rounded-2xl border border-warmgray-200/70 bg-white p-4 text-start text-sm">
            <Row k={L(to.checkout.orderNumber)} v={<span className="font-mono font-semibold">{placed.order_number}</span>} />
            <Row k={L(to.orders.contactStore)} v={storeName} />
            <Row k={L(to.checkout.total)} v={<span className="font-semibold">{money(placed.total)}</span>} />
            <Row k={L(to.checkout.paymentStatus)} v={L(paymentStatusLabel[placed.payment_status])} />
            <Row k={L(to.checkout.method)} v={L(paymentMethodLabel[placed.payment_method])} />
            {placed.estimated_ready_at && (
              <Row k={L(to.checkout.eta)} v={new Date(placed.estimated_ready_at).toLocaleString(locale === "ar" ? "ar-OM" : "en-OM", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
            )}
          </div>
          <div className="space-y-2">
            <Button variant="primary" size="lg" className="w-full" onClick={() => { onOpenChange(false); router.push(`/orders/${placed.id}`); }}>
              {L(to.checkout.viewOrder)}
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => { onOpenChange(false); router.push("/"); }}>
              {L(to.checkout.continueShopping)}
            </Button>
          </div>
        </div>
      </Overlay>
    );
  }

  const primaryLabel =
    step < 3 ? L(to.common.next) : payment && payment !== "cod" && payment !== "pay_on_pickup" ? L(to.checkout.payAndPlace) : L(to.checkout.placeOrder);
  const canAdvance = step === 0 ? canLeaveOptions : step === 1 ? canLeaveDelivery : step === 2 ? canLeavePayment : canPlace;

  function onPrimary() {
    if (step < 3) {
      if (!canAdvance) { setTouched(true); return; }
      setTouched(false);
      setStep((s) => s + 1);
    } else {
      handlePlace();
    }
  }

  return (
    <Overlay rtl={rtl} onClose={() => onOpenChange(false)} title={L(to.checkout.title)}>
      {/* stepper */}
      <div className="sticky top-14 z-10 border-b border-warmgray-200/60 bg-ivory/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5">
              <div className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-semibold ${i < step ? "bg-olive text-white" : i === step ? "bg-charcoal text-ivory" : "bg-cream text-warmgray"}`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`truncate text-[11px] ${i === step ? "font-semibold text-charcoal" : "text-warmgray"}`}>{L(to.checkout[s])}</span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-warmgray-200/70" />}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-5 p-4 pb-40">
        {/* product header */}
        <div className="flex items-center gap-3 rounded-2xl bg-cream p-3">
          <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-white">
            {product.images[0] && <Image src={product.images[0]} alt={name} fill sizes="64px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-charcoal">{name}</p>
            <p className="text-xs text-warmgray">{storeName}</p>
            <p className="mt-0.5 text-sm font-semibold text-charcoal">{money(unit)}</p>
          </div>
        </div>

        {/* STEP 0 — Options */}
        {step === 0 && (
          <div className="space-y-4">
            {hasSizes && (
              <Field label={L(to.checkout.size)}>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => {
                    const v = String(s); const oos = variantOOS(v, color);
                    return (
                      <Chip key={v} active={size === v} disabled={oos} onClick={() => setSize(v)}>
                        {v}{oos && <span className="ms-1 text-[10px] opacity-70">· {L(to.checkout.outOfStock)}</span>}
                      </Chip>
                    );
                  })}
                </div>
              </Field>
            )}
            {hasColors && (
              <Field label={L(to.checkout.color)}>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map((c) => {
                    const oos = variantOOS(size, c.name_en);
                    return (
                      <Chip key={c.name_en} active={color === c.name_en} disabled={oos} onClick={() => setColor(c.name_en)}>
                        <span className="inline-block h-3 w-3 rounded-full border border-warmgray-200" style={{ backgroundColor: c.hex }} />
                        {locale === "ar" ? c.name_ar : c.name_en}{oos && <span className="ms-1 text-[10px] opacity-70">· {L(to.checkout.outOfStock)}</span>}
                      </Chip>
                    );
                  })}
                </div>
              </Field>
            )}

            <Field label={L(to.checkout.quantity)}>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-warmgray-200 bg-white">
                  <button type="button" className="grid h-9 w-9 place-items-center text-charcoal disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <button type="button" className="grid h-9 w-9 place-items-center text-charcoal disabled:opacity-40" disabled={qty >= available} onClick={() => setQty((q) => Math.min(available, q + 1))}><Plus className="h-4 w-4" /></button>
                </div>
                {available > 0 ? (
                  <span className="text-xs text-sage">{available <= 5 ? tpl(L(to.checkout.onlyLeft), { n: available }) : L(to.checkout.inStock)}</span>
                ) : (
                  <span className="text-xs font-medium text-terracotta">{L(to.checkout.outOfStock)}</span>
                )}
              </div>
            </Field>

            <Field label={`${L(to.checkout.note)} (${L(to.common.optional)})`}>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={280}
                placeholder={L(to.checkout.notePlaceholder)}
                className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm placeholder:text-warmgray focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20" />
            </Field>

            <SummaryLine k={L(to.checkout.subtotal)} v={money(subtotal)} strong />
          </div>
        )}

        {/* STEP 1 — Delivery */}
        {step === 1 && (
          <div className="space-y-4">
            <Field label={L(to.checkout.fulfillment)}>
              <div className="grid grid-cols-2 gap-2">
                {cfg.methods.delivery && (
                  <Option active={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")} icon={<Truck className="h-4 w-4" />} title={L(to.checkout.homeDelivery)} sub={money(cfg.deliveryFee)} />
                )}
                {cfg.methods.pickup && (
                  <Option active={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")} icon={<StoreIcon className="h-4 w-4" />} title={L(to.checkout.storePickup)} sub={money(0)} />
                )}
              </div>
            </Field>

            {fulfillment === "delivery" ? (
              <>
                {addresses.length > 0 && (
                  <Field label={L(to.checkout.savedAddresses)}>
                    <div className="space-y-2">
                      {addresses.map((a) => (
                        <button key={a.id} type="button" onClick={() => { setAddressMode("saved"); setSelectedAddressId(a.id); }}
                          className={`flex w-full items-start gap-2 rounded-2xl border p-3 text-start text-sm transition-all ${addressMode === "saved" && selectedAddressId === a.id ? "border-olive bg-olive/5" : "border-warmgray-200 bg-white hover:bg-cream"}`}>
                          <MapPin className="mt-0.5 h-4 w-4 flex-none text-olive" />
                          <span>
                            <span className="font-semibold text-charcoal">{a.full_name}{a.label ? ` · ${a.label}` : ""}</span>
                            <span className="block text-xs text-warmgray">{a.street}, {a.area}, {a.governorate}</span>
                          </span>
                        </button>
                      ))}
                      <button type="button" onClick={() => setAddressMode("new")} className={`w-full rounded-2xl border border-dashed p-2.5 text-xs font-medium ${addressMode === "new" ? "border-olive text-olive" : "border-warmgray-200 text-warmgray"}`}>
                        + {L(to.checkout.addNewAddress)}
                      </button>
                    </div>
                  </Field>
                )}
                {addressMode === "new" && (
                  <AddressForm form={form} setForm={setForm} L={L} touched={touched} showSave />
                )}
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-warmgray-200/70 bg-white p-3 text-sm">
                  <p className="font-semibold text-charcoal">{storeName}</p>
                  <p className="mt-0.5 flex items-start gap-1 text-xs text-warmgray"><MapPin className="mt-0.5 h-3.5 w-3.5 flex-none" />{storeAddress}</p>
                  <p className="mt-1 text-xs text-olive">{L(to.checkout.readyIn)} ~{cfg.prepMins} {L(to.checkout.minutes)}</p>
                  <a href={mapHref(store.location.lat, store.location.lng, store.name_en)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-olive">
                    <MapPin className="h-3.5 w-3.5" />{L(to.checkout.viewOnMap)}
                  </a>
                </div>
                {/* pickup contact */}
                <Field label={L(to.checkout.fullName)}>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Mariam" />
                </Field>
                <Field label={L(to.checkout.mobile)}>
                  <Input value={form.phone} inputMode="tel" onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+968 9…" />
                </Field>
              </>
            )}
            {touched && !canLeaveDelivery && <p className="text-xs text-terracotta">{L(to.common.required)}</p>}
          </div>
        )}

        {/* STEP 2 — Payment */}
        {step === 2 && (
          <div className="space-y-3">
            <Field label={L(to.checkout.paymentMethod)}>
              <div className="space-y-2">
                {enabledPayments.map((m) => (
                  <PayOption key={m} active={payment === m} onClick={() => setPayment(m)} icon={<Banknote className="h-4 w-4" />} title={L(paymentMethodLabel[m])} />
                ))}
                {/* Card family — visible but disabled until a gateway is connected. */}
                <PayOption disabled icon={<CreditCard className="h-4 w-4" />} title={L(paymentMethodLabel.card)} badge={L(to.checkout.sandbox)} />
              </div>
            </Field>
            <p className="flex items-start gap-1.5 rounded-xl bg-cream p-3 text-xs text-warmgray"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-olive" />{L(to.checkout.cardUnavailable)}</p>
            {touched && !canLeavePayment && <p className="text-xs text-terracotta">{L(to.checkout.choosePayment)}</p>}
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-warmgray-200/70 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-cream">
                  {product.images[0] && <Image src={product.images[0]} alt={name} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-charcoal">{name}</p>
                  <p className="text-xs text-warmgray">
                    {[size, color && (locale === "ar" ? product.colors.find((c) => c.name_en === color)?.name_ar : color)].filter(Boolean).join(" · ")}
                    {size || color ? " · " : ""}×{qty}
                  </p>
                </div>
                <p className="text-sm font-semibold">{money(subtotal)}</p>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-warmgray-200/60 pt-3">
                <SummaryLine k={L(to.checkout.subtotal)} v={money(subtotal)} />
                <SummaryLine k={L(to.checkout.deliveryFee)} v={money(deliveryFee)} />
                {tax > 0 && <SummaryLine k={L(to.checkout.tax)} v={money(tax)} />}
                <SummaryLine k={L(to.checkout.total)} v={money(total)} strong />
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-warmgray-200/70 bg-white p-4 text-sm">
              <Row k={L(to.checkout.method)} v={L({ en: fulfillment === "delivery" ? "Home delivery" : "Pickup from store", ar: fulfillment === "delivery" ? "توصيل للمنزل" : "استلام من المتجر" })} />
              {fulfillment === "delivery" ? (
                <Row k={L(to.checkout.deliverTo)} v={
                  selectedAddress
                    ? `${selectedAddress.full_name} — ${selectedAddress.street}, ${selectedAddress.area}, ${selectedAddress.governorate}`
                    : `${form.full_name} — ${form.street}, ${form.area}, ${form.governorate}`
                } />
              ) : (
                <Row k={L(to.checkout.pickupFrom)} v={`${storeName} — ${storeAddress}`} />
              )}
              <Row k={L(to.checkout.payment)} v={payment ? L(paymentMethodLabel[payment]) : "—"} />
              {note && <Row k={L(to.checkout.note)} v={note} />}
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-charcoal">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-olive" />
              <span>{L(to.checkout.agreeTerms)}</span>
            </label>
            {touched && !agree && <p className="text-xs text-terracotta">{L(to.checkout.mustAgree)}</p>}
            {error && <p className="rounded-xl bg-terracotta/10 p-3 text-sm text-terracotta">{error}</p>}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-warmgray-200/60 bg-ivory/95 p-4 backdrop-blur" dir={rtl ? "rtl" : "ltr"}>
        <div className="mx-auto flex max-w-md items-center gap-2">
          {step > 0 && (
            <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)} className="flex-none">
              {rtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="primary" size="lg" className="flex-1" disabled={submitting} onClick={onPrimary}>
            {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />{L(to.common.processing)}</>) : (
              <>
                {step === 0 ? L(to.checkout.continueToCheckout) : primaryLabel}
                {step < 3 && (rtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </>
            )}
          </Button>
        </div>
        {step >= 1 && (
          <p className="mx-auto mt-2 max-w-md text-center text-xs text-warmgray">{L(to.checkout.total)}: <span className="font-semibold text-charcoal">{money(total)}</span></p>
        )}
      </div>
    </Overlay>
  );
}

// ── small building blocks ────────────────────────────────────────────────────

function Overlay({ children, onClose, title, rtl }: { children: React.ReactNode; onClose: () => void; title: string; rtl: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory" dir={rtl ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-warmgray-200/60 bg-ivory/95 px-4 backdrop-blur">
        <span className="font-display text-lg font-semibold text-charcoal">{title}</span>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-charcoal hover:bg-cream" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-warmgray">{label}</label>
      {children}
    </div>
  );
}

function Chip({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-45 ${active ? "border-charcoal bg-charcoal text-ivory" : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"}`}>
      {children}
    </button>
  );
}

function Option({ active, onClick, icon, title, sub }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-start transition-all ${active ? "border-olive bg-olive/5" : "border-warmgray-200 bg-white hover:bg-cream"}`}>
      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${active ? "text-olive" : "text-charcoal"}`}>{icon}{title}</span>
      <span className="text-xs text-warmgray">{sub}</span>
    </button>
  );
}

function PayOption({ active, disabled, onClick, icon, title, badge }: { active?: boolean; disabled?: boolean; onClick?: () => void; icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-2xl border p-3 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-55 ${active ? "border-olive bg-olive/5" : "border-warmgray-200 bg-white hover:bg-cream"}`}>
      <span className={active ? "text-olive" : "text-charcoal"}>{icon}</span>
      <span className="flex-1 text-start font-medium text-charcoal">{title}</span>
      {badge && <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-warmgray">{badge}</span>}
      {active && <Check className="h-4 w-4 text-olive" />}
    </button>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-warmgray">{k}</span>
      <span className="text-end text-sm text-charcoal">{v}</span>
    </div>
  );
}

function SummaryLine({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "text-sm font-semibold text-charcoal" : "text-sm text-warmgray"}>{k}</span>
      <span className={`tabular-nums ${strong ? "text-base font-semibold text-charcoal" : "text-sm text-charcoal"}`}>{v}</span>
    </div>
  );
}

function AddressForm({ form, setForm, L, touched, showSave }: {
  form: any; setForm: (f: any) => void; L: (o: { en: string; ar: string }) => string; touched: boolean; showSave?: boolean;
}) {
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label={L(to.checkout.fullName)}><Input value={form.full_name} onChange={set("full_name")} /></Field>
        <Field label={L(to.checkout.mobile)}><Input value={form.phone} inputMode="tel" onChange={set("phone")} /></Field>
      </div>
      <Field label={`${L(to.checkout.email)} (${L(to.common.optional)})`}><Input value={form.email} inputMode="email" onChange={set("email")} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={L(to.checkout.governorate)}><Input value={form.governorate} onChange={set("governorate")} /></Field>
        <Field label={L(to.checkout.area)}><Input value={form.area} onChange={set("area")} /></Field>
      </div>
      <Field label={L(to.checkout.street)}><Input value={form.street} onChange={set("street")} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={`${L(to.checkout.landmark)} (${L(to.common.optional)})`}><Input value={form.landmark} onChange={set("landmark")} /></Field>
        <Field label={`${L(to.checkout.instructions)} (${L(to.common.optional)})`}><Input value={form.instructions} onChange={set("instructions")} /></Field>
      </div>
      {showSave && (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" checked={form.save} onChange={(e) => setForm({ ...form, save: e.target.checked })} className="h-4 w-4 accent-olive" />
          {L(to.checkout.saveAddress)}
        </label>
      )}
    </div>
  );
}
