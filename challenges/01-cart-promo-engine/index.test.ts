import { calculateCart, CartItem, PromoRule } from './index';

describe('HappyFresh Complex Cart & Promo Engine', () => {
  const sampleItems: CartItem[] = [
    { id: '1', name: 'Greenfields Fresh Milk 1L', category: 'Dairy', price: 35000, quantity: 2, inStock: true },
    { id: '2', name: 'Anchor Salted Butter 227g', category: 'Dairy', price: 45000, quantity: 1, inStock: true },
    { id: '3', name: 'Wagyu Beef Ribeye 200g', category: 'Meat', price: 250000, quantity: 1, inStock: true },
    { id: '4', name: 'Indomie Goreng Pack of 5', category: 'Pantry', price: 15000, quantity: 2, inStock: true },
  ];

  it('1. should calculate correct subtotal and total when no promotions are provided', () => {
    const result = calculateCart(sampleItems, []);

    // (35000 * 2) + (45000 * 1) + (250000 * 1) + (15000 * 2) = 70000 + 45000 + 250000 + 30000 = 395000
    expect(result.subtotal).toBe(395000);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(395000);
    expect(result.appliedPromo).toBeNull();
    expect(result.outOfStockItems).toEqual([]);
  });

  it('2. should exclude out-of-stock items from subtotal and identify them in outOfStockItems', () => {
    const itemsWithOOS: CartItem[] = [
      { id: '1', name: 'Greenfields Fresh Milk 1L', category: 'Dairy', price: 35000, quantity: 2, inStock: true },
      { id: '2', name: 'Indomilk UHT Chocolate 1L', category: 'Dairy', price: 20000, quantity: 3, inStock: false }, // OOS (60,000)
      { id: '3', name: 'Barramundi Fillet 300g', category: 'Seafood', price: 80000, quantity: 1, inStock: true },
    ];

    const result = calculateCart(itemsWithOOS, []);

    // Subtotal should only be (35000 * 2) + 80000 = 150000
    expect(result.subtotal).toBe(150000);
    expect(result.total).toBe(150000);
    expect(result.outOfStockItems).toHaveLength(1);
    expect(result.outOfStockItems[0].id).toBe('2');
  });

  it('3. should calculate category percentage discount correctly and respect maxDiscount cap', () => {
    const dairyPromoWithCap: PromoRule = {
      id: 'promo-dairy-cap',
      name: '20% off Dairy (Max Rp 15.000)',
      type: 'CATEGORY_PERCENTAGE',
      category: 'Dairy',
      discountPercentage: 20,
      maxDiscount: 15000,
    };

    // In sampleItems: Dairy items are 70,000 + 45,000 = 115,000.
    // 20% of 115,000 = 23,000, but capped at 15,000.
    const result = calculateCart(sampleItems, [dairyPromoWithCap]);

    expect(result.subtotal).toBe(395000);
    expect(result.discount).toBe(15000);
    expect(result.total).toBe(380000);
    expect(result.appliedPromo?.id).toBe('promo-dairy-cap');
  });

  it('4. should apply ONLY the single highest-value promotion when multiple rules match', () => {
    const dairyPromo: PromoRule = {
      id: 'promo-dairy-15',
      name: '15% off Dairy',
      type: 'CATEGORY_PERCENTAGE',
      category: 'Dairy',
      discountPercentage: 15, // 15% of 115,000 = 17,250
    };

    const flatPromo: PromoRule = {
      id: 'promo-flat-50k',
      name: 'Rp 50.000 off min spend Rp 300.000',
      type: 'MIN_SPEND_FLAT',
      minSpend: 300000,
      discountAmount: 50000, // 50,000 discount
    };

    const smallFlatPromo: PromoRule = {
      id: 'promo-flat-10k',
      name: 'Rp 10.000 off min spend Rp 100.000',
      type: 'MIN_SPEND_FLAT',
      minSpend: 100000,
      discountAmount: 10000,
    };

    const result = calculateCart(sampleItems, [dairyPromo, flatPromo, smallFlatPromo]);

    // flatPromo gives Rp 50.000, which is higher than dairyPromo (17,250) and smallFlatPromo (10,000)
    expect(result.subtotal).toBe(395000);
    expect(result.discount).toBe(50000);
    expect(result.total).toBe(345000);
    expect(result.appliedPromo?.id).toBe('promo-flat-50k');
  });

  it('5. should handle edge cases: empty cart, OOS items dropping subtotal below promo threshold', () => {
    const items: CartItem[] = [
      { id: '1', name: 'Fresh Salmon 500g', category: 'Seafood', price: 200000, quantity: 1, inStock: false }, // OOS
      { id: '2', name: 'Apple Fuji 1kg', category: 'Produce', price: 45000, quantity: 2, inStock: true }, // 90,000
    ];

    const minSpendPromo: PromoRule = {
      id: 'promo-min-200k',
      name: 'Rp 30.000 off min spend Rp 200.000',
      type: 'MIN_SPEND_FLAT',
      minSpend: 200000,
      discountAmount: 30000,
    };

    // Subtotal is only 90,000 (Salmon is OOS). Does not meet 200,000 threshold.
    const result = calculateCart(items, [minSpendPromo]);

    expect(result.subtotal).toBe(90000);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(90000);
    expect(result.appliedPromo).toBeNull();
    expect(result.outOfStockItems).toHaveLength(1);

    // Empty cart check
    const emptyResult = calculateCart([], [minSpendPromo]);
    expect(emptyResult.subtotal).toBe(0);
    expect(emptyResult.discount).toBe(0);
    expect(emptyResult.total).toBe(0);
    expect(emptyResult.appliedPromo).toBeNull();
  });
});
