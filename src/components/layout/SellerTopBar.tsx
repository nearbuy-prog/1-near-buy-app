"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, BellRing } from "lucide-react";
import { useModeStore } from "@/lib/stores/mode-store";
import { storeById } from "@/lib/data";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export function SellerTopBar() {
  const router = useRouter();
  const activeStoreId = useModeStore((s) => s.activeStoreId);
  const setMode = useModeStore((s) => s.setMode);
  const store = storeById(activeStoreId);

  const switchToCustomer = () => {
    setMode("customer");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-warmgray-200/60 bg-ivory/85 backdrop-blur-md">
      <div className="container-app flex h-14 items-center justify-between gap-3 safe-top">
        <Link href="/seller" className="flex min-w-0 items-center gap-2.5">
          {store?.logo && (
            <span className="relative h-8 w-8 flex-none overflow-hidden rounded-full bg-cream ring-1 ring-warmgray-200/60">
              <Image
                src={store.logo}
                alt={store.name_en}
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
          )}
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-olive">
              Seller mode
            </p>
            <p className="line-clamp-1 text-sm font-semibold text-charcoal">
              {store?.name_en ?? "Your store"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <button
            aria-label="Notifications"
            className="relative inline-flex items-center justify-center rounded-full p-2.5 text-charcoal/70 transition-colors hover:bg-cream"
          >
            <BellRing className="h-5 w-5" />
          </button>
          <button
            onClick={switchToCustomer}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-warmgray-100"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Customer
          </button>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
