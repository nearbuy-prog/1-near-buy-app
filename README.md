# Nearby

City-based shopping discovery for Oman — a digital shopping mall connecting physical stores into one searchable, mobile-first PWA.

> Find a "red dress", "white thobe", "oud", or "bukhoor" in stores across Muscat, Salalah, Sohar, Nizwa, Sur, and Barka.

---

## Stack

| Layer | Choice | Status |
|---|---|---|
| Framework | Next.js 15 (App Router) | ✅ |
| Language | TypeScript (strict) | ✅ |
| Styling | Tailwind CSS + shadcn/ui patterns | ✅ |
| State | Zustand + TanStack Query | ✅ |
| Forms | react-hook-form + zod | ✅ |
| Maps | Mapbox GL JS | ✅ (token required) |
| Database | Supabase (Postgres) | 🟡 Phase 2 |
| Auth | Supabase Auth (phone/email/social) | 🟡 Phase 2 |
| Deployment | Vercel | ready |

The app currently runs on realistic seed data (`src/lib/data/`). The data shape mirrors the Phase-2 Postgres schema, so swapping seeds for Supabase queries is an implementation change behind the helpers in `src/lib/data/index.ts` — UI code does not change.

---

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Copy env vars and add your Mapbox token
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_MAPBOX_TOKEN

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

The map view shows a styled fallback if no Mapbox token is configured, so you can develop everything else without one. To enable real maps, get a free public token at <https://account.mapbox.com/access-tokens/> and paste it into `.env.local`.

---

## Project structure

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout (TopBar + BottomNav)
│   ├── page.tsx             # Home — hero, categories, rails
│   ├── providers.tsx        # TanStack Query provider
│   ├── search/              # Search results (list + map view)
│   ├── category/[slug]/     # Category browse pages
│   ├── product/[id]/        # Product detail (gallery + actions + reviews)
│   ├── store/[id]/          # Store profile (about, hours, products, reviews)
│   ├── map/                 # Full map view of stores in current city
│   ├── favorites/           # Local-only saved products
│   ├── admin/               # Read-only admin overview (Phase 1)
│   └── not-found.tsx
│
├── components/
│   ├── ui/                  # Primitives (Button, Card, Input, Sheet, Dialog…)
│   ├── brand/               # Logo wordmark
│   ├── layout/              # TopBar, BottomNav, CitySelector, LanguageToggle
│   ├── home/                # HeroSection, CategoryGrid
│   ├── product/             # ProductCard, ProductGrid, ProductRail,
│   │                        # ProductGallery, ProductActions, OrderRequestModal
│   ├── store/               # StoreCard
│   ├── search/              # SearchBar, Filters
│   ├── map/                 # StoreMap (Mapbox GL with fallback)
│   ├── favorites/           # FavoriteButton (heart toggle)
│   └── common/              # PriceTag, Rating, Distance, ColorSwatches
│
└── lib/
    ├── types/               # Domain types (mirrors Phase-2 Postgres schema)
    ├── data/                # Seed data: cities, categories, stores, products, reviews
    ├── utils/               # currency, distance, search, contact helpers, cn
    ├── stores/              # Zustand: city, favorites, language
    ├── i18n/                # Translation table (English first, Arabic-ready)
    └── hooks/               # use-locale (bilingual field resolver)
```

---

## Domain model

All bilingual fields use `_en` / `_ar` suffixes so adding Arabic content later is content-only — the UI already routes through `useLocale()`.

- **City** — id, name_en, name_ar, center { lat, lng }, zoom
- **Category** — id, slug, name_en, name_ar, icon, image
- **Store** — full address, location, phone, whatsapp, categories, rating, hours, accepts_online_orders, delivers, badges
- **Product** — store_id, category, name, description, price (OMR), original_price, images, sizes, colors[{name, hex}], tags, in_stock, featured, trending
- **Review** — store_id, product_id?, author, rating, comment

Currency is **OMR** displayed as `OMR 12.500` (3 decimals — official Omani standard).

---

## Locked design palette

| Role | Hex |
|---|---|
| Background — ivory | `#FBF8F3` |
| Surface — soft cream | `#F4EFE6` |
| Primary — muted olive | `#7A8B5C` |
| Accent — soft gold | `#C9A961` |
| Text — charcoal | `#1F1F1F` |
| Muted text — warm gray | `#8A857C` |
| Sale / discount — terracotta | `#B85C3F` |
| Success — sage | `#6B8E5A` |

> **No brown** as identity color — explicit constraint.

---

## Phase 2 roadmap

The folders, types, and data helpers are designed to absorb these without rewrites:

1. **Supabase migration** — replace functions in `src/lib/data/*` with Postgres queries via the Supabase client. Schema mirrors the TS types in `src/lib/types/`.
2. **Auth** — guest mode → phone OTP / email / Google / Apple via Supabase Auth. The `useFavoritesStore` already has the API the synced version will keep.
3. **Store-owner dashboard** — separate route under `/dashboard/store/*`. Stores already carry `accepts_online_orders` and a category list.
4. **Online ordering** — `OrderRequestModal` already mocks the request flow. Wire it to a `POST /api/orders` route that writes to Supabase.
5. **Payments** — Thawani integration when ready (OMR-native).
6. **Arabic** — all strings flow through `t.*` and bilingual data fields. Toggle the `LanguageToggle`, populate `_ar` content, ship.
7. **Real product images** — swap stock URLs for Supabase Storage URLs.
8. **Push notifications** — once auth lands.

---

## Scripts

```bash
npm run dev         # Next dev server
npm run build       # Production build
npm run start       # Run production build
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
```

---

## Deployment

The project is Vercel-ready. Push to GitHub, import in Vercel, set `NEXT_PUBLIC_MAPBOX_TOKEN`, and deploy. No backend dependencies in v1.
