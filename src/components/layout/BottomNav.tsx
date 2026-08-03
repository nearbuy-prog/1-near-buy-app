"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useLanguageStore } from "@/lib/stores/language-store";
import { t } from "@/lib/i18n/translations";

interface NavItem {
  href: string;
  key: "home" | "search" | "messages" | "favorites" | "profile";
  icon: React.ComponentType<{ className?: string }>;
  match?: (path: string) => boolean;
}

const items: NavItem[] = [
  { href: "/", key: "home", icon: Home, match: (p) => p === "/" },
  {
    href: "/search",
    key: "search",
    icon: Search,
    match: (p) =>
      p.startsWith("/search") ||
      p.startsWith("/category") ||
      p.startsWith("/map"),
  },
  {
    href: "/messages",
    key: "messages",
    icon: MessageSquare,
    match: (p) => p.startsWith("/messages"),
  },
  {
    href: "/favorites",
    key: "favorites",
    icon: Heart,
    match: (p) => p.startsWith("/favorites"),
  },
  {
    href: "/profile",
    key: "profile",
    icon: User,
    match: (p) => p.startsWith("/profile") || p.startsWith("/admin"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLanguageStore((s) => s.locale);
  const favCount = useFavoritesStore((s) => s.ids.length);
  const unread = useMessagesStore((s) =>
    s.conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-warmgray-200/60 bg-ivory/95 backdrop-blur-md safe-bottom">
      <ul className="container-app flex h-16 items-center justify-between">
        {items.map(({ href, key, icon: Icon, match }) => {
          const active = match
            ? match(pathname || "")
            : (pathname || "").startsWith(href);
          const label = t.nav[key][locale];
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-charcoal" : "text-charcoal/55",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    active && "bg-charcoal text-ivory",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span>{label}</span>
                {key === "favorites" && favCount > 0 && !active && (
                  <span className="absolute right-[28%] top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-ivory">
                    {favCount > 99 ? "99+" : favCount}
                  </span>
                )}
                {key === "messages" && unread > 0 && !active && (
                  <span className="absolute right-[28%] top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-ivory">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
