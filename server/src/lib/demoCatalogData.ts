export interface DemoProviderSeed {
  id: string;
  name: string;
  description: string;
}

export interface DemoProductSeed {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  priceUsdc: number;
  imageUrl: string;
  inStock: boolean;
  stockQty: number;
  rating: number | null;
  reviewCount: number;
  tags: string[];
  providerId: string;
}

function buildImageUrl(label: string): string {
  return `https://via.placeholder.com/400x400?text=${encodeURIComponent(label)}`;
}

export const demoProviders: DemoProviderSeed[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Fresh Lane",
    description: "Premium everyday groceries with clean labels and strong pantry coverage."
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Green Cart",
    description: "Organic-forward staples, produce, and dairy alternatives."
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Market Basket",
    description: "Budget-friendly basics across frozen, snacks, meats, and condiments."
  }
];

export const demoProducts: DemoProductSeed[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Organic Oat Milk 1L",
    brand: "Oatly",
    category: "beverages",
    description: "Smooth organic oat milk with a creamy finish for coffee, cereal, or baking.",
    priceUsdc: 4.79,
    imageUrl: buildImageUrl("Organic Oat Milk 1L"),
    inStock: true,
    stockQty: 28,
    rating: 4.7,
    reviewCount: 142,
    tags: ["organic", "vegan", "dairy-free"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Barista Oat Milk 1L",
    brand: "Minor Figures",
    category: "beverages",
    description: "Foams cleanly and balances espresso with a slightly sweet oat profile.",
    priceUsdc: 4.99,
    imageUrl: buildImageUrl("Barista Oat Milk 1L"),
    inStock: true,
    stockQty: 18,
    rating: 4.6,
    reviewCount: 88,
    tags: ["vegan", "dairy-free", "high-protein"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Whole Milk 2L",
    brand: "Farm Crest",
    category: "dairy",
    description: "Rich whole milk for everyday cooking, baking, and breakfast.",
    priceUsdc: 3.69,
    imageUrl: buildImageUrl("Whole Milk 2L"),
    inStock: true,
    stockQty: 30,
    rating: 4.5,
    reviewCount: 63,
    tags: ["dairy"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Unsalted Butter 250g",
    brand: "Golden Meadow",
    category: "dairy",
    description: "Creamy unsalted butter that melts evenly into batters and sauces.",
    priceUsdc: 4.29,
    imageUrl: buildImageUrl("Unsalted Butter 250g"),
    inStock: true,
    stockQty: 22,
    rating: 4.8,
    reviewCount: 104,
    tags: ["dairy", "baking"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "Free Range Eggs 12-Pack",
    brand: "Meadow Hen",
    category: "dairy",
    description: "Free range eggs with rich yolks for breakfast and reliable baking.",
    priceUsdc: 5.29,
    imageUrl: buildImageUrl("Free Range Eggs 12-Pack"),
    inStock: true,
    stockQty: 20,
    rating: 4.7,
    reviewCount: 85,
    tags: ["dairy", "baking", "high-protein"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    name: "Plain Flour 1kg",
    brand: "Baker's Mill",
    category: "baking",
    description: "Fine plain flour suited to cakes, cookies, batters, and sauces.",
    priceUsdc: 2.39,
    imageUrl: buildImageUrl("Plain Flour 1kg"),
    inStock: true,
    stockQty: 34,
    rating: 4.7,
    reviewCount: 91,
    tags: ["baking", "pantry"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    name: "Granulated Sugar 1kg",
    brand: "Sweet Pantry",
    category: "baking",
    description: "Classic white sugar that dissolves cleanly in cakes, glazes, and drinks.",
    priceUsdc: 2.19,
    imageUrl: buildImageUrl("Granulated Sugar 1kg"),
    inStock: true,
    stockQty: 31,
    rating: 4.5,
    reviewCount: 64,
    tags: ["baking", "pantry"],
    providerId: "33333333-3333-4333-8333-333333333333"
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    name: "Cocoa Powder 250g",
    brand: "Cacao House",
    category: "baking",
    description: "Deep cocoa powder for brownies, cakes, hot chocolate, and frosting.",
    priceUsdc: 3.99,
    imageUrl: buildImageUrl("Cocoa Powder 250g"),
    inStock: true,
    stockQty: 19,
    rating: 4.8,
    reviewCount: 72,
    tags: ["baking", "chocolate"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    name: "Baking Powder 200g",
    brand: "Rise Up",
    category: "baking",
    description: "Double-acting baking powder for reliable lift in cakes and muffins.",
    priceUsdc: 1.89,
    imageUrl: buildImageUrl("Baking Powder 200g"),
    inStock: true,
    stockQty: 27,
    rating: 4.6,
    reviewCount: 49,
    tags: ["baking"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    name: "Vanilla Extract 50ml",
    brand: "Pure Pantry",
    category: "baking",
    description: "Fragrant vanilla extract that lifts cakes, custards, and cookies.",
    priceUsdc: 4.49,
    imageUrl: buildImageUrl("Vanilla Extract 50ml"),
    inStock: true,
    stockQty: 10,
    rating: 4.9,
    reviewCount: 58,
    tags: ["baking"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    name: "Greek Yogurt 500g",
    brand: "Cloud Valley",
    category: "dairy",
    description: "Thick natural yogurt with a tangy profile and extra protein.",
    priceUsdc: 5.49,
    imageUrl: buildImageUrl("Greek Yogurt 500g"),
    inStock: false,
    stockQty: 0,
    rating: null,
    reviewCount: 0,
    tags: ["high-protein", "dairy"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    name: "Sea Salt Tortilla Chips",
    brand: "Crunch Co",
    category: "snacks",
    description: "Crisp corn tortilla chips with just enough sea salt.",
    priceUsdc: 3.59,
    imageUrl: buildImageUrl("Sea Salt Tortilla Chips"),
    inStock: true,
    stockQty: 26,
    rating: 4.2,
    reviewCount: 37,
    tags: ["snacks", "vegan", "gluten-free"],
    providerId: "33333333-3333-4333-8333-333333333333"
  },
  {
    id: "10000000-0000-4000-8000-000000000013",
    name: "Spaghetti 500g",
    brand: "Casa Pasta",
    category: "pantry",
    description: "Durum wheat spaghetti with a firm bite for weeknight dinners.",
    priceUsdc: 2.29,
    imageUrl: buildImageUrl("Spaghetti 500g"),
    inStock: true,
    stockQty: 35,
    rating: 4.6,
    reviewCount: 83,
    tags: ["pantry", "vegan"],
    providerId: "33333333-3333-4333-8333-333333333333"
  },
  {
    id: "10000000-0000-4000-8000-000000000014",
    name: "Bananas 1kg",
    brand: "Sun Orchard",
    category: "produce",
    description: "Sweet bananas sized for snacks, smoothies, and baking.",
    priceUsdc: 2.49,
    imageUrl: buildImageUrl("Bananas 1kg"),
    inStock: true,
    stockQty: 40,
    rating: 4.4,
    reviewCount: 55,
    tags: ["produce", "vegan"],
    providerId: "33333333-3333-4333-8333-333333333333"
  }
];
