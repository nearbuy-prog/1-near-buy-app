import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "abayas",
    slug: "abayas",
    name_en: "Abayas",
    name_ar: "عبايات",
    icon: "Sparkles",
    image: "/abaya-new.png",
  },
  {
    id: "thobes",
    slug: "thobes",
    name_en: "Thobes & Dishdashas",
    name_ar: "ثياب ودشاديش",
    icon: "Shirt",
    image: "/thobes-new.png",
  },
  {
    id: "womens-clothing",
    slug: "womens-clothing",
    name_en: "Women's Clothing",
    name_ar: "ملابس نسائية",
    icon: "User",
    image: "/womens-clothing-new.png",
  },
  {
    id: "mens-clothing",
    slug: "mens-clothing",
    name_en: "Men's Clothing",
    name_ar: "ملابس رجالية",
    icon: "Shirt",
    image: "/category-mens-clothing.png",
  },
  {
    id: "kids",
    slug: "kids",
    name_en: "Kids",
    name_ar: "أطفال",
    icon: "Baby",
    image: "/category-kids.png",
  },
  {
    id: "mukhawar-jalabiya",
    slug: "mukhawar-jalabiya",
    name_en: "Mukhawar Jalabiya",
    name_ar: "مخوّر وجلابية",
    icon: "Flower2",
    image: "/mukhawar-latest.png",
  },
  {
    id: "shoes",
    slug: "shoes",
    name_en: "Shoes",
    name_ar: "أحذية",
    icon: "Footprints",
    image: "/shoes-latest.png",
  },
  {
    id: "bags",
    slug: "bags",
    name_en: "Bags",
    name_ar: "حقائب",
    icon: "ShoppingBag",
    image: "/bags-latest.png",
  },
  {
    id: "accessories",
    slug: "accessories",
    name_en: "Accessories",
    name_ar: "إكسسوارات",
    icon: "Gem",
    image: "/category-accessories.png",
  },
  {
    id: "perfumes",
    slug: "perfumes",
    name_en: "Perfumes",
    name_ar: "عطور",
    icon: "Wind",
    image: "/perfumes-wide.png",
  },
  {
    id: "beauty",
    slug: "beauty",
    name_en: "Beauty",
    name_ar: "تجميل",
    icon: "Sparkle",
    image: "/beauty-3.png",
  },
  {
    id: "oud-bukhoor",
    slug: "oud-bukhoor",
    name_en: "Oud & Bukhoor",
    name_ar: "عود وبخور",
    icon: "Flame",
    image: "/oud-bukh-3.png",
  },
  {
    id: "gifts",
    slug: "gifts",
    name_en: "Gifts",
    name_ar: "هدايا",
    icon: "Gift",
    image: "/gifts-latest.png",
  },
  {
    id: "home",
    slug: "home",
    name_en: "Home",
    name_ar: "المنزل",
    icon: "Home",
    image: "/home-latest.png",
  },
  {
    id: "handmade-home",
    slug: "handmade-home",
    name_en: "Handmade & Home Businesses",
    name_ar: "منتجات يدوية ومشاريع منزلية",
    icon: "HandHeart",
    image: "/handmade-6.png",
  },
];

export function categoryById(id: string | undefined) {
  return categories.find((c) => c.id === id);
}

export function categoryBySlug(slug: string | undefined) {
  return categories.find((c) => c.slug === slug);
}
