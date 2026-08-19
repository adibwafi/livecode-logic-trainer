export interface CartItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  inStock: boolean;
}

export interface SubstitutionOptions {
  /**
   * Minimum score required for a product to be considered a viable substitute.
   * Default: 50
   */
  minScoreThreshold?: number;

  /**
   * Percentage price difference considered acceptable for proximity scoring.
   * Default: 10 (meaning ±10%)
   */
  priceTolerancePercent?: number;
}

/**
 * Evaluates in-stock products in the catalog against an out-of-stock target item
 * and returns the best substitute based on category, price proximity, and brand matching.
 *
 * @param targetItem The out-of-stock item that needs a replacement
 * @param catalog List of supermarket products
 * @param options Optional configuration overrides (minScoreThreshold, priceTolerancePercent)
 * @returns The best matching Product, or null if no candidate qualifies
 */
export function findBestSubstitute(
  _targetItem: CartItem,
  _catalog: Product[],
  _options?: SubstitutionOptions
): Product | null {
  // TODO: Implement item substitution scoring algorithm for HappyFresh picking app
  return null;
}
