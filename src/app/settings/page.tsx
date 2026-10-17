"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, Globe, Info, MapPin, Bell, Store as StoreIcon,
  LogOut, Trash2, UserCog,
} from "lucide-react";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useCityStore } from "@/lib/stores/city-store";
import { useModeStore } from "@/lib/stores/mode-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { cities } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { t } from "@/lib/i18n/translations";

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);
  const city = useCityStore((s) => s.city);
  const setCity = useCityStore((s) => s.setCity);
  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const notificationsEnabled = usePreferencesStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = usePreferencesStore((s) => s.setNotificationsEnabled);
  const [confirmClear, setConfirmClear] = useState(false);

  const L = (o: { en: string; ar: string }) => o[locale];
  const languages: { code: Locale; label: string }[] = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  const clearData = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("nearby:"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
    window.location.href = "/";
  };

  return (
    <div className="container-app space-y-6 py-4 sm:py-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Link href="/profile" className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal">
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {L({ en: "Back to profile", ar: "العودة للملف الشخصي" })}
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal">{t.common.settings[locale]}</h1>

      {/* Language */}
      <Section icon={<Globe className="h-3.5 w-3.5" />} title={t.common.language[locale]}>
        {languages.map((lng, i) => (
          <SelectRow key={lng.code} label={lng.label} active={locale === lng.code} first={i === 0}
            onClick={() => setLocale(lng.code)} />
        ))}
      </Section>

      {/* City */}
      <Section
        icon={<MapPin className="h-3.5 w-3.5" />}
        title={L({ en: "Your city", ar: "مدينتك" })}
        note={L({ en: "Products and stores are shown for the city you pick.", ar: "تُعرض المنتجات والمتاجر حسب المدينة التي تختارها." })}
      >
        {cities.map((c, i) => (
          <SelectRow key={c.id} label={locale === "ar" ? c.name_ar : c.name_en} active={city === c.id}
            first={i === 0} onClick={() => setCity(c.id)} />
        ))}
      </Section>

      {/* Notifications */}
      <Section
        icon={<Bell className="h-3.5 w-3.5" />}
        title={L({ en: "Notifications", ar: "الإشعارات" })}
        note={L({ en: "Order placed, accepted, ready, out for delivery and more.", ar: "إنشاء الطلب، القبول، الجاهزية، الخروج للتوصيل والمزيد." })}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex-1 text-sm font-medium text-charcoal">
            {L({ en: "Order & status updates", ar: "تحديثات الطلبات والحالة" })}
          </span>
          <Toggle on={notificationsEnabled} onClick={() => setNotificationsEnabled(!notificationsEnabled)} />
        </div>
      </Section>

      {/* Account */}
      <Section icon={<UserCog className="h-3.5 w-3.5" />} title={L({ en: "Account", ar: "الحساب" })}>
        {user?.identity && (
          <div className="flex items-center gap-3 border-b border-warmgray-100 px-4 py-3.5">
            <span className="flex-1 text-sm text-warmgray">{L({ en: "Signed in as", ar: "مسجّل الدخول باسم" })}</span>
            <span className="text-sm font-medium text-charcoal">{user.identity}</span>
          </div>
        )}
        <ActionRow
          icon={<StoreIcon className="h-4 w-4" />}
          label={mode === "seller" ? L({ en: "Switch to customer mode", ar: "التبديل لوضع العميل" }) : L({ en: "Switch to seller mode", ar: "التبديل لوضع البائع" })}
          onClick={() => { if (mode === "seller") { setMode("customer"); router.push("/"); } else { setMode("seller"); router.push("/seller"); } }}
          first
        />
        <ActionRow
          icon={<LogOut className="h-4 w-4" />}
          label={L({ en: "Sign out", ar: "تسجيل الخروج" })}
          onClick={() => signOut()}
          danger
        />
      </Section>

      {/* Data & privacy */}
      <Section
        icon={<Trash2 className="h-3.5 w-3.5" />}
        title={L({ en: "Data & privacy", ar: "البيانات والخصوصية" })}
        note={L({ en: "Everything is stored only on this device. Clearing resets the app.", ar: "تُحفظ جميع البيانات على هذا الجهاز فقط. المسح يعيد ضبط التطبيق." })}
      >
        <ActionRow
          icon={<Trash2 className="h-4 w-4" />}
          label={confirmClear ? L({ en: "Tap again to confirm", ar: "اضغط مرة أخرى للتأكيد" }) : L({ en: "Clear app data", ar: "مسح بيانات التطبيق" })}
          onClick={() => (confirmClear ? clearData() : setConfirmClear(true))}
          danger
          first
        />
      </Section>

      {/* About */}
      <Section icon={<Info className="h-3.5 w-3.5" />} title={L({ en: "About", ar: "حول التطبيق" })}>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm font-medium text-charcoal">{t.brand.name[locale]}</span>
          <span className="text-xs text-warmgray">{L({ en: "Prototype · v1.0", ar: "نموذج أولي · الإصدار ١٫٠" })}</span>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, note, children }: { icon: React.ReactNode; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warmgray">
        {icon} {title}
      </h2>
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">{children}</div>
      {note && <p className="px-1 text-xs text-warmgray">{note}</p>}
    </section>
  );
}

function SelectRow({ label, active, onClick, first }: { label: string; active: boolean; onClick: () => void; first?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-cream/40 ${first ? "" : "border-t border-warmgray-100"}`}
    >
      <span className="flex-1 text-sm font-medium text-charcoal">{label}</span>
      {active && <Check className="h-4 w-4 text-olive" />}
    </button>
  );
}

function ActionRow({ icon, label, onClick, first, danger }: { icon: React.ReactNode; label: string; onClick: () => void; first?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-cream/40 ${first ? "" : "border-t border-warmgray-100"}`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${danger ? "bg-terracotta/10 text-terracotta" : "bg-cream text-charcoal/80"}`}>
        {icon}
      </span>
      <span className={`flex-1 text-sm font-medium ${danger ? "text-terracotta" : "text-charcoal"}`}>{label}</span>
    </button>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-6 w-11 flex-none rounded-full transition-colors ${on ? "bg-olive" : "bg-warmgray-200"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform start-0.5 ${on ? "translate-x-5 rtl:-translate-x-5" : ""}`}
      />
    </button>
  );
}
