import { findBestSubstitute, CartItem, Product } from './index';

describe('HappyFresh Item Substitution Algorithm', () => {
  const targetItem: CartItem = {
    id: 'target-1',
    name: 'Indomilk UHT Chocolate 1L',
    category: 'Dairy',
    brand: 'Indomilk',
    price: 20000,
  };

  it('1. should select the candidate with highest total score (category + price range + brand)', () => {
    const catalog: Product[] = [
      {
        id: 'p-1',
        name: 'Ultra Milk Chocolate 1L',
        category: 'Dairy',
        brand: 'Ultra Jaya',
        price: 21000, // Category (50) + Price Range within 10% (30) = 80 pts
        inStock: true,
      },
      {
        id: 'p-2',
        name: 'Indomilk UHT Vanilla 1L',
        category: 'Dairy',
        brand: 'Indomilk',
        price: 20000, // Category (50) + Price Range (30) + Brand (20) = 100 pts
        inStock: true,
      },
      {
        id: 'p-3',
        name: 'Greenfields Fresh Chocolate Milk 1L',
        category: 'Dairy',
        brand: 'Greenfields',
        price: 36000, // Category (50) only = 50 pts
        inStock: true,
      },
    ];

    const result = findBestSubstitute(targetItem, catalog);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('p-2');
    expect(result?.name).toBe('Indomilk UHT Vanilla 1L');
  });

  it('2. should return null if no product meets the minimum score threshold (default 50)', () => {
    const catalog: Product[] = [
      {
        id: 'p-other-1',
        name: 'Indomilk Sweetened Condensed Milk 370g',
        category: 'Canned Goods', // Not Dairy -> 0 pts for category
        brand: 'Indomilk',        // Brand match = 20 pts (below 50)
        price: 13000,
        inStock: true,
      },
      {
        id: 'p-other-2',
        name: 'Bimoli Cooking Oil 2L',
        category: 'Pantry',
        brand: 'Bimoli',
        price: 38000, // 0 pts
        inStock: true,
      },
    ];

    const result = findBestSubstitute(targetItem, catalog);
    expect(result).toBeNull();
  });

  it('3. should exclude out-of-stock items and the target product itself from substitution', () => {
    const catalog: Product[] = [
      {
        id: 'target-1', // Same ID as target item
        name: 'Indomilk UHT Chocolate 1L',
        category: 'Dairy',
        brand: 'Indomilk',
        price: 20000,
        inStock: true,
      },
      {
        id: 'p-perfect-match-oos',
        name: 'Indomilk UHT Chocolate Low Fat 1L',
        category: 'Dairy',
        brand: 'Indomilk',
        price: 20000,
        inStock: false, // Out of stock -> MUST BE EXCLUDED
      },
      {
        id: 'p-available-alt',
        name: 'Frisian Flag Chocolate 946ml',
        category: 'Dairy',
        brand: 'Frisian Flag',
        price: 19500, // Category (50) + Price Range (30) = 80 pts
        inStock: true,
      },
    ];

    const result = findBestSubstitute(targetItem, catalog);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('p-available-alt');
  });

  it('4. should apply deterministic tie-breaking: smallest price difference first, then alphabetical name', () => {
    const catalog: Product[] = [
      {
        id: 'p-alpha-b',
        name: 'Ultra Milk Plain 1L',
        category: 'Dairy',
        brand: 'Ultra Jaya',
        price: 21500, // Category (50) + Price within 10% (30) = 80 pts. Diff: 1,500
        inStock: true,
      },
      {
        id: 'p-alpha-a',
        name: 'Diamond Milk Plain 1L',
        category: 'Dairy',
        brand: 'Diamond',
        price: 20500, // Category (50) + Price within 10% (30) = 80 pts. Diff: 500 (closer!)
        inStock: true,
      },
      {
        id: 'p-alpha-c',
        name: 'Anchor Milk Plain 1L',
        category: 'Dairy',
        brand: 'Anchor',
        price: 20500, // Category (50) + Price within 10% (30) = 80 pts. Diff: 500. Alphabetically before Diamond!
        inStock: true,
      },
    ];

    // Both Anchor and Diamond have score 80 and diff 500. 'Anchor' comes before 'Diamond' alphabetically.
    const result = findBestSubstitute(targetItem, catalog);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('p-alpha-c');
    expect(result?.name).toBe('Anchor Milk Plain 1L');
  });

  it('5. should support custom options and handle empty catalog gracefully', () => {
    const emptyResult = findBestSubstitute(targetItem, []);
    expect(emptyResult).toBeNull();

    const catalog: Product[] = [
      {
        id: 'p-lenient',
        name: 'Indomilk Condensed Milk 370g',
        category: 'Canned Goods',
        brand: 'Indomilk', // 20 pts
        price: 14000,
        inStock: true,
      },
    ];

    // With custom minScoreThreshold: 20, p-lenient should pass
    const lenientResult = findBestSubstitute(targetItem, catalog, { minScoreThreshold: 20 });
    expect(lenientResult).not.toBeNull();
    expect(lenientResult?.id).toBe('p-lenient');
  });
});
