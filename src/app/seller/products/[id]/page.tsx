"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, productById } from "@/lib/data";

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "Free"];

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const product = productById(params.id);
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes.map((s) => String(s)) ?? [],
  );

  if (!product) notFound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => router.push("/seller/products"), 800);
  };

  return (
    <div className="container-app space-y-5 py-4 sm:py-6">
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Manage products
      </Link>

      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-warmgray">
          Editing
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          {product.name_en}
        </h1>
      </header>

      {done && (
        <div className="flex items-center gap-2 rounded-2xl bg-olive/10 px-4 py-3 text-sm text-olive">
          <Check className="h-4 w-4" /> Saved (prototype). Redirecting…
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-2">
          {product.images.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl bg-cream"
            >
              <Image
                src={src}
                alt={`image ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ))}
          <label
            htmlFor="upl-edit"
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-warmgray-200 text-xs text-warmgray hover:border-olive hover:text-olive"
          >
            <ImagePlus className="h-4 w-4" />
            Add
          </label>
          <input id="upl-edit" type="file" accept="image/*" multiple hidden />
        </div>

        <Field label="Product name">
          <Input defaultValue={product.name_en} required />
        </Field>

        <Field label="Category">
          <select
            defaultValue={product.category}
            className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (OMR)">
            <Input
              type="number"
              min="0"
              step="0.001"
              defaultValue={product.price}
              required
            />
          </Field>
          <Field label="Stock status">
            <select
              defaultValue={product.in_stock ? "in" : "out"}
              className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
            >
              <option value="in">In stock</option>
              <option value="low">Only 2 left</option>
              <option value="out">Out of stock</option>
            </select>
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
                  onClick={() =>
                    setSizes((p) =>
                      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
                    )
                  }
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

        <Field label="Description">
          <textarea
            rows={4}
            defaultValue={product.description_en}
            className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm placeholder:text-warmgray focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          />
        </Field>

        <div className="sticky bottom-20 -mx-4 flex gap-2 border-t border-warmgray-200/60 bg-ivory/95 px-4 py-3 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-none"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button type="submit" variant="primary" size="lg" className="flex-1">
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
