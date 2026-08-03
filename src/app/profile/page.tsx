"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Bell,
  ChevronRight,
  MessageSquare,
  Heart,
  Store as StoreIcon,
  Globe,
  Settings,
  Bookmark,
  Sparkles,
  LogIn,
  LogOut,
  PackageCheck,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservationsStore } from "@/lib/stores/reservations-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useModeStore } from "@/lib/stores/mode-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { useLocale } from "@/lib/hooks/use-locale";
import { productById, storeById } from "@/lib/data";
import { formatCountdown } from "@/lib/utils/relative-time";
import { ResponseTimeBadge } from "@/components/common/ResponseTimeBadge";
import { t } from "@/lib/i18n/translations";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold-50 text-gold-700",
  confirmed: "bg-olive-50 text-olive-700",
  cancelled: "bg-warmgray-100 text-warmgray-700",
  expired: "bg-terracotta/10 text-terracotta",
};

export default function ProfilePage() {
  const router = useRouter();
  const reservations = useReservationsStore((s) => s.items);
  const removeReservation = useReservationsStore((s) => s.remove);
  const conversations = useMessagesStore((s) => s.conversations);
  const openConvo = useMessagesStore((s) => s.openConversation);
  const setMode = useModeStore((s) => s.setMode);
  const authUser = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const favCount = useFavoritesStore((s) => s.ids.length);
  const locale = useLanguageStore((s) => s.locale);
  const { name } = useLocale();

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unread_count ?? 0),
    0,
  );

  const goSeller = () => {
    setMode("seller");
    router.push("/seller");
  };

  return (
    <div className="container-app space-y-6 py-4 sm:py-6">
      <header className="flex items-center gap-3">
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-charcoal text-ivory">
          <User className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-charcoal">
            {authUser?.name || t.profile.greeting[locale]}
          </h1>
          <p className="text-xs text-warmgray">
            {authUser?.identity || t.profile.role[locale]}
          </p>
        </div>
        <button
          aria-label={t.common.notifications[locale]}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal/70 shadow-soft"
        >
          <Bell className="h-4 w-4" />
        </button>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={Bookmark}
          label={t.profile.reservationsStat[locale]}
          value={reservations.length}
        />
        <StatCard icon={Heart} label={t.profile.favoritesStat[locale]} value={favCount} />
        <StatCard icon={MessageSquare} label={t.profile.unreadStat[locale]} value={totalUnread} />
      </div>

      {/* My Reservations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight text-charcoal">
            {t.myReservations.title[locale]}
          </h2>
          {reservations.length > 0 && (
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-charcoal/70">
              {reservations.length}
            </span>
          )}
        </div>

        {reservations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-olive">
              <Bookmark className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-charcoal">
              {t.myReservations.empty[locale]}
            </p>
            <p className="max-w-xs text-xs text-warmgray">
              {t.myReservations.emptyDetail[locale]}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {reservations.map((r) => {
              const product = productById(r.product_id);
              const store = storeById(r.store_id);
              if (!product || !store) return null;
              const statusLabel =
                r.status === "pending"
                  ? t.myReservations.statusPending[locale]
                  : r.status === "confirmed"
                    ? t.myReservations.statusConfirmed[locale]
                    : r.status === "cancelled"
                      ? t.myReservations.statusCancelled[locale]
                      : t.myReservations.statusExpired[locale];
              return (
                <li
                  key={r.id}
                  className="space-y-2.5 rounded-2xl bg-white p-3 shadow-card"
                >
                  <div className="flex gap-3">
                    <Link
                      href={`/product/${product.id}`}
                      className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-cream"
                    >
                      <Image
                        src={product.images[0]}
                        alt={name(product)}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${product.id}`}
                          className="line-clamp-1 text-sm font-semibold text-charcoal hover:text-olive"
                        >
                          {name(product)}
                        </Link>
                        <span
                          className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[r.status]}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-warmgray">{name(store)}</p>
                      <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-charcoal/70">
                        {r.selected_size && (
                          <span className="rounded-full bg-cream px-2 py-0.5">
                            {t.reserve.size[locale]} {r.selected_size}
                          </span>
                        )}
                        {r.selected_color && (
                          <span className="rounded-full bg-cream px-2 py-0.5">
                            {r.selected_color}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-charcoal/70">
                        <Clock className="h-3 w-3" />
                        {formatCountdown(r.expires_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const convo = openConvo({
                          store_id: store.id,
                          product_id: product.id,
                        });
                        router.push(`/messages/${convo.id}`);
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {t.myReservations.messageStore[locale]}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => removeReservation(r.id)}
                    >
                      {t.myReservations.cancel[locale]}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Menu */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-warmgray">
          {t.profile.account[locale]}
        </h2>
        <ul className="overflow-hidden rounded-2xl bg-white shadow-card">
          <MenuItem
            href="/messages"
            icon={MessageSquare}
            label={t.profile.myMessages[locale]}
            badge={totalUnread || undefined}
          />
          <MenuItem href="/favorites" icon={Heart} label={t.nav.favorites[locale]} />
          <MenuItem
            href="/visual-search"
            icon={Sparkles}
            label={t.profile.aiSearch[locale]}
            chip={t.profile.chipNew[locale]}
          />
          <MenuItem
            href="#"
            icon={Globe}
            label={`${t.common.language[locale]} · ${locale === "ar" ? "العربية" : "English"}`}
          />
          <MenuItem href="#" icon={Settings} label={t.common.settings[locale]} />
        </ul>
      </section>

      {/* Seller switch */}
      <section className="rounded-3xl bg-charcoal p-6 text-ivory">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gold-400/20 text-gold-300">
            <StoreIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">
              {t.profile.forSellers[locale]}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold">
              {t.profile.switchSeller[locale]}
            </h3>
            <p className="mt-1 text-sm text-ivory/70">
              {t.profile.switchSellerDesc[locale]}
            </p>
            <button
              onClick={goSeller}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal"
            >
              <LogIn className="h-4 w-4" />
              {t.profile.continueSeller[locale]}
            </button>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <button
        onClick={() => signOut()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-warmgray-200 bg-white py-3 text-sm font-semibold text-terracotta shadow-soft transition-colors hover:bg-cream"
      >
        <LogOut className="h-4 w-4" />
        {locale === "ar" ? "تسجيل الخروج" : "Sign out"}
      </button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1 rounded-2xl bg-white p-3 text-center shadow-card">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-cream text-olive">
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-xl font-semibold text-charcoal">
        {value}
      </p>
      <p className="text-[11px] text-warmgray">{label}</p>
    </div>
  );
}

function MenuItem({
  href,
  icon: Icon,
  label,
  badge,
  chip,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  chip?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 border-b border-warmgray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-cream/40"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-charcoal/80">
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm font-medium text-charcoal">{label}</span>
        {chip && (
          <span className="rounded-full bg-olive/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-olive">
            {chip}
          </span>
        )}
        {badge !== undefined && badge > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-semibold text-ivory">
            {badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-warmgray" />
      </Link>
    </li>
  );
}
