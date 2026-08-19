# Case Study 03: The Item Substitution Algorithm

## 🥦 Background & Context
At HappyFresh, trained personal shoppers (Pickers) walk the aisles of supermarkets like Super Indo or Grand Lucky picking items ordered by customers. When an item is unexpectedly out of stock on the shelf (e.g. "Indomilk UHT Plain 1L"), the mobile picking app must instantly recommend the best in-stock alternative to offer the customer.

A poor substitution recommendation (e.g., suggesting laundry detergent for milk, or a product 3x the price) creates friction and customer churn. 

In this challenge, you will implement a rule-based scoring algorithm in `substituteItem.ts` that evaluates potential replacement items from the catalog.

---

## 🎯 Requirements

1. **Scoring Criteria**:
   Given a target `CartItem` and a catalog of candidate `Product` objects, score each candidate product based on:
   - **Exact Category Match**: **+50 points** (e.g. both are `"Dairy"`, case-insensitive).
   - **Price Proximity (±10% Range)**: **+30 points** if candidate's price is within `[targetPrice * 0.9, targetPrice * 1.1]` inclusive.
   - **Same Brand Match**: **+20 points** (e.g. both are `"Indomilk"`, case-insensitive).

2. **Exclusion Filters**:
   - Items with `inStock === false` must be excluded from candidate evaluation.
   - The target item itself (matching `id`) must be excluded from being recommended as its own substitute.

3. **Threshold & Selection**:
   - By default, candidates must reach a minimum score of **50 points** (`minScoreThreshold = 50`) to be considered viable.
   - Return the highest-scoring candidate `Product`.
   - If no candidates score at or above the threshold, or catalog is empty, return `null`.

4. **Deterministic Tie-Breaking**:
   If two or more candidates have the exact same highest score:
   - **1st Tie-Breaker**: Pick the candidate with the smallest absolute price difference (`Math.abs(candidate.price - target.price)`).
   - **2nd Tie-Breaker**: If price differences are identical, pick the candidate whose `name` comes first alphabetically (`localeCompare`).

---

## 📥 Input / Output Schema

### Input
- `targetItem`: `CartItem`
- `catalog`: `Product[]`
- `options` (optional): `SubstitutionOptions` (`minScoreThreshold?: number; priceTolerancePercent?: number;`)

### Output
- `Product | null`

---

## 💡 Example

```typescript
const targetItem: CartItem = {
  id: "target-1",
  name: "Indomilk Fresh Milk Plain 1L",
  category: "Dairy",
  brand: "Indomilk",
  price: 25000,
};

const catalog: Product[] = [
  {
    id: "p-1",
    name: "Ultra Milk Plain 1L",
    category: "Dairy",
    brand: "Ultra Jaya",
    price: 26000, // Price diff: 1,000 (within 10% -> 22,500 - 27,500)
    inStock: true,
  },
  {
    id: "p-2",
    name: "Indomilk Sweetened Condensed Milk 370g",
    category: "Canned Goods",
    brand: "Indomilk",
    price: 14000,
    inStock: true,
  },
  {
    id: "p-3",
    name: "Diamond Fresh Milk 1L",
    category: "Dairy",
    brand: "Diamond",
    price: 32000, // Price diff: 7,000 (> 10% tolerance)
    inStock: true,
  }
];

// p-1: Category (+50) + Price Proximity (+30) = 80 pts
// p-2: Brand (+20) = 20 pts (below 50 threshold)
// p-3: Category (+50) = 50 pts
// Result: Returns p-1 (Ultra Milk Plain 1L)
```

---

## 🧪 Running the Tests
```bash
npm test challenges/03-item-substitution/index.test.ts
```
