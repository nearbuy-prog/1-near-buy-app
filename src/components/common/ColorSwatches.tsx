import { cn } from "@/lib/utils/cn";
import type { ProductColor } from "@/lib/types";

interface ColorSwatchesProps {
  colors: ProductColor[];
  size?: "xs" | "sm" | "md";
  max?: number;
  selected?: string;
  onSelect?: (color: ProductColor) => void;
  className?: string;
}

export function ColorSwatches({
  colors,
  size = "sm",
  max,
  selected,
  onSelect,
  className,
}: ColorSwatchesProps) {
  if (!colors.length) return null;
  const display = typeof max === "number" ? colors.slice(0, max) : colors;
  const overflow = typeof max === "number" ? Math.max(0, colors.length - max) : 0;

  const swatchSize =
    size === "xs" ? "h-3 w-3" : size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {display.map((c) => {
        const isSelected = selected && selected === c.name_en;
        const Component = onSelect ? "button" : "span";
        return (
          <Component
            key={c.name_en}
            onClick={onSelect ? () => onSelect(c) : undefined}
            type={onSelect ? "button" : undefined}
            title={c.name_en}
            aria-label={c.name_en}
            className={cn(
              "inline-block rounded-full border border-warmgray-200 transition-shadow",
              swatchSize,
              isSelected && "ring-2 ring-charcoal ring-offset-2 ring-offset-white",
              onSelect && "cursor-pointer hover:scale-110",
            )}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
      {overflow > 0 && (
        <span className="text-[11px] text-warmgray">+{overflow}</span>
      )}
    </span>
  );
}
