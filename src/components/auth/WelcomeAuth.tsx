"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Store,
  Phone,
  Mail,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/Logo";
import { useAuthStore, type AuthMethod } from "@/lib/stores/auth-store";
import { useModeStore } from "@/lib/stores/mode-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import type { AppMode } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Localised copy — kept in one place so the screen reads cleanly in EN + AR.
// ---------------------------------------------------------------------------

const L = {
  en: {
    tagline: "Your city's shops, in one place.",
    sub: "Discover and reserve from real stores near you across Oman.",
    shopper: "Shop",
    shopperHint: "Browse & reserve",
    seller: "Sell",
    sellerHint: "List your store",
    signinTitle: "Welcome back",
    signupTitle: "Create your account",
    signinTitleSeller: "Sign in to your store",
    signupTitleSeller: "Set up your store",
    phone: "Phone",
    email: "Email",
    fullName: "Full name",
    storeName: "Store name",
    phonePlaceholder: "9XXX XXXX",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Password",
    namePlaceholder: "e.g. Salim Al Hinai",
    storePlaceholder: "e.g. Dar Al Anaqa",
    cont: "Continue",
    orWith: "or continue with",
    google: "Continue with Google",
    apple: "Continue with Apple",
    haveAccount: "Already have an account?",
    noAccount: "New to SOUBAK?",
    signin: "Sign in",
    signup: "Create account",
    terms: "By continuing you agree to our Terms & Privacy Policy.",
    verifyTitle: "Verify your number",
    verifySent: "We sent a 6-digit code to",
    verify: "Verify",
    resend: "Resend code",
    back: "Back",
    secure: "Your details are kept private",
  },
  ar: {
    tagline: "متاجر مدينتك في مكان واحد.",
    sub: "اكتشف واحجز من متاجر حقيقية قريبة منك في عُمان.",
    shopper: "تسوّق",
    shopperHint: "تصفّح واحجز",
    seller: "بِع",
    sellerHint: "أضف متجرك",
    signinTitle: "مرحباً بعودتك",
    signupTitle: "أنشئ حسابك",
    signinTitleSeller: "سجّل دخول متجرك",
    signupTitleSeller: "جهّز متجرك",
    phone: "الهاتف",
    email: "البريد",
    fullName: "الاسم الكامل",
    storeName: "اسم المتجر",
    phonePlaceholder: "9XXX XXXX",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "كلمة المرور",
    namePlaceholder: "مثال: سالم الهنائي",
    storePlaceholder: "مثال: دار الأناقة",
    cont: "متابعة",
    orWith: "أو تابع عبر",
    google: "المتابعة عبر Google",
    apple: "المتابعة عبر Apple",
    haveAccount: "لديك حساب بالفعل؟",
    noAccount: "جديد على صوبك؟",
    signin: "تسجيل الدخول",
    signup: "إنشاء حساب",
    terms: "بالمتابعة فإنك توافق على الشروط وسياسة الخصوصية.",
    verifyTitle: "تأكيد رقمك",
    verifySent: "أرسلنا رمزاً من 6 أرقام إلى",
    verify: "تأكيد",
    resend: "إعادة إرسال الرمز",
    back: "رجوع",
    secure: "بياناتك محفوظة وخاصة",
  },
} as const;

type AuthModeTab = "signin" | "signup";
type Method = "phone" | "email";

