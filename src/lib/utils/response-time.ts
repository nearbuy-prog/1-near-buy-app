import type { ResponseTime, Store } from "@/lib/types";

const BUCKETS: ResponseTime[] = [
  "minutes",
  "within-hour",
  "minutes",
  "few-hours",
  "within-hour",
  "minutes",
  "day",
  "within-hour",
  "slow",
];

/**
 * Returns a deterministic response-time bucket for the given store. Falls back
 * to a hash of the store id so we don't have to backfill the seed data — every
 * store gets a stable, plausible reply-time badge.
 */
export function getStoreResponseTime(store: Store): ResponseTime {
  if (store.response_time) return store.response_time;
  let hash = 0;
  for (let i = 0; i < store.id.length; i++) {
    hash = (hash * 31 + store.id.charCodeAt(i)) >>> 0;
  }
  return BUCKETS[hash % BUCKETS.length];
}

export interface ResponseTimeMeta {
  /** Human label, English. */
  label_en: string;
  /** Human label, Arabic. */
  label_ar: string;
  /** Tailwind variant key — drives the badge tone. */
  tone: "fast" | "ok" | "slow";
}

export const RESPONSE_TIME_META: Record<ResponseTime, ResponseTimeMeta> = {
  minutes: {
    label_en: "Usually replies in 5 minutes",
    label_ar: "يرد عادةً خلال 5 دقائق",
    tone: "fast",
  },
  "within-hour": {
    label_en: "Usually replies within 1 hour",
    label_ar: "يرد عادةً خلال ساعة",
    tone: "ok",
  },
  "few-hours": {
    label_en: "Usually replies in a few hours",
    label_ar: "يرد عادةً خلال بضع ساعات",
    tone: "ok",
  },
  day: {
    label_en: "Usually replies within a day",
    label_ar: "يرد عادةً خلال يوم",
    tone: "slow",
  },
  slow: {
    label_en: "Slow response today",
    label_ar: "ردود بطيئة اليوم",
    tone: "slow",
  },
};
