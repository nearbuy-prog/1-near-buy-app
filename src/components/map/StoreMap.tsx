"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { StoreMap as StoreMapImpl } from "./StoreMapImpl";

export type { MapMarker } from "./StoreMapImpl";

/**
 * Public StoreMap. Leaflet touches `window` at import time, so we load the
 * real implementation only on the client via next/dynamic. Server-rendered
 * markup is a clean placeholder that occupies the same space, preventing
 * layout shift when the map hydrates.
 */
const StoreMapDynamic = dynamic(
  () => import("./StoreMapImpl").then((m) => m.StoreMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

export function StoreMap(props: ComponentProps<typeof StoreMapImpl>) {
  return <StoreMapDynamic {...props} />;
}

function MapSkeleton() {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-cream",
      )}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(122,139,92,0.18) 0, transparent 60%), radial-gradient(circle at 70% 70%, rgba(201,169,97,0.15) 0, transparent 60%)",
        }}
      />
      <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-charcoal/70 shadow-soft">
        <MapPin className="h-3.5 w-3.5" />
        Loading map…
      </div>
    </div>
  );
}
