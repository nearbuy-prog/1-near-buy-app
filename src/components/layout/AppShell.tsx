"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SellerBottomNav } from "@/components/layout/SellerBottomNav";
import { SellerTopBar } from "@/components/layout/SellerTopBar";

/**
 * Picks the right top + bottom chrome depending on whether the user is in
 * customer or seller mode. Driven by the URL prefix `/seller/*` so that
 * deep-linking into seller works without reading from zustand on the server.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const seller = pathname.startsWith("/seller");

  return (
    <div className="flex min-h-screen flex-col">
      {seller ? <SellerTopBar /> : <TopBar />}
      <main className="flex-1 pb-24">{children}</main>
      {seller ? <SellerBottomNav /> : <BottomNav />}
    </div>
  );
}
