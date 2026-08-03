"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface HoverGalleryProps {
  images: string[];
  alt: string;
  sizes: string;
  /** ms between auto-advances while hovered. */
  intervalMs?: number;
  /** Adds the same scale-on-hover treatment the rest of the cards use. */
  zoomOnHover?: boolean;
  /** Show small dots underneath while hovering. */
  showDots?: boolean;
  className?: string;
}

/**
 * Image that auto-cycles through additional product photos while hovered.
 * Resets to the first image on mouse leave. No-op on touch devices because
 * mouseenter/mouseleave don't fire on tap.
 */
export function HoverGallery({
  images,
  alt,
  sizes,
  intervalMs = 1400,
  zoomOnHover = true,
  showDots = true,
  className,
}: HoverGalleryProps) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasMultiple = images.length > 1;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onEnter = () => {
    if (!hasMultiple) return;
    setHovered(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
  };

  const onLeave = () => {
    setHovered(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIndex(0);
  };

  return (
    <div
      className={cn("relative h-full w-full", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Pre-load all images stacked so the swap is instant — the front image
          fades on top of the previous one without a flash. */}
      {images.map((src, i) => (
        <Image
          key={src + i}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={i === 0}
          className={cn(
            "object-cover transition-opacity duration-300",
            zoomOnHover &&
              "transition-transform duration-500 group-hover:scale-105",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {showDots && hasMultiple && hovered && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-charcoal/30 px-1.5 py-1 backdrop-blur-sm">
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i === index ? "w-4 bg-ivory" : "w-1 bg-ivory/60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
