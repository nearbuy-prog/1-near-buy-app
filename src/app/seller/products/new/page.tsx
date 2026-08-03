"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, ImagePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/data";

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "Free"];
const COLOR_PRESETS = [
  { name: "Black", hex: "#1F1F1F" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Ivory", hex: "#FBF8F3" },
  { name: "Sand", hex: "#D7C4A3" },
  { name: "Olive", hex: "#7A8B5C" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Red", hex: "#C84B4B" },
  { name: "Pink", hex: "#E8B6C0" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (val: string, set: typeof setSizes) => {
    set((s) => (s.includes(val) ? s.filter((x) => x !== val) : [...s, val]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => router.push("/seller/products"), 900);
  };

  return (
    <div className="container-app space-y-5 py-4 sm:py-6">
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Manage products
      </Link>

      <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
        Add Product
      </h1>

      {done && (
        <div className="flex items-center gap-2 rounded-2xl bg-olive/10 px-4 py-3 text-sm text-olive">
          <Check className="h-4 w-4" /> Product added (prototype). Redirecting…
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Images */}
        <Field label="Product images">
          <div className="grid grid-cols-4 gap-2">
            {images.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl bg-cream"
                style={{ backgroundImage: `url(${src})`, backgroundSize: "cover" }}
              />
            ))}
            <label
              htmlFor="upl"
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-warmgray-200 text-xs text-warmgray hover:border-olive hover:text-olive"
            >
              <ImagePlus className="h-4 w-4" />
              Add
            </label>
            <input
              id="upl"
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                const urls = files.map((f) => URL.createObjectURL(f));
                setImages((s) => [...s, ...urls]);
              }}
            />
          </div>
        </Field>

        <Field label="Product name">
          <Input placeholder="e.g. Linen Blouse — Sand" required />
        </Field>

        <Field label="Category">
          <select
            required
            defaultValue=""
            className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (OMR)">
            <Input type="number" min="0" step="0.001" placeholder="19.500" required />
          </Field>
          <Field label="Stock quantity">
            <Input type="number" min="0" placeholder="10" />
          </Field>
        </div>

        <Field label="Available sizes">
          <div className="flex flex-wrap gap-1.5">
            {SIZE_PRESETS.map((s) => {
              const on = sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s, setSizes)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                    on
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Available colors">
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => {
              const on = colors.includes(c.name);
              return (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => toggle(c.name, setColors)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                    on
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"
                  }`}
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-warmgray-200"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            placeholder="Tell customers what makes this product special."
            className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm placeholder:text-warmgray focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          />
        </Field>

        <Field label="Store location">
          <Input placeholder="e.g. Avenues Mall, Level 1, Muscat" />
        </Field>

        <Field label="Fulfilment">
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 rounded-full border border-warmgray-200 bg-white px-3 py-1.5 text-xs">
              <input type="checkbox" defaultChecked /> Pickup at store
            </label>
            <label className="flex items-center gap-2 rounded-full border border-warmgray-200 bg-white px-3 py-1.5 text-xs">
              <input type="checkbox" /> Delivery available
            </label>
          </div>
        </Field>

        <div className="sticky bottom-20 -mx-4 border-t border-warmgray-200/60 bg-ivory/95 px-4 py-3 backdrop-blur">
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Save product
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
