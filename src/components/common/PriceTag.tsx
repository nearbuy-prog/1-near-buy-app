import { cn } from "@/lib/utils/cn";
import { discountPercent, formatOMR } from "@/lib/utils/currency";

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceTag({
  price,
  originalPrice,
  size = "md",
  className,
}: PriceTagProps) {
  const onSale = !!originalPrice && originalPrice > price;
  const pct = onSale ? discountPercent(price, originalPrice!) : 0;

  const sizeClasses = {
    sm: { current: "text-sm font-semibold", original: "text-xs" },
    md: { current: "text-base font-semibold", original: "text-sm" },
    lg: { current: "text-2xl font-bold", original: "text-base" },
  }[size];

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          sizeClasses.current,
          onSale ? "text-terracotta" : "text-charcoal",
        )}
      >
        {formatOMR(price)}
      </span>
      {onSale && (
        <>
          <span
            className={cn(
              sizeClasses.original,
              "text-warmgray line-through decoration-warmgray/60",
            )}
          >
            {formatOMR(originalPrice!)}
          </span>
          {pct > 0 && (
            <span className="text-[11px] font-semibold text-terracotta">
              −{pct}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
