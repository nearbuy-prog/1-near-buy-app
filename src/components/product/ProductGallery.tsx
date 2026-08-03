"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Badge } from "@/components/ui/badge";

interface ProductGalleryProps {
  productId: string;
  images: string[];
  alt: string;
  badges?: React.ReactNode;
}

export function ProductGallery({
  productId,
  images,
  alt,
  badges,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // When the image set changes (e.g. the shopper picks a different colour),
  // jump back to the first photo so we never point past the new array.
  const imagesKey = images.join("|");
  useEffect(() => {
    setActive(0);
  }, [imagesKey]);

  const go = useCallback(
    (dir: number) =>
      setActive((a) => (a + dir + images.length) % images.length),
    [images.length],
  );

  // Keyboard controls + scroll lock while the full-screen viewer is open.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, go]);

  if (!images.length) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-cream sm:aspect-square">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 50vw"
          className="cursor-zoom-in object-cover"
          onClick={() => setLightbox(true)}
        />
        {badges && (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {badges}
          </div>
        )}
        <FavoriteButton
          productId={productId}
          floating
          size="lg"
          className="absolute right-3 top-3"
        />
        {/* Tap-to-zoom hint */}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="View full screen"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/45 text-ivory backdrop-blur-sm transition-colors hover:bg-charcoal/70"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-6 bg-charcoal" : "w-1.5 bg-charcoal/30",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "relative h-16 w-16 flex-none overflow-hidden rounded-xl border-2 transition-all",
                i === active ? "border-charcoal" : "border-transparent opacity-70",
              )}
            >
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-screen viewer */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-charcoal/95 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <div
            className="flex items-center justify-between px-4 py-4 text-ivory"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm font-medium tabular-nums text-ivory/80">
              {images.length > 1 ? `${active + 1} / ${images.length}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-ivory transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              src={images[active]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-ivory transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-ivory transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div
              className="flex justify-center gap-2 px-4 pb-6 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={cn(
                    "relative h-14 w-14 flex-none overflow-hidden rounded-lg border-2 transition-all",
                    i === active
                      ? "border-ivory"
                      : "border-transparent opacity-50 hover:opacity-80",
                  )}
                >
                  <Image
                    src={src}
                    alt={`${alt} ${i + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { Badge };
