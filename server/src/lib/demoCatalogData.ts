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

/** Curated Unsplash crops for demo milk and plant-milk rows (stable CDN). */
const IMG_OAT_BARISTA =
  "https://images.unsplash.com/photo-1610725664369-f1cd49f33a98?auto=format&w=600&h=600&fit=crop&q=80";
const IMG_WHOLE_DAIRY =
  "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&w=600&h=600&fit=crop&q=80";
const IMG_SKIM =
  "https://images.unsplash.com/photo-1550583724-b2692b85cc6b?auto=format&w=600&h=600&fit=crop&q=80";
const IMG_CHOCOLATE =
  "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&w=600&h=600&fit=crop&q=80";
const IMG_ALMOND =
  "https://images.unsplash.com/photo-1545996124-0501ebae84d5?auto=format&w=600&h=600&fit=crop&q=80";
const IMG_SOY =
  "https://images.unsplash.com/photo-1613478223719-2eb604204df0?auto=format&w=600&h=600&fit=crop&q=80";
const IMG_LACTOSE_FREE =
  "https://images.unsplash.com/photo-1600718377412-06d132faa112?auto=format&w=600&h=600&fit=crop&q=80";
const IMG_A2 =
  "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5283856.png";

export const demoProviders: DemoProviderSeed[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Countdown",
    description: "National supermarket with broad everyday grocery coverage."
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Pak'nSave",
    description: "Value-focused range for budget-friendly household staples."
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "New World",
    description: "Full-service grocery selection with premium and specialty options."
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Four Square",
    description: "Convenience-oriented neighbourhood grocery with quick essentials."
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Fresh Choice",
    description: "Fresh produce and local pantry picks with curated ranges."
  }
];

