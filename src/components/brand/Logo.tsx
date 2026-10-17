import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * SOUBAK (صوبك) brand logo. Uses the provided logo artwork as-is; only the
 * display height changes per placement so it fits each existing slot without
 * altering the surrounding layout.
 */

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Retained for API compatibility — the accent dot is part of the artwork. */
  showDot?: boolean;
}

export function Logo({ className, size = "md" }: LogoProps) {
  const heights = { sm: "h-8", md: "h-10", lg: "h-28" };
  return (
    <Image
      src="/soubak-logo.png"
      alt="SOUBAK صوبك"
      width={621}
      height={740}
      priority
      className={cn("w-auto select-none", heights[size], className)}
    />
  );
}
