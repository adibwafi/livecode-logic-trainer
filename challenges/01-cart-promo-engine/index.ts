export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  inStock: boolean;
}

export type PromoType = 'CATEGORY_PERCENTAGE' | 'MIN_SPEND_FLAT';

export interface CategoryPercentagePromo {
  id: string;
  name: string;
  type: 'CATEGORY_PERCENTAGE';
  category: string;
  discountPercentage: number; // e.g. 10 for 10%
  maxDiscount?: number;       // Optional cap on discount
}

export interface MinSpendFlatPromo {
  id: string;
  name: string;
  type: 'MIN_SPEND_FLAT';
  minSpend: number;           // e.g. 300000
  discountAmount: number;     // e.g. 50000
}

export type PromoRule = CategoryPercentagePromo | MinSpendFlatPromo;

export interface CartCalculationResult {
  subtotal: number;
  discount: number;
  total: number;
  appliedPromo: PromoRule | null;
  outOfStockItems: CartItem[];
}

/**
 * Calculates the cart subtotal, filters out-of-stock items,
 * and applies the highest-value qualifying non-stackable promotion.
 *
 * @param items Array of cart items
 * @param promoRules Available promotion rules
 * @returns CartCalculationResult
 */
export function calculateCart(
  _items: CartItem[],
  _promoRules: PromoRule[] = []
): CartCalculationResult {
  // TODO: Implement calculation and promo engine logic for HappyFresh checkout
  return {
    subtotal: 0,
    discount: 0,
    total: 0,
    appliedPromo: null,
    outOfStockItems: [],
  };
}
