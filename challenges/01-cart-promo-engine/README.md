# Case Study 01: Complex Cart & Promo Engine

## 🛒 Background & Context
At HappyFresh, our checkout engine handles thousands of basket calculations per minute across partner supermarket chains (e.g., Super Indo, Grand Lucky, Lotte Mart). When customers proceed to checkout, the cart calculation service must reliably compute item subtotals, filter out out-of-stock items, and evaluate complex promotional campaign rules.

In this challenge, you will implement the core calculation and promotional evaluation logic in `cartEngine.ts`.

---

## 🎯 Requirements

1. **Subtotal Calculation**:
   - Compute the subtotal by multiplying `price * quantity` for each item.
   - **Out-of-Stock Filter**: Items where `inStock === false` must be excluded from subtotal calculations and captured in the `outOfStockItems` return array.
   - Negative quantities or prices should be treated as `0` or filtered out.

2. **Dynamic Promotion Rules**:
   - **`CATEGORY_PERCENTAGE`**: Discounts a percentage (e.g., `10%`) off eligible items in a specific category (e.g., `"Dairy"`). If a `maxDiscount` cap is specified, the discount cannot exceed this cap.
   - **`MIN_SPEND_FLAT`**: Grants a fixed discount (e.g., `Rp 50.000`) if the in-stock subtotal meets or exceeds `minSpend` (e.g., `Rp 300.000`).

3. **Promo Stacking Policy (Best-Value Rule)**:
   - HappyFresh promotions are **mutually exclusive** (non-stackable).
   - If multiple promo rules match the cart, apply **only the single rule that yields the highest monetary discount**.
   - If no promo rules qualify or `promos` array is empty, `discount` is `0` and `appliedPromo` is `null`.
   - If multiple promos yield the exact same highest discount, apply the first one encountered in the rules array.

4. **Total Calculation & Safety**:
   - `total = subtotal - discount`
   - Total can never be negative (minimum `0`).
   - All monetary amounts should be rounded to 2 decimal places or nearest integer where applicable.

---

## 📥 Input / Output Schema

### Input
- `items`: `CartItem[]`
- `promoRules`: `PromoRule[]`

### Output: `CartCalculationResult`
```typescript
interface CartCalculationResult {
  subtotal: number;
  discount: number;
  total: number;
  appliedPromo: PromoRule | null;
  outOfStockItems: CartItem[];
}
```

---

## 💡 Example

```typescript
const items: CartItem[] = [
  { id: "item-1", name: "Greenfields Fresh Milk 1L", category: "Dairy", price: 35000, quantity: 2, inStock: true },
  { id: "item-2", name: "Indomilk UHT Chocolate 1L", category: "Dairy", price: 20000, quantity: 1, inStock: false }, // OOS
  { id: "item-3", name: "Wagyu Beef Ribeye 200g", category: "Meat", price: 250000, quantity: 1, inStock: true },
];

const promoRules: PromoRule[] = [
  {
    id: "promo-dairy-10",
    name: "10% Off Dairy",
    type: "CATEGORY_PERCENTAGE",
    category: "Dairy",
    discountPercentage: 10,
  },
  {
    id: "promo-flat-50k",
    name: "Rp 50k Off Orders > Rp 300k",
    type: "MIN_SPEND_FLAT",
    minSpend: 300000,
    discountAmount: 50000,
  }
];

// Subtotal = (35000 * 2) + 250000 = 320,000 (OOS Indomilk excluded)
// Promo 1: Dairy items total = 70,000 * 10% = 7,000 discount
// Promo 2: Subtotal 320,000 >= 300,000 -> 50,000 discount
// Best Promo: Promo 2 (50,000 > 7,000)
// Total = 320,000 - 50,000 = 270,000
```

---

## 🧪 Running the Tests
```bash
npm test challenges/01-cart-promo-engine/index.test.ts
```
