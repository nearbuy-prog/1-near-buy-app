import type { CategoryId, Product } from "@/lib/types";

/**
 * Lightweight subcategory model. Each parent category can declare child
 * subcategories that the storefront renders as filter chips. Filtering is done
 * by matching against `Product.tags` — so we don't have to migrate the product
 * schema. Future "real" subcategories can graduate to first-class CategoryIds.
 *
 * Every subcategory below is backed by real products in the catalogue (matched
 * on existing tags); empty splits (e.g. men's/kids' bags, haircare, bedding)
 * are intentionally omitted. "All" is rendered by the category page itself.
 */
export interface Subcategory {
  id: string;
  name_en: string;
  name_ar: string;
  /** Lowercase tag tokens that mark a product as belonging to this subcategory. */
  tags: string[];
}

export const SUBCATEGORIES: Partial<Record<CategoryId, Subcategory[]>> = {
  shoes: [
    { id: "mens", name_en: "Men's Shoes", name_ar: "أحذية رجالية", tags: ["men", "mens", "male", "boy"] },
    { id: "womens", name_en: "Women's Shoes", name_ar: "أحذية نسائية", tags: ["women", "womens", "female", "heel", "heels"] },
    { id: "kids", name_en: "Kids' Shoes", name_ar: "أحذية أطفال", tags: ["kids", "child", "children", "boys", "girls", "baby"] },
  ],
  kids: [
    { id: "boys", name_en: "Boys", name_ar: "أولاد", tags: ["boys", "boy"] },
    { id: "girls", name_en: "Girls", name_ar: "بنات", tags: ["girls", "girl"] },
    { id: "baby", name_en: "Baby", name_ar: "مواليد", tags: ["baby", "newborn", "bodysuit", "toddler"] },
    { id: "toys", name_en: "Toys", name_ar: "ألعاب", tags: ["toys", "toy", "plush", "teddy", "wooden", "learning"] },
  ],
  bags: [
    { id: "tote", name_en: "Tote Bags", name_ar: "حقائب كبيرة", tags: ["tote", "shopper"] },
    { id: "crossbody", name_en: "Crossbody Bags", name_ar: "حقائب كروس", tags: ["crossbody", "mini"] },
    { id: "shoulder", name_en: "Shoulder Bags", name_ar: "حقائب كتف", tags: ["shoulder", "top-handle", "satchel", "flap"] },
    { id: "clutch", name_en: "Clutches & Evening", name_ar: "كلتش وسهرة", tags: ["clutch", "evening"] },
  ],
  accessories: [
    { id: "jewelry", name_en: "Jewelry", name_ar: "مجوهرات", tags: ["jewelry", "jewellery", "necklace", "earrings", "rings", "bracelet", "pearl", "pendant"] },
    { id: "watches", name_en: "Watches", name_ar: "ساعات", tags: ["watch", "watches"] },
    { id: "sunglasses", name_en: "Sunglasses", name_ar: "نظارات شمسية", tags: ["sunglasses", "uv"] },
    { id: "scarves", name_en: "Scarves & Shawls", name_ar: "أوشحة وشيلان", tags: ["scarf", "shawl", "hijab", "shayla"] },
  ],
  perfumes: [
    { id: "women", name_en: "Women", name_ar: "نسائي", tags: ["women", "womens", "female"] },
    { id: "men", name_en: "Men", name_ar: "رجالي", tags: ["men", "mens", "male"] },
    { id: "unisex", name_en: "Unisex", name_ar: "للجنسين", tags: ["unisex"] },
  ],
  beauty: [
    { id: "face", name_en: "Face", name_ar: "الوجه", tags: ["face", "foundation", "highlighter", "concealer", "complexion", "glow"] },
    { id: "eyes", name_en: "Eyes", name_ar: "العيون", tags: ["eyes", "eyeshadow", "mascara", "eyeliner", "palette", "brows"] },
    { id: "lips", name_en: "Lips", name_ar: "الشفاه", tags: ["lips", "lipstick", "gloss", "lip"] },
    { id: "skincare", name_en: "Skincare", name_ar: "العناية بالبشرة", tags: ["skincare", "serum", "moisturizer", "cleanser", "mask"] },
    { id: "tools", name_en: "Brushes & Tools", name_ar: "فرش وأدوات", tags: ["brushes", "brush", "tools"] },
  ],
  home: [
    { id: "decor", name_en: "Décor", name_ar: "ديكور", tags: ["decor", "vase", "rug", "wall", "mirror", "frame"] },
    { id: "lighting", name_en: "Lighting", name_ar: "إضاءة", tags: ["lamp", "lighting", "lantern", "light"] },
    { id: "kitchen", name_en: "Kitchen & Dining", name_ar: "المطبخ والطعام", tags: ["kitchen", "dinnerware", "mug", "coffee", "stoneware", "tableware", "dining"] },
    { id: "candles", name_en: "Candles & Scents", name_ar: "شموع ومعطرات", tags: ["candle", "scented", "diffuser"] },
    { id: "majlis", name_en: "Majlis & Seating", name_ar: "المجلس", tags: ["majlis", "cushion", "floor"] },
  ],
  gifts: [
    { id: "boxes", name_en: "Gift Boxes & Hampers", name_ar: "علب وسلال هدايا", tags: ["gift box", "gift-box", "gift-set", "hamper", "basket", "box", "set"] },
    { id: "occasions", name_en: "Special Occasions", name_ar: "مناسبات خاصة", tags: ["wedding", "eid", "graduation", "anniversary", "celebration", "festive", "occasion", "birth"] },
    { id: "wrapping", name_en: "Gift Wrapping", name_ar: "تغليف الهدايا", tags: ["wrapping", "service", "ribbon"] },
    { id: "sweets", name_en: "Sweets & Treats", name_ar: "حلويات", tags: ["chocolate", "dates", "sweets"] },
  ],
  "oud-bukhoor": [
    { id: "oud", name_en: "Oud", name_ar: "عود", tags: ["oud", "dehn-al-oud", "attar", "oil", "muattar"] },
    { id: "bukhoor", name_en: "Bukhoor", name_ar: "بخور", tags: ["bukhoor"] },
    { id: "burners", name_en: "Incense Burners", name_ar: "مباخر", tags: ["mabkhara", "burner", "incense", "electric", "brass", "cones"] },
    { id: "oud-perfume", name_en: "Oud Perfumes", name_ar: "عطور العود", tags: ["eau-de-parfum", "perfume", "spray"] },
  ],
  "handmade-home": [
    { id: "handmade-gifts", name_en: "Handmade Gifts", name_ar: "هدايا يدوية", tags: ["handmade-gift", "handmade-gifts", "gift-box", "gift-set", "hamper"] },
    { id: "clothing", name_en: "Clothing", name_ar: "ملابس", tags: ["clothing", "abaya", "apparel"] },
    { id: "accessories", name_en: "Accessories", name_ar: "إكسسوارات", tags: ["accessory", "accessories", "jewelry", "jewellery", "bag", "crochet"] },
    { id: "home-decor", name_en: "Home Décor", name_ar: "ديكور منزلي", tags: ["decor", "ceramic", "pottery", "candle", "fragrance"] },
    { id: "personalized", name_en: "Personalized Items", name_ar: "منتجات مخصصة", tags: ["personalized", "custom", "customized", "customizable"] },
  ],
};

export function subcategoriesFor(categoryId: CategoryId): Subcategory[] {
  return SUBCATEGORIES[categoryId] ?? [];
}

export function productMatchesSubcategory(
  product: Product,
  subcategory: Subcategory,
): boolean {
  const productTags = product.tags.map((t) => t.toLowerCase());
  return subcategory.tags.some((needle) =>
    productTags.includes(needle.toLowerCase()),
  );
}
