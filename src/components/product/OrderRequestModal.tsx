"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, ProductColor, ProductSize, Store } from "@/lib/types";
import { formatOMR } from "@/lib/utils/currency";
import { whatsappProductHref } from "@/lib/utils/contact";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z
    .string()
    .min(8, "Please enter a valid phone number")
    .regex(/^[\d+\s\-()]+$/, "Only digits, spaces, +, -, () allowed"),
  size: z.string().optional(),
  color: z.string().optional(),
  notes: z.string().max(280).optional(),
});

type FormValues = z.infer<typeof schema>;

interface OrderRequestModalProps {
  product: Product;
  store: Store;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderRequestModal({
  product,
  store,
  open,
  onOpenChange,
}: OrderRequestModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [size, setSize] = useState<ProductSize | undefined>(product.sizes[0]);
  const [color, setColor] = useState<ProductColor | undefined>(product.colors[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: { name: "", phone: "", notes: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;

    setSubmitting(true);
    // In Phase 2 this will POST to /api/orders → Supabase. For v1 we pretend
    // the request was sent and pivot users to WhatsApp where the actual
    // conversation happens with the store.
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
  };

  const reopen = () => {
    setSubmitted(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) setTimeout(reopen, 300);
    }}>
      <DialogContent className="max-w-md">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sage">
              <Check className="h-7 w-7" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-center font-display text-xl">
                Order request sent
              </DialogTitle>
              <DialogDescription className="text-center">
                {store.name_en} will contact you shortly. To confirm faster, message
                them on WhatsApp now.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="!flex-col gap-2">
              <a
                href={whatsappProductHref(store, product)}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button variant="whatsapp" size="lg" className="w-full">
                  Open WhatsApp
                </Button>
              </a>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Request this item
              </DialogTitle>
              <DialogDescription>
                Send a short request to {store.name_en}. They&apos;ll confirm
                availability and arrange pickup or delivery.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 flex items-center justify-between rounded-xl bg-cream p-3">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold">
                  {product.name_en}
                </p>
                <p className="text-xs text-warmgray">{store.name_en}</p>
              </div>
              <p className="font-semibold">{formatOMR(product.price)}</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3"
              noValidate
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal">
                  Your name
                </label>
                <Input
                  {...register("name", { required: true, minLength: 2 })}
                  placeholder="e.g. Mariam"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-terracotta">
                    {String(errors.name.message ?? "Name required")}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal">
                  Phone (with country code)
                </label>
                <Input
                  {...register("phone", { required: true })}
                  placeholder="+968 9..."
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-terracotta">
                    {String(errors.phone.message ?? "Phone required")}
                  </p>
                )}
              </div>

              {product.sizes.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((s) => (
                      <button
                        key={String(s)}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                          size === s
                            ? "border-charcoal bg-charcoal text-ivory"
                            : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name_en}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                          color?.name_en === c.name_en
                            ? "border-charcoal bg-charcoal text-ivory"
                            : "border-warmgray-200 bg-white text-charcoal hover:bg-cream"
                        }`}
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-warmgray-200"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name_en}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal">
                  Notes (optional)
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Any specific requirements, gift wrapping, alterations…"
                  className="w-full rounded-2xl border border-warmgray-200 bg-white px-4 py-3 text-sm placeholder:text-warmgray focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
                />
              </div>

              <DialogFooter className="!flex-col gap-2 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending request…
                    </>
                  ) : (
                    "Send request"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