export function WelcomeAuth() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const setMode = useModeStore((s) => s.setMode);
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);
  const t = L[locale === "ar" ? "ar" : "en"];
  const rtl = locale === "ar";

  const [account, setAccount] = useState<AppMode>("customer");
  const [tab, setTab] = useState<AuthModeTab>("signup");
  const [method, setMethod] = useState<Method>("phone");
  const [step, setStep] = useState<"form" | "otp">("form");

  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSeller = account === "seller";
  const isSignup = tab === "signup";

  const phoneDigits = phone.replace(/\D/g, "");
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canContinue = useMemo(() => {
    if (isSignup && name.trim().length < 2) return false;
    if (isSignup && isSeller && storeName.trim().length < 2) return false;
    if (method === "phone") return phoneDigits.length >= 8;
    return emailValid && password.length >= 6;
  }, [
    isSignup,
    isSeller,
    name,
    storeName,
    method,
    phoneDigits,
    emailValid,
    password,
  ]);

  function finalize(usedMethod: AuthMethod) {
    const identity =
      usedMethod === "phone"
        ? `+968 ${phone.trim()}`
        : usedMethod === "email"
          ? email.trim()
          : usedMethod === "google"
            ? "Google account"
            : "Apple account";
    signIn({
      accountType: account,
      method: usedMethod,
      identity,
      name: name.trim() || undefined,
    });
    setMode(account);
    router.push(isSeller ? "/seller" : "/");
  }

  function handleContinue() {
    if (method === "phone") {
      setStep("otp");
    } else {
      finalize("email");
    }
  }

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="relative flex min-h-screen flex-col overflow-hidden bg-ivory"
    >
      {/* Soft decorative background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-olive-50 via-cream to-ivory" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-olive-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-gold-100/40 blur-3xl" />

      {/* Language toggle */}
      <div className="relative z-10 flex justify-end px-5 pt-5">
        <button
          type="button"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="rounded-full border border-warmgray-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-charcoal/70 backdrop-blur hover:bg-white"
        >
          {locale === "ar" ? "English" : "العربية"}
        </button>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10">
        {/* Brand + tagline */}
        <div className="mt-6 text-center">
          <div dir="ltr" className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-charcoal">
            {t.tagline}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-warmgray">{t.sub}</p>
        </div>

        {step === "form" ? (
          <div className="mt-7 rounded-3xl border border-warmgray-200/60 bg-white p-5 shadow-card sm:p-6">
            {/* Account type segmented control */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-cream p-1.5">
              {(
                [
                  { id: "customer", label: t.shopper, hint: t.shopperHint, Icon: ShoppingBag },
                  { id: "seller", label: t.seller, hint: t.sellerHint, Icon: Store },
                ] as const
              ).map(({ id, label, hint, Icon }) => {
                const active = account === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAccount(id)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2.5 text-center transition-all",
                      active
                        ? "bg-white shadow-soft ring-1 ring-olive/30"
                        : "text-charcoal/60 hover:text-charcoal",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-olive" : "text-warmgray",
                        )}
                      />
                      {label}
                    </span>
                    <span className="text-[11px] text-warmgray">{hint}</span>
                  </button>
                );
              })}
            </div>

            {/* Heading */}
            <h2 className="mt-5 font-display text-xl font-semibold text-charcoal">
              {isSeller
                ? isSignup
                  ? t.signupTitleSeller
                  : t.signinTitleSeller
                : isSignup
                  ? t.signupTitle
                  : t.signinTitle}
            </h2>

            {/* Method tabs */}
            <div className="mt-4 flex gap-1 rounded-full bg-cream p-1 text-sm">
              {(
                [
                  { id: "phone", label: t.phone, Icon: Phone },
                  { id: "email", label: t.email, Icon: Mail },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 font-medium transition-all",
                    method === id
                      ? "bg-white text-charcoal shadow-soft"
                      : "text-charcoal/55 hover:text-charcoal",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="mt-4 space-y-3">
              {isSignup && (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  aria-label={t.fullName}
                />
              )}
              {isSignup && isSeller && (
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={t.storePlaceholder}
                  aria-label={t.storeName}
                />
              )}

              {method === "phone" ? (
                <div className="flex items-stretch gap-2">
                  <span className="inline-flex select-none items-center gap-1 rounded-full border border-warmgray-200 bg-cream px-3 text-sm font-medium text-charcoal">
                    <span aria-hidden>🇴🇲</span> +968
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))}
                    placeholder={t.phonePlaceholder}
                    aria-label={t.phone}
                    className="flex-1"
                    dir="ltr"
                  />
                </div>
              ) : (
                <>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    aria-label={t.email}
                    dir="ltr"
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    aria-label={t.passwordPlaceholder}
                    dir="ltr"
                  />
                </>
              )}
            </div>

            {/* Primary continue — always clickable; styling softens when the
                form isn't complete yet, but we never block the prototype flow. */}
            <Button
              variant="primary"
              size="lg"
              className={cn("mt-4 w-full", !canContinue && "opacity-70")}
              onClick={handleContinue}
            >
              {t.cont}
              <ArrowRight className={cn("h-4 w-4", rtl && "rotate-180")} />
            </Button>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-warmgray-200/70" />
              <span className="text-[11px] uppercase tracking-wide text-warmgray">
                {t.orWith}
              </span>
              <span className="h-px flex-1 bg-warmgray-200/70" />
            </div>

            {/* Social */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => finalize("google")}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-warmgray-200 bg-white text-sm font-medium text-charcoal transition-colors hover:bg-cream"
              >
                <GoogleIcon />
                {t.google}
              </button>
              <button
                type="button"
                onClick={() => finalize("apple")}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-charcoal/90"
              >
                <AppleIcon />
                {t.apple}
              </button>
            </div>

            {/* Switch sign in / sign up */}
            <p className="mt-5 text-center text-sm text-warmgray">
              {isSignup ? t.haveAccount : t.noAccount}{" "}
              <button
                type="button"
                onClick={() => setTab(isSignup ? "signin" : "signup")}
                className="font-semibold text-olive hover:underline"
              >
                {isSignup ? t.signin : t.signup}
              </button>
            </p>
          </div>
        ) : (
          <OtpStep
            t={t}
            rtl={rtl}
            phone={`+968 ${phone.trim()}`}
            onBack={() => setStep("form")}
            onVerify={() => finalize("phone")}
          />
        )}

        {/* Footer */}
        <div className="mt-auto pt-6 text-center">
          <p className="inline-flex items-center justify-center gap-1.5 text-[11px] text-warmgray">
            <ShieldCheck className="h-3.5 w-3.5 text-olive" />
            {t.secure}
          </p>
          <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-warmgray/80">
            {t.terms}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OTP step