export const demoProducts: DemoProductSeed[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "A2 Fresh Milk 1L",
    brand: "A2",
    category: "beverages",
    description: "Fresh A2 milk for everyday cereal, coffee, and baking.",
    priceUsdc: 0.49,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5283856.png",
    inStock: true,
    stockQty: 32,
    rating: 4.6,
    reviewCount: 148,
    tags: ["dairy", "milk"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Barista Oat Milk 2L",
    brand: "Minor Figures",
    category: "beverages",
    description: "Foams cleanly with a creamy oat body for larger household use.",
    priceUsdc: 0.29,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5014501.png",
    inStock: true,
    stockQty: 20,
    rating: 4.6,
    reviewCount: 88,
    tags: ["vegan", "dairy-free", "milk"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Whole Milk 1L",
    brand: "Farm Crest",
    category: "dairy",
    description: "Classic whole milk in a compact bottle.",
    priceUsdc: 0.79,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5123764.png",
    inStock: true,
    stockQty: 30,
    rating: 4.5,
    reviewCount: 63,
    tags: ["dairy", "milk"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Unsalted Butter 250g",
    brand: "Golden Meadow",
    category: "dairy",
    description: "Creamy unsalted butter that melts evenly into batters and sauces.",
    priceUsdc: 0.29,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5002843.png",
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
    priceUsdc: 0.29,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5012010.png",
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
    priceUsdc: 0.39,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5003829.png",
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
    priceUsdc: 0.29,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5002760.png?w=384",
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
    priceUsdc: 0.99,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5007274.png?w=384",
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
    priceUsdc: 0.89,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5002652.png?w=384",
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
    priceUsdc: 0.49,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5324722.png?w=384",
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
    priceUsdc: 0.49,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5223553.png?w=384",
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
    priceUsdc: 0.59,
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
    priceUsdc: 0.29,
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
    priceUsdc: 0.49,
    imageUrl: buildImageUrl("Bananas 1kg"),
    inStock: true,
    stockQty: 40,
    rating: 4.4,
    reviewCount: 55,
    tags: ["produce", "vegan"],
    providerId: "33333333-3333-4333-8333-333333333333"
  },
  {
    id: "10000000-0000-4000-8000-000000000015",
    name: "Skim Milk 2L",
    brand: "Farm Crest",
    category: "dairy",
    description: "Light skim milk with a clean dairy taste for cereal and everyday drinking.",
    priceUsdc: 0.49,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5201487.png?w=384",
    inStock: true,
    stockQty: 36,
    rating: 4.4,
    reviewCount: 54,
    tags: ["dairy", "low-fat", "milk"],
    providerId: "44444444-4444-4444-8444-444444444444"
  },
  {
    id: "10000000-0000-4000-8000-000000000016",
    name: "Chocolate Milk 1L",
    brand: "Morning Moo",
    category: "beverages",
    description: "Creamy chocolate milk made with real cocoa—great cold from the fridge.",
    priceUsdc: 0.49,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5027126.png?w=384",
    inStock: true,
    stockQty: 24,
    rating: 4.6,
    reviewCount: 112,
    tags: ["dairy", "beverages", "milk"],
    providerId: "33333333-3333-4333-8333-333333333333"
  },
  {
    id: "10000000-0000-4000-8000-000000000017",
    name: "Unsweetened Almond Milk 1L",
    brand: "Blue Orchard",
    category: "beverages",
    description: "Zero-sugar almond milk with a mild nutty note for smoothies and overnight oats.",
    priceUsdc: 0.99,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5030869.png?w=384",
    inStock: true,
    stockQty: 32,
    rating: 4.5,
    reviewCount: 203,
    tags: ["vegan", "dairy-free", "milk"],
    providerId: "55555555-5555-4555-8555-555555555555"
  },
  {
    id: "10000000-0000-4000-8000-000000000018",
    name: "Organic Soy Milk 1L",
    brand: "Pacific Roots",
    category: "beverages",
    description: "Organic soy milk with a smooth body for coffee, baking, and savory sauces.",
    priceUsdc: 0.29,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5003852.png?w=384",
    inStock: true,
    stockQty: 21,
    rating: 4.3,
    reviewCount: 76,
    tags: ["organic", "vegan", "dairy-free", "milk"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000019",
    name: "Lactose-Free Whole Milk 2L",
    brand: "Easy Dairy",
    category: "dairy",
    description: "Real whole milk without lactose—gentle on sensitive stomachs.",
    priceUsdc: 0.79,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5305891.png?w=384",
    inStock: true,
    stockQty: 27,
    rating: 4.7,
    reviewCount: 98,
    tags: ["dairy", "lactose-free", "milk"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000020",
    name: "A2 Protein Whole Milk 2L",
    brand: "Heritage Fields",
    category: "dairy",
    description: "Whole milk from cows selected for A2 beta-casein protein for easier digestion.",
    priceUsdc: 0.49,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5027208.png?w=384",
    inStock: true,
    stockQty: 15,
    rating: 4.8,
    reviewCount: 41,
    tags: ["dairy", "high-protein", "milk"],
    providerId: "55555555-5555-4555-8555-555555555555"
  },
  {
    id: "10000000-0000-4000-8000-000000000021",
    name: "Goat Milk 1L",
    brand: "Hillside Dairy",
    category: "dairy",
    description: "Mild and creamy goat milk for specialty diets.",
    priceUsdc: 0.99,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5033117.png?w=384",
    inStock: true,
    stockQty: 11,
    rating: 4.4,
    reviewCount: 27,
    tags: ["dairy", "milk"],
    providerId: "33333333-3333-4333-8333-333333333333"
  },
  {
    id: "10000000-0000-4000-8000-000000000022",
    name: "Organic Jersey Milk 2L",
    brand: "Meadow Gold",
    category: "dairy",
    description: "Rich organic Jersey milk with full cream texture.",
    priceUsdc: 0.5,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5255601.png?w=384",
    inStock: true,
    stockQty: 10,
    rating: 4.7,
    reviewCount: 19,
    tags: ["organic", "dairy", "milk"],
    providerId: "44444444-4444-4444-8444-444444444444"
  },
  {
    id: "10000000-0000-4000-8000-000000000023",
    name: "Premium Lactose-Free Milk 3L",
    brand: "Silk Valley",
    category: "dairy",
    description: "Family-size lactose-free milk with creamy taste.",
    priceUsdc: 0.99,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5317043.png?w=384",
    inStock: true,
    stockQty: 9,
    rating: 4.5,
    reviewCount: 13,
    tags: ["dairy", "lactose-free", "milk"],
    providerId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "10000000-0000-4000-8000-000000000024",
    name: "Chef's Gold Milk 3L",
    brand: "Chef's Gold",
    category: "dairy",
    description: "Premium milk chosen for cafe and bakery use.",
    priceUsdc: 0.49,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5016750.png?w=384",
    inStock: true,
    stockQty: 7,
    rating: 4.6,
    reviewCount: 11,
    tags: ["dairy", "milk"],
    providerId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "10000000-0000-4000-8000-000000000025",
    name: "Artisan Farm Reserve Milk 5L",
    brand: "Heritage Reserve",
    category: "dairy",
    description: "Small-batch reserve milk in a large format for specialty kitchens.",
    priceUsdc: 0.99,
    imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5201489.png?w=384",
    inStock: true,
    stockQty: 5,
    rating: 4.9,
    reviewCount: 8,
    tags: ["dairy", "milk"],
    providerId: "33333333-3333-4333-8333-333333333333"
  }
];
