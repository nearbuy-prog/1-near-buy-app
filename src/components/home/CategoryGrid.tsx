"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import { useLocale } from "@/lib/hooks/use-locale";

export function CategoryGrid() {
  const { name } = useLocale();

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.slug}`}
          className="group flex flex-col items-center gap-2"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream">
            <Image
              src={c.image}
              alt={name(c)}
              fill
              sizes="(max-width: 640px) 33vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent" />
          </div>
          <span className="text-center text-xs font-medium leading-tight text-charcoal sm:text-sm">
            {name(c)}
          </span>
        </Link>
      ))}
    </div>
  );
}
