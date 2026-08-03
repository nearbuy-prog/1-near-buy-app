import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
  /** When true, renders just the number + count without star icons. */
  compact?: boolean;
}

export function Rating({
  value,
  reviewCount,
  size = "sm",
  className,
  compact = false,
}: RatingProps) {
  const iconSize =
    size === "xs" ? "h-3 w-3" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize =
    size === "xs" ? "text-[11px]" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium text-charcoal",
        textSize,
        className,
      )}
    >
      {!compact && (
        <Star className={cn(iconSize, "fill-gold text-gold")} aria-hidden />
      )}
      <span>{value.toFixed(1)}</span>
      {typeof reviewCount === "number" && (
        <span className="text-warmgray">({reviewCount})</span>
      )}
    </span>
  );
}
