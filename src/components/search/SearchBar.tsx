"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Camera } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  size?: "md" | "lg";
  className?: string;
  /** When true, navigates to /search?q=… on submit. Otherwise calls onSearch. */
  navigate?: boolean;
  onSearch?: (q: string) => void;
}

const QUICK_SUGGESTIONS = [
  "red dress",
  "white thobe",
  "black abaya",
  "oud",
  "perfume",
  "bukhoor",
  "sneakers",
  "handbag",
  "baby clothes",
];

export function SearchBar({
  defaultValue = "",
  placeholder = "Search red dress, white thobe, oud, perfume…",
  size = "md",
  className,
  navigate = true,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(value);
  };

  const submit = (q: string) => {
    const cleaned = q.trim();
    if (navigate) {
      startTransition(() => {
        router.push(cleaned ? `/search?q=${encodeURIComponent(cleaned)}` : "/search");
      });
    }
    onSearch?.(cleaned);
  };

  return (
    <div className={cn("relative", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 rounded-full border bg-white px-4 transition-all",
          size === "lg" ? "h-12" : "h-11",
          focused
            ? "border-olive shadow-card ring-2 ring-olive/15"
            : "border-warmgray-200",
        )}
      >
        <Search className="h-4 w-4 text-charcoal/60" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm placeholder:text-warmgray focus:outline-none"
          enterKeyHint="search"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear search"
            className="rounded-full p-1 text-charcoal/50 hover:bg-cream"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <Link
          href="/visual-search"
          aria-label="Search by image"
          title="Search by image"
          className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive/10 text-olive transition-colors hover:bg-olive hover:text-ivory"
        >
          <Camera className="h-4 w-4" />
        </Link>
      </form>

      {focused && !value && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-warmgray-200/60 bg-white p-3 shadow-card-hover">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-warmgray">
            Quick searches
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onMouseDown={() => {
                  setValue(s);
                  submit(s);
                }}
                className="chip chip-default"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
