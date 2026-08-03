"use client";

import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { cn } from "@/lib/utils/cn";

interface FavoriteButtonProps {
  productId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Floating variant for product cards (white pill in the corner). */
  floating?: boolean;
}

export function FavoriteButton({
  productId,
  size = "md",
  className,
  floating = false,
}: FavoriteButtonProps) {
  const ids = useFavoritesStore((s) => s.ids);
  const toggle = useFavoritesStore((s) => s.toggle);
  const active = ids.includes(productId);

  const sizes = {
    sm: { btn: "h-8 w-8", icon: "h-4 w-4" },
    md: { btn: "h-10 w-10", icon: "h-5 w-5" },
    lg: { btn: "h-11 w-11", icon: "h-5 w-5" },
  }[size];

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all active:scale-90",
        sizes.btn,
        floating
          ? "bg-white/90 shadow-soft backdrop-blur-sm hover:bg-white"
          : "hover:bg-cream",
        className,
      )}
    >
      <Heart
        className={cn(
          sizes.icon,
          "transition-colors",
          active ? "fill-terracotta text-terracotta" : "text-charcoal/70",
        )}
      />
    </button>
  );
}
