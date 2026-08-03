"use client";

import { useEffect } from "react";
import { Languages } from "lucide-react";
import { useLanguageStore } from "@/lib/stores/language-store";
import { t } from "@/lib/i18n/translations";

/**
 * Toggle between English and Arabic. Also keeps `<html dir>` and `<html lang>`
 * in sync so the entire page mirrors for RTL when AR is selected.
 */
export function LanguageToggle() {
  const { locale, setLocale } = useLanguageStore();
  const next = locale === "en" ? "ar" : "en";

  // Keep the document direction/language in sync with the store, on mount
  // and on every change (covers hydration after persistence).
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <button
      onClick={() => setLocale(next)}
      aria-label={t.common.changeCity[locale]}
      title={locale === "ar" ? "تغيير اللغة" : "Switch language"}
      className="hidden items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-medium text-charcoal/70 hover:bg-cream sm:inline-flex"
    >
      <Languages className="h-4 w-4" />
      <span className="font-semibold uppercase tracking-wide">
        {locale === "en" ? "EN" : "ع"}
      </span>
    </button>
  );
}
