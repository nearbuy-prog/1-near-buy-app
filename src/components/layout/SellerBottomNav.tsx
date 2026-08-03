"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  MessageSquare,
  CalendarClock,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMessagesStore } from "@/lib/stores/messages-store";
import { useReservationsStore } from "@/lib/stores/reservations-store";
import { useModeStore } from "@/lib/stores/mode-store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (p: string) => boolean;
  badge?: () => number;
}

export function SellerBottomNav() {
  const pathname = usePathname() || "";
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const conversations = useMessagesStore((s) => s.conversations);
  const reservations = useReservationsStore((s) => s.items);

  const unreadForStore = conversations.reduce(
    (sum, c) =>
      c.store_id === activeStoreId ? sum + (c.unread_count ?? 0) : sum,
    0,
  );

  const pendingForStore = reservations.reduce(
    (sum, r) =>
      r.store_id === activeStoreId && r.status === "pending" ? sum + 1 : sum,
    0,
  );

  const items: NavItem[] = [
    {
      href: "/seller",
      label: "Dashboard",
      icon: LayoutDashboard,
      match: (p) => p === "/seller",
    },
    {
      href: "/seller/products",
      label: "Products",
      icon: Boxes,
      match: (p) => p.startsWith("/seller/products"),
    },
    {
      href: "/seller/reservations",
      label: "Reservations",
      icon: CalendarClock,
      match: (p) => p.startsWith("/seller/reservations"),
      badge: () => pendingForStore,
    },
    {
      href: "/seller/messages",
      label: "Messages",
      icon: MessageSquare,
      match: (p) => p.startsWith("/seller/messages") || p.startsWith("/messages"),
      badge: () => unreadForStore,
    },
    {
      href: "/seller/store",
      label: "Profile",
      icon: Store,
      match: (p) =>
        p.startsWith("/seller/store") || p.startsWith("/seller/analytics"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-warmgray-200/60 bg-ivory/95 backdrop-blur-md safe-bottom">
      <ul className="container-app flex h-16 items-center justify-between">
        {items.map(({ href, label, icon: Icon, match, badge }) => {
          const active = match(pathname);
          const b = badge?.() ?? 0;
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
                {b > 0 && (
                  <span className="absolute right-[28%] top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-ivory">
                    {b > 99 ? "99+" : b}
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
