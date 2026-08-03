import { cn } from "@/lib/utils/cn";

/**
 * Nearby wordmark — text-based, elegant, no childish iconography.
 * Uses a serif (Cormorant via --font-display) for the "N" stamp paired with
 * a clean sans for the rest. The dot becomes a small olive accent.
 */

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export function Logo({ className, size = "md", showDot = true }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[1px] font-display tracking-tight text-charcoal",
        sizes[size],
        className,
      )}
    >
      <span className="font-semibold">Near</span>
      <span className="font-light italic text-olive">Buy</span>
      {showDot && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-gold"
        />
      )}
    </span>
  );
}
