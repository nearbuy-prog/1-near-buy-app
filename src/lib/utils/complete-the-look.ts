import type { CategoryId, Product, Store, CityId } from "@/lib/types";

/**
 * "Complete the Look" — prototype AI-style recommendation layer.
 *
 * This is intentionally a deterministic, rules-based recommender so the
 * prototype feels intelligent without needing an external model. Real AI can
 * replace `scoreCandidate` later — the rest of the pipeline (filtering,
 * grouping, fallback) stays the same. Treat this as a placeholder that:
 *
 *   1. Maps the current product to a set of "complementary" categories.
 *   2. Pulls candidate products from those categories within the same city.
 *   3. Scores each candidate by color match, shared tags, featured boost,
 *      same-store boost (small), and stock availability.
 *   4. Returns the top N with a human-readable match reason
 *      (Color match / Style match / Occasion match / Best match).
 *
 * If there aren't enough strong matches, the caller can fall back to the
 * `getFallbackRecommendations()` helper below ("You may also like").
 */

// ---------------------------------------------------------------------------
// Category complement map — what naturally goes together when styling an
// outfit, a gift, or a home setup.
// ---------------------------------------------------------------------------

const COMPLEMENTS: Record<CategoryId, CategoryId[]> = {
  abayas: ["shoes", "bags", "accessories", "perfumes", "beauty"],
  "mukhawar-jalabiya": ["shoes", "bags", "accessories", "perfumes", "beauty"],
  "womens-clothing": ["shoes", "bags", "accessories", "perfumes", "beauty"],
  "mens-clothing": ["shoes", "accessories", "perfumes"],
  thobes: ["shoes", "accessories", "perfumes", "oud-bukhoor"],
  shoes: ["bags", "womens-clothing", "mens-clothing", "abayas", "accessories"],
  bags: ["shoes", "womens-clothing", "accessories", "perfumes"],
  accessories: ["bags", "womens-clothing", "abayas", "perfumes"],
  perfumes: ["abayas", "womens-clothing", "beauty", "accessories", "gifts"],
  "oud-bukhoor": ["thobes", "perfumes", "home", "gifts"],
  beauty: ["perfumes", "accessories", "womens-clothing", "bags"],
  kids: ["shoes", "gifts", "home"],
  home: ["gifts", "oud-bukhoor", "kids"],
  gifts: ["perfumes", "oud-bukhoor", "beauty", "home", "accessories"],
  "handmade-home": ["handmade-home", "gifts", "accessories", "home"],
};

// ---------------------------------------------------------------------------
// Gender awareness — a women's piece should only be completed with women's (or
// unisex) items, and a men's piece with men's (or unisex) items. We never want
// to suggest men's sandals under a women's abaya, or a women's heel under a
// thobe.
// ---------------------------------------------------------------------------

type Gender = "men" | "women" | "unisex";

// Categories that are inherently single-gender, regardless of tags.
const WOMEN_CATEGORIES = new Set<CategoryId>([
  "abayas",
  "mukhawar-jalabiya",
  "womens-clothing",
]);
const MEN_CATEGORIES = new Set<CategoryId>(["thobes", "mens-clothing"]);

// Women's apparel that should get an all-female "complete the look".
const WOMENS_APPAREL_CATEGORIES = new Set<CategoryId>([
  "abayas",
  "mukhawar-jalabiya",
  "womens-clothing",
]);

const MEN_TOKENS = new Set(["men", "man", "mens", "boys", "boy", "male"]);
const WOMEN_TOKENS = new Set([
  "women",
  "woman",
  "womens",
  "girls",
  "girl",
  "ladies",
  "female",
]);

/**
 * Infer the intended gender of a product. Category is the strongest signal;
 * for cross-gender categories (shoes, bags, accessories, perfumes, beauty…) we
 * fall back to the product's tags. Anything ambiguous is treated as unisex so
 * it can pair with either side rather than being wrongly excluded.
 */
export function productGender(p: Product): Gender {
  if (WOMEN_CATEGORIES.has(p.category)) return "women";
  if (MEN_CATEGORIES.has(p.category)) return "men";

  const tags = p.tags.map((t) => t.toLowerCase());
  if (tags.includes("unisex")) return "unisex";

  const hasMen = tags.some((t) => MEN_TOKENS.has(t));
  const hasWomen = tags.some((t) => WOMEN_TOKENS.has(t));
  if (hasMen && !hasWomen) return "men";
  if (hasWomen && !hasMen) return "women";
  return "unisex";
}

