"use client";

import { useLanguageStore } from "@/lib/stores/language-store";
import type { Locale } from "@/lib/types";

interface BilingualField {
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  address_en?: string;
  address_ar?: string;
  comment_en?: string;
  comment_ar?: string;
}

/**
 * Hook to read the current locale and pull the right field from a bilingual
 * record. Falls back to English if Arabic is missing.
 */
export function useLocale() {
  const locale = useLanguageStore((s) => s.locale);

  function name(o: BilingualField): string {
    return locale === "ar" ? o.name_ar || o.name_en || "" : o.name_en || "";
  }
  function description(o: BilingualField): string {
    return locale === "ar"
      ? o.description_ar || o.description_en || ""
      : o.description_en || "";
  }
  function address(o: BilingualField): string {
    return locale === "ar"
      ? o.address_ar || o.address_en || ""
      : o.address_en || "";
  }
  function comment(o: BilingualField): string {
    return locale === "ar"
      ? o.comment_ar || o.comment_en || ""
      : o.comment_en || "";
  }

  return { locale, name, description, address, comment };
}

export type UseLocaleReturn = ReturnType<typeof useLocale>;
export type { Locale };
