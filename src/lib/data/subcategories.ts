import type { CategoryId, Product } from "@/lib/types";

/**
 * Lightweight subcategory model. Each parent category can declare child
 * subcategories that the storefront renders as filter chips. Filtering is done
 * by matching against `Product.tags` — so we don't have to migrate the product
 * schema. Future "real" subcategories can graduate to first-class CategoryIds.
 */
export interface Subcategory {
  id: string;
  name_en: string;
  name_ar: string;
  /** Lowercase tag tokens that mark a product as belonging to this subcategory. */
  tags: string[];
}

export const SUBCATEGORIES: Partial<Record<CategoryId, Subcategory[]>> = {
  "handmade-home": [
    { id: "handmade-gifts", name_en: "Handmade Gifts", name_ar: "هدايا يدوية", tags: ["handmade-gift", "handmade-gifts"] },
    { id: "personalized-gifts", name_en: "Personalized Gifts", name_ar: "هدايا مخصصة", tags: ["personalized", "custom", "customized"] },
    { id: "clothing-abayas", name_en: "Clothing & Abayas", name_ar: "ملابس وعبايات", tags: ["clothing", "abaya", "apparel"] },
    { id: "accessories-jewelry", name_en: "Accessories & Jewelry", name_ar: "إكسسوارات ومجوهرات", tags: ["jewelry", "jewellery", "accessory", "accessories"] },
    { id: "bags-crochet", name_en: "Bags & Crochet", name_ar: "حقائب وكروشيه", tags: ["crochet", "bag", "knit"] },
    { id: "home-decor", name_en: "Home Décor", name_ar: "ديكور منزلي", tags: ["decor", "ceramic", "pottery"] },
    { id: "candles-fragrances", name_en: "Candles & Fragrances", name_ar: "شموع وعطور", tags: ["candle", "fragrance", "scent"] },
    { id: "art-prints", name_en: "Art & Prints", name_ar: "فن ومطبوعات", tags: ["art", "print", "illustration", "poster"] },
    { id: "stationery-invitations", name_en: "Stationery & Invitations", name_ar: "قرطاسية ودعوات", tags: ["stationery", "invitation", "card", "notebook"] },
    { id: "print-on-demand", name_en: "Print-on-Demand", name_ar: "طباعة حسب الطلب", tags: ["print-on-demand", "printed", "pod"] },
    { id: "baby-kids", name_en: "Baby & Kids", name_ar: "منتجات الأطفال", tags: ["baby", "kids", "children"] },
    { id: "gift-boxes", name_en: "Gift Boxes", name_ar: "صناديق هدايا", tags: ["gift-box", "gift-set", "hamper"] },
    { id: "handmade-skincare", name_en: "Handmade Skincare", name_ar: "عناية مصنوعة يدويًا", tags: ["skincare", "soap", "beauty"] },
    { id: "creative-other", name_en: "Other Creative", name_ar: "منتجات إبداعية أخرى", tags: ["creative", "handmade"] },
  ],
  shoes: [
    {
      id: "mens",
      name_en: "Men's Shoes",
      name_ar: "أحذية رجالية",
      tags: ["men", "mens", "male", "boy"],
    },
    {
      id: "womens",
      name_en: "Women's Shoes",
      name_ar: "أحذية نسائية",
      tags: ["women", "womens", "female", "heel", "heels"],
    },
    {
      id: "kids",
      name_en: "Kids' Shoes",
      name_ar: "أحذية أطفال",
      tags: ["kids", "child", "children", "boys", "girls", "baby"],
    },
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
