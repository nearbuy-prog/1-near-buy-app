/**
 * Tiny "5m / 2h / 3d ago" formatter. No dependency, no locale aware — keeps
 * the prototype quick. Replace with a proper i18n formatter in Phase 2.
 */
export function formatRelativeTime(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 1) return `${sec}s`;
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * Human countdown like "1h 23m left" or "Expired". Used for reservation
 * timers.
 */
export function formatCountdown(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const sec = Math.floor(diff / 1000);
  const hr = Math.floor(sec / 3600);
  const min = Math.floor((sec % 3600) / 60);
  if (hr > 0) return `${hr}h ${min}m left`;
  if (min > 0) return `${min}m left`;
  return `${sec}s left`;
}