// ---------------------------------------------------------------------------

function OtpStep({
  t,
  rtl,
  phone,
  onBack,
  onVerify,
}: {
  t: (typeof L)[keyof typeof L];
  rtl: boolean;
  phone: string;
  onBack: () => void;
  onVerify: () => void;
}) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const complete = code.every((d) => d !== "");

  function setDigit(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="mt-7 rounded-3xl border border-warmgray-200/60 bg-white p-5 shadow-card sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
      >
        <ChevronLeft className={cn("h-4 w-4", rtl && "rotate-180")} />
        {t.back}
      </button>

      <h2 className="font-display text-xl font-semibold text-charcoal">
        {t.verifyTitle}
      </h2>
      <p className="mt-1 text-sm text-warmgray">
        {t.verifySent}{" "}
        <span dir="ltr" className="font-medium text-charcoal">
          {phone}
        </span>
      </p>

      <div dir="ltr" className="mt-5 flex justify-between gap-2">
        {code.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            className="h-12 w-full rounded-xl border border-warmgray-200 bg-white text-center text-lg font-semibold text-charcoal focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          />
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="mt-5 w-full"
        disabled={!complete}
        onClick={onVerify}
      >
        <Check className="h-4 w-4" />
        {t.verify}
      </Button>

      <button
        type="button"
        onClick={() => setCode(Array(6).fill(""))}
        className="mt-4 block w-full text-center text-sm font-medium text-olive hover:underline"
      >
        {t.resend}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brand icons
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.37 12.78c.02 2.46 2.16 3.28 2.18 3.29-.02.06-.34 1.17-1.13 2.32-.68 1-1.39 1.99-2.5 2.01-1.1.02-1.45-.65-2.7-.65-1.26 0-1.65.63-2.69.67-1.08.04-1.9-1.08-2.58-2.08-1.4-2.03-2.47-5.74-1.03-8.25.71-1.24 1.99-2.03 3.38-2.05 1.06-.02 2.06.71 2.7.71.65 0 1.86-.88 3.14-.75.53.02 2.03.21 2.99 1.62-.08.05-1.79 1.04-1.76 3.11ZM14.4 4.6c.57-.69.95-1.65.85-2.6-.82.03-1.81.55-2.4 1.23-.53.61-.99 1.58-.86 2.51.91.07 1.84-.46 2.41-1.14Z" />
    </svg>
  );
}