/**
 * Whether a candidate of `candidate` gender may complete a product of `target`
 * gender. Unisex pairs with everything; otherwise the two must match.
 */
export function genderCompatible(target: Gender, candidate: Gender): boolean {
  if (target === "unisex" || candidate === "unisex") return true;
  return target === candidate;
}

// Age awareness — don't complete an adult outfit with a toddler's sneaker, and
// don't complete a kid's look with adult perfume. Kept separate from gender so
// a "boys" item still counts as men's, just in the kids age band.
const KIDS_TOKENS = new Set([
  "kids",
  "kid",
  "children",
  "child",
  "toddler",
  "baby",
  "babies",
  "infant",
  "newborn",
  "boys",
  "boy",
  "girls",
  "girl",
]);

/** Whether a product is aimed at children (by category or tags). */
export function isKidsProduct(p: Product): boolean {
  if (p.category === "kids") return true;
  return p.tags.some((t) => KIDS_TOKENS.has(t.toLowerCase()));
}

// Traditional men's headwear worn with a thobe/dishdasha (kumma, massar…).
// These live in the "thobes" category in the data, so they need an explicit
// opt-in to surface as "complete the look" options.
// Note: deliberately no generic "cap" — that catches baseball/sports caps.
// The kumma is tagged "kumma", the massar "massar"/"turban".
const HEADWEAR_TOKENS = new Set([
  "kumma",
  "kuma",
  "massar",
  "musar",
  "turban",
  "ghutra",
  "shemagh",
  "keffiyeh",
  "imamah",
]);

/** Traditional headwear (kumma / massar / etc.). */
export function isHeadwear(p: Product): boolean {
  return p.tags.some((t) => HEADWEAR_TOKENS.has(t.toLowerCase()));
}

/** A sandal/na'al — the footwear normally worn with a thobe. */
export function isSandal(p: Product): boolean {
  if (p.category !== "shoes") return false;
  return p.tags.some((t) => {
    const tag = t.toLowerCase();
    return tag === "sandals" || tag === "sandal" || tag === "naal";
  });
}

// Loose vocabulary used to detect a shared "occasion" between two products.
// Matching any of these tokens in both products yields an "Occasion match".
const OCCASION_TOKENS = new Set([
  "wedding",
  "henna",
  "eid",
  "ramadan",
  "evening",
  "party",
  "summer",
  "winter",
  "office",
  "formal",
  "casual",
  "daily",
  "gift",
  "school",
  "majlis",
]);

// Same idea but for "style" — broader fashion descriptors.
const STYLE_TOKENS = new Set([
  "boho",
  "minimalist",
  "classic",
  "luxury",
  "couture",
  "modern",
  "vintage",
  "preppy",
  "streetwear",
  "athleisure",
  "traditional",
  "heritage",
]);

export type MatchReason =
  | "color"
  | "style"
  | "occasion"
  | "best";

export interface MatchReasonMeta {
  label_en: string;
  label_ar: string;
}

export const MATCH_REASON_META: Record<MatchReason, MatchReasonMeta> = {
  color: { label_en: "Color match", label_ar: "تطابق اللون" },
  style: { label_en: "Style match", label_ar: "تطابق الستايل" },
  occasion: { label_en: "Occasion match", label_ar: "تطابق المناسبة" },
  best: { label_en: "Best match", label_ar: "أفضل تطابق" },
};

export interface Recommendation {
  product: Product;
  store: Store;
  distance_km?: number;
  reason: MatchReason;
  /** Numeric score — internal, surfaced for debugging only. */
  score: number;
}

interface ScoredCandidate extends Recommendation {}

