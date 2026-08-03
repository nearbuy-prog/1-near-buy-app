/**
 * Barrel export for all seed data. When we move to Supabase, the consumer-side
 * import paths stay the same — only the implementation behind these functions
 * changes (e.g., to fetchProductById that hits the database).
 */

export { cities, cityById } from "./cities";
export { categories, categoryById, categoryBySlug } from "./categories";
export { stores, storeById, storeBySlug } from "./stores";
export {
  products,
  productById,
  productsByStore,
  featuredProducts,
  trendingProducts,
  saleProducts,
} from "./products";
export { reviews, reviewsForStore, reviewsForProduct } from "./reviews";
