import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDistance } from "@/lib/utils/distance";

interface DistanceProps {
  km: number | undefined;
  className?: string;
  showIcon?: boolean;
}

export function Distance({ km, className, showIcon = true }: DistanceProps) {
  if (km === undefined) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-warmgray",
        className,
      )}
    >
      {showIcon && <MapPin className="h-3 w-3" aria-hidden />}
      <span>{formatDistance(km)}</span>
    </span>
  );
}