interface RecommenderInput {
  currentProduct: Product;
  allProducts: Product[];
  stores: Store[];
  selectedCity: CityId;
  /** Optional distance computer — passing this enables "Xkm" labels. */
  computeDistance?: (storeLocation: {
    lat: number;
    lng: number;
  }) => number | undefined;
  /** How many recommendations to return. Default 8. */
  limit?: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getCompleteTheLookRecommendations(
  input: RecommenderInput,
): Recommendation[] {
  const {
    currentProduct,
    allProducts,
    stores,
    selectedCity,
    computeDistance,
    limit = 8,
  } = input;

  const complementCats = COMPLEMENTS[currentProduct.category] ?? [];
  const targetGender = productGender(currentProduct);
  const targetIsKids = isKidsProduct(currentProduct);
  // A thobe/dishdasha gets a tailored look: sandals (na'al) for footwear,
  // traditional headwear (kumma/massar), and perfume/oud — never sneakers.
  const isThobe = currentProduct.category === "thobes" && !isHeadwear(currentProduct);
  // A women's apparel piece (abaya, dress, jalabiya…) gets an all-female look:
  // women's shoes, female perfumes and some beauty/makeup — nothing men's.
  const isWomensLook = WOMENS_APPAREL_CATEGORIES.has(currentProduct.category);
  const storeById = (id: string) => stores.find((s) => s.id === id);

  const candidates = allProducts
    // Exclude the product itself.
    .filter((p) => p.id !== currentProduct.id)
    // Only complementary categories — plus traditional headwear for thobes,
    // which lives in the "thobes" category and would otherwise be skipped.
    .filter(
      (p) =>
        complementCats.includes(p.category) || (isThobe && isHeadwear(p)),
    )
    // For a thobe, the only acceptable footwear is sandals (not sneakers/heels).
    .filter((p) => !(isThobe && p.category === "shoes") || isSandal(p))
    // Gender-appropriate only: women's → women's/unisex, men's → men's/unisex.
    .filter((p) => genderCompatible(targetGender, productGender(p)))
    // For a women's look, keep it strictly feminine — drop anything carrying a
    // men's tag (e.g. unisex men/women sneakers) so nothing masculine appears.
    .filter(
      (p) =>
        !isWomensLook || !p.tags.some((t) => MEN_TOKENS.has(t.toLowerCase())),
    )
    // Age-appropriate: keep kids' looks with kids' items and adults' with adults'.
    .filter((p) => isKidsProduct(p) === targetIsKids)
    // Must have a valid store in the same city.
    .map((p) => {
      const store = storeById(p.store_id);
      if (!store) return null;
      if (store.city !== selectedCity) return null;
      return { product: p, store };
    })
    .filter(Boolean) as Array<{ product: Product; store: Store }>;

  const scored: ScoredCandidate[] = candidates.map(({ product, store }) => {
    let { score, reason } = scoreCandidate(currentProduct, product);
    // For a thobe, push the staples a man actually completes the look with —
    // sandals and headwear — to the top, ahead of generic colour matches.
    if (isThobe && (isSandal(product) || isHeadwear(product))) {
      score += 6;
      reason = "style";
    }
    // For a women's look, lead with women's shoes, female perfumes and makeup.
    if (isWomensLook) {
      if (product.category === "beauty") {
        score += 6; // make sure some make-up/beauty surfaces
        reason = "style";
      }
      if (product.category === "perfumes" && productGender(product) === "women") {
        score += 4; // female perfumes ahead of unisex ones
      }
      if (product.category === "shoes") score += 1.5; // women's shoes focus
    }
    const distance = computeDistance?.(store.location);
    return { product, store, distance_km: distance, score, reason };
  });

  // Sort: in-stock first → highest score → featured → trending → cheapest tie-break
  const sorted = scored.sort((a, b) => {
    if (a.product.in_stock !== b.product.in_stock)
      return a.product.in_stock ? -1 : 1;
    if (a.score !== b.score) return b.score - a.score;
    if (!!b.product.featured !== !!a.product.featured)
      return b.product.featured ? 1 : -1;
    if (!!b.product.trending !== !!a.product.trending)
      return b.product.trending ? 1 : -1;
    return a.product.price - b.product.price;
  });

  // De-dupe by category so the rail isn't 8 pairs of shoes. For a thobe we
  // deliberately allow more footwear so the full range of sandals can show.
  const seenPerCat = new Map<CategoryId, number>();
  const capFor = (cat: CategoryId) => {
    if (isThobe) {
      if (cat === "shoes") return 6; // surface all the sandals
      if (cat === "thobes") return 2; // kumma + massar headwear
      if (cat === "perfumes") return 3;
      return 3;
    }
    if (isWomensLook) {
      if (cat === "shoes") return 3;
      if (cat === "perfumes") return 3;
      if (cat === "beauty") return 2;
      if (cat === "bags") return 2;
      if (cat === "accessories") return 2;
      return 2;
    }
    return 3;
  };
  const effectiveLimit = isThobe ? Math.max(limit, 12) : limit;
  const out: Recommendation[] = [];
  for (const candidate of sorted) {
    const cat = candidate.product.category;
    const count = seenPerCat.get(cat) ?? 0;
    if (count >= capFor(cat)) continue;
    seenPerCat.set(cat, count + 1);
    out.push(candidate);
    if (out.length >= effectiveLimit) break;
  }
  return out;
}

/**
 * Fallback for products with few/no strong matches. Pulls trending or
 * featured products from the same city (excluding the current one).
 */
export function getFallbackRecommendations(
  input: RecommenderInput,
): Recommendation[] {
  const { currentProduct, allProducts, stores, selectedCity, limit = 8 } = input;
  const targetGender = productGender(currentProduct);
  const targetIsKids = isKidsProduct(currentProduct);
  const storeById = (id: string) => stores.find((s) => s.id === id);
  const candidates = allProducts
    .filter(
      (p) =>
        p.id !== currentProduct.id &&
        (p.featured || p.trending || p.category === currentProduct.category),
    )
    // Keep fallback gender- and age-appropriate too.
    .filter((p) => genderCompatible(targetGender, productGender(p)))
    .filter((p) => isKidsProduct(p) === targetIsKids)
    .map((p) => {
      const store = storeById(p.store_id);
      if (!store || store.city !== selectedCity) return null;
      return {
        product: p,
        store,
        distance_km: input.computeDistance?.(store.location),
        score: 0,
        reason: "best" as MatchReason,
      };
    })
    .filter(Boolean) as Recommendation[];

  return candidates
    .sort((a, b) => {
      if (a.product.in_stock !== b.product.in_stock)
        return a.product.in_stock ? -1 : 1;
      if (!!b.product.featured !== !!a.product.featured)
        return b.product.featured ? 1 : -1;
      if (!!b.product.trending !== !!a.product.trending)
        return b.product.trending ? 1 : -1;
      return 0;
    })
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Scoring internals
// ---------------------------------------------------------------------------

function scoreCandidate(
  current: Product,
  candidate: Product,
): { score: number; reason: MatchReason } {
  let score = 0;
  let reason: MatchReason = "best";

  // Color match — strongest single signal.
  const currentColors = current.colors.map((c) => c.name_en.toLowerCase());
  const candidateColors = candidate.colors.map((c) => c.name_en.toLowerCase());
  const sharedColor = currentColors.some((c) => candidateColors.includes(c));
  if (sharedColor) {
    score += 5;
    reason = "color";
  }

  // Neutral-pairing bonus: black/white/sand/ivory/gold/silver always go with
  // a strong colour. Slight boost so neutral accessories still surface.
  const NEUTRALS = new Set([
    "black",
    "white",
    "ivory",
    "sand",
    "gold",
    "silver",
    "grey",
  ]);
  const currentHasColor = currentColors.some((c) => !NEUTRALS.has(c));
  const candidateIsNeutral = candidateColors.every((c) => NEUTRALS.has(c));
  if (currentHasColor && candidateIsNeutral) score += 1.5;

  // Shared tags — occasion is more diagnostic than generic style.
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));
  const candidateTags = candidate.tags.map((t) => t.toLowerCase());
  let occasionHits = 0;
  let styleHits = 0;
  let plainHits = 0;
  for (const t of candidateTags) {
    if (!currentTags.has(t)) continue;
    if (OCCASION_TOKENS.has(t)) occasionHits++;
    else if (STYLE_TOKENS.has(t)) styleHits++;
    else plainHits++;
  }
  score += occasionHits * 2.5 + styleHits * 1.5 + plainHits * 0.5;

  if (!sharedColor) {
    if (occasionHits > 0) reason = "occasion";
    else if (styleHits > 0) reason = "style";
  }

  // Featured / trending nudges so curated items rise.
  if (candidate.featured) score += 0.8;
  if (candidate.trending) score += 0.5;

  return { score, reason };
}
