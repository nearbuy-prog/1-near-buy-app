"use client";

import { Clock } from "lucide-react";
import type { Store } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { getStoreResponseTime, RESPONSE_TIME_META } from "@/lib/utils/response-time";
import { useLanguageStore } from "@/lib/stores/language-store";

interface ResponseTimeBadgeProps {
  store: Store;
  /** xs (chip) | sm (label) | md (with icon and full label). */
  size?: "xs" | "sm" | "md";
  className?: string;
}

const TONE_CLASSES: Record<"fast" | "ok" | "slow", string> = {
  fast: "bg-olive-50 text-olive-700 ring-olive-100",
  ok: "bg-gold-50 text-gold-700 ring-gold-100",
  slow: "bg-warmgray-100 text-warmgray-700 ring-warmgray-200",
};

const SIZE_CLASSES = {
  xs: "px-1.5 py-0.5 text-[10px] gap-1",
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

const ICON_SIZE = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
};

export function ResponseTimeBadge({
  store,
  size = "sm",
  className,
}: ResponseTimeBadgeProps) {
  const rt = getStoreResponseTime(store);
  const meta = RESPONSE_TIME_META[rt];
  const locale = useLanguageStore((s) => s.locale);
  const label = locale === "ar" ? meta.label_ar : meta.label_en;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
        TONE_CLASSES[meta.tone],
        SIZE_CLASSES[size],
        className,
      )}
      title={label}
    >
      <Clock className={ICON_SIZE[size]} />
      {label}
    </span>
  );
}
