"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ImagePlus, MapPin, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModeStore } from "@/lib/stores/mode-store";
import { storeById, categories, cities } from "@/lib/data";
import { RESPONSE_TIME_META } from "@/lib/utils/response-time";
import { getStoreResponseTime } from "@/lib/utils/response-time";

const DAYS: Array<keyof NonNullable<ReturnType<typeof storeById>>["hours"]> = [
  "sat",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
];

export default function SellerStoreProfilePage() {
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const store = storeById(activeStoreId);
  const setActiveStore = useModeStore((s) => s.setActiveStore);
  const [saved, setSaved] = useState(false);
  const [respKey, setRespKey] = useState(store ? getStoreResponseTime(store) : "minutes");

  if (!store) {
    return <p className="container-app py-10 text-sm">No active store.</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="container-app space-y-5 py-4 sm:py-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Store Profile
        </h1>
        <p className="text-xs text-warmgray">
          Manage how customers see your store.
        </p>
      </header>

      <Link
        href="/seller/analytics"
        className="inline-flex w-full items-center justify-between gap-2 rounded-2xl bg-charcoal px-4 py-3 text-sm font-semibold text-ivory shadow-card"
      >
        <span className="inline-flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> View store analytics
        </span>
        →
      </Link>

      {/* Switch which store you're managing — prototype helper */}
      <div className="space-y-1.5 rounded-2xl bg-white p-3 shadow-card">
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-warmgray">
          Active store (prototype)
        </label>
        <select
          value={activeStoreId}
          onChange={(e) => setActiveStore(e.target.value)}
          className="w-full rounded-xl border border-warmgray-200 bg-white px-3 py-2 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
        >
          {storeIdsForPicker().map((id) => (
            <option key={id} value={id}>
              {storeById(id)?.name_en}
            </option>
          ))}
        </select>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Banner + logo */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-card">
          <div className="relative aspect-[16/7] overflow-hidden bg-cream">
            <Image
              src={store.cover}
              alt="banner"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
            <label
              htmlFor="banner-upload"
              className="absolute right-3 top-3 inline-flex cursor-pointer items-center gap-1 rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-semibold text-charcoal shadow-card hover:bg-ivory"
            >
              <ImagePlus className="h-3.5 w-3.5" /> Banner
            </label>
            <input id="banner-upload" type="file" accept="image/*" hidden />
          </div>
          <div className="relative -mt-8 flex items-center gap-3 px-4 pb-4">
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-2xl bg-white ring-4 ring-ivory">
              <Image
                src={store.logo}
                alt="logo"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <label
              htmlFor="logo-upload"
              className="cursor-pointer rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-warmgray-100"
            >
              Change logo
            </label>
            <input id="logo-upload" type="file" accept="image/*" hidden />
          </div>
        </div>

        <Field label="Store name">
          <Input defaultValue={store.name_en} required />
        </Field>

        <Field label="Store category">
          <select
            defaultValue={store.categories[0]}
            className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Store description">
          <textarea
            rows={4}
            defaultValue={store.description_en}
            className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <select
              defaultValue={store.city}
              className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Map pin">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1 rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm hover:bg-cream"
            >
              <MapPin className="h-3.5 w-3.5" />
              Adjust on map
            </button>
          </Field>
        </div>

        <Field label="Address">
          <Input defaultValue={store.address_en} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="WhatsApp number">
            <Input defaultValue={store.whatsapp} />
          </Field>
          <Field label="Phone number">
            <Input defaultValue={store.phone} />
          </Field>
        </div>

        <Field label="Working hours">
          <div className="overflow-hidden rounded-2xl border border-warmgray-200 bg-white">
            {DAYS.map((d) => (
              <div
                key={d}
                className="flex items-center justify-between border-b border-warmgray-100 px-4 py-2 last:border-b-0"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-warmgray">
                  {d}
                </span>
                <input
                  defaultValue={store.hours[d]}
                  className="w-32 rounded-lg border border-warmgray-200 bg-white px-2 py-1 text-right text-xs focus:border-olive focus:outline-none"
                />
              </div>
            ))}
          </div>
        </Field>

        <Field label="Response time badge">
          <select
            value={respKey}
            onChange={(e) => setRespKey(e.target.value as typeof respKey)}
            className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          >
            {Object.entries(RESPONSE_TIME_META).map(([k, m]) => (
              <option key={k} value={k}>
                {m.label_en}
              </option>
            ))}
          </select>
        </Field>

        {saved && (
          <div className="flex items-center gap-2 rounded-2xl bg-olive/10 px-4 py-3 text-sm text-olive">
            <Check className="h-4 w-4" /> Changes saved (prototype).
          </div>
        )}

        <div className="sticky bottom-20 -mx-4 border-t border-warmgray-200/60 bg-ivory/95 px-4 py-3 backdrop-blur">
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-warmgray">
        {label}
      </span>
      {children}
    </label>
  );
}

function storeIdsForPicker() {
  return [
    "store-001",
    "store-002",
    "store-003",
    "store-008",
    "store-022",
    "store-024",
    "store-026",
  ];
}
