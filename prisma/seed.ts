import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const providers = [
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
] as const;

function buildImageUrl(label: string): string {
  return `https://via.placeholder.com/400x400?text=${encodeURIComponent(label)}`;
}

const products: Prisma.ProductCreateManyInput[] = [
  {
    name: "A2 Fresh Milk 1L",
    brand: "A2",
    category: "beverages",
    description: "Fresh A2 milk for everyday cereal, coffee, and baking.",
    priceUsdc: "5.49",
    imageUrl: buildImageUrl("A2 Fresh Milk 1L"),
    inStock: true,
    stockQty: 32,
    rating: "4.6",
    reviewCount: 148,
    tags: ["dairy", "milk"],
    providerId: providers[1].id
  },
  {
    name: "Barista Oat Milk 2L",
    brand: "Minor Figures",
    category: "beverages",
    description: "Foams cleanly with a creamy oat body for larger household use.",
    priceUsdc: "6.29",
    imageUrl: buildImageUrl("Barista Oat Milk 2L"),
    inStock: true,
    stockQty: 20,
    rating: "4.6",
    reviewCount: 88,
    tags: ["vegan", "dairy-free", "milk"],
    providerId: providers[0].id
  },
  {
    name: "Whole Milk 1L",
    brand: "Farm Crest",
    category: "dairy",
    description: "Classic whole milk in a compact bottle.",
    priceUsdc: "4.79",
    imageUrl: buildImageUrl("Whole Milk 1L"),
    inStock: true,
    stockQty: 30,
    rating: "4.5",
    reviewCount: 63,
    tags: ["dairy", "milk"],
    providerId: providers[0].id
  },
  {
    name: "Unsalted Butter 250g",
    brand: "Golden Meadow",
    category: "dairy",
    description: "Creamy unsalted butter that melts evenly into batters and sauces.",
    priceUsdc: "4.29",
    imageUrl: buildImageUrl("Unsalted Butter 250g"),
    inStock: true,
    stockQty: 22,
    rating: "4.8",
    reviewCount: 104,
    tags: ["dairy", "baking"],
    providerId: providers[0].id
  },
  {
    name: "Greek Yogurt 500g",
    brand: "Cloud Valley",
    category: "dairy",
    description: "Thick natural yogurt with a tangy profile and extra protein.",
    priceUsdc: "5.49",
    imageUrl: buildImageUrl("Greek Yogurt 500g"),
    inStock: false,
    stockQty: 0,
    rating: null,
    reviewCount: 0,
    tags: ["high-protein", "dairy"],
    providerId: providers[1].id
  },
  {
    name: "Bananas 1kg",
    brand: "Sun Orchard",
    category: "produce",
    description: "Sweet bananas sized for snacks, smoothies, and baking.",
    priceUsdc: "2.49",
    imageUrl: buildImageUrl("Bananas 1kg"),
    inStock: true,
    stockQty: 40,
    rating: "4.4",
    reviewCount: 55,
    tags: ["produce", "vegan"],
    providerId: providers[2].id
  },
  {
    name: "Baby Spinach 120g",
    brand: "Leaf & Stem",
    category: "produce",
    description: "Tender baby spinach for salads, pasta, and morning omelettes.",
    priceUsdc: "3.19",
    imageUrl: buildImageUrl("Baby Spinach 120g"),
    inStock: true,
    stockQty: 19,
    rating: "4.2",
    reviewCount: 31,
    tags: ["organic", "vegan", "produce"],
    providerId: providers[1].id
  },
  {
    name: "Hass Avocados 2-Pack",
    brand: "Green Valley",
    category: "produce",
    description: "Ready-to-ripen avocados with buttery texture for toast and salads.",
    priceUsdc: "3.99",
    imageUrl: buildImageUrl("Hass Avocados 2-Pack"),
    inStock: false,
    stockQty: 0,
    rating: null,
    reviewCount: 0,
    tags: ["produce", "vegan"],
    providerId: providers[1].id
  },
  {
    name: "Sourdough Bread Loaf",
    brand: "Stone Oven",
    category: "bakery",
    description: "Crackly crust and airy crumb with a mild fermented tang.",
    priceUsdc: "5.29",
    imageUrl: buildImageUrl("Sourdough Bread Loaf"),
    inStock: true,
    stockQty: 14,
    rating: "4.8",
    reviewCount: 77,
    tags: ["bakery"],
    providerId: providers[0].id
  },
  {
    name: "Brioche Burger Buns 6-Pack",
    brand: "Bake House",
    category: "bakery",
    description: "Soft brioche buns with a rich crumb that hold up to juicy burgers.",
    priceUsdc: "4.39",
    imageUrl: buildImageUrl("Brioche Burger Buns 6-Pack"),
    inStock: true,
    stockQty: 12,
    rating: "4.3",
    reviewCount: 28,
    tags: ["bakery"],
    providerId: providers[2].id
  },
  {
    name: "Everything Bagels 4-Pack",
    brand: "Morning Bake",
    category: "bakery",
    description: "Chewy bagels with sesame, onion, garlic, and poppy seed topping.",
    priceUsdc: "4.09",
    imageUrl: buildImageUrl("Everything Bagels 4-Pack"),
    inStock: false,
    stockQty: 0,
    rating: null,
    reviewCount: 0,
    tags: ["bakery"],
    providerId: providers[2].id
  },
  {
    name: "Sparkling Water 8-Pack",
    brand: "Clear Current",
    category: "beverages",
    description: "Crisp sparkling water with fine bubbles and no added sugar.",
    priceUsdc: "6.19",
    imageUrl: buildImageUrl("Sparkling Water 8-Pack"),
    inStock: true,
    stockQty: 21,
    rating: "4.1",
    reviewCount: 19,
    tags: ["beverages", "vegan"],
    providerId: providers[2].id
  },
  {
    name: "Orange Juice 1L",
    brand: "Sun Press",
    category: "beverages",
    description: "Fresh-tasting orange juice with bright citrus flavor and no pulp.",
    priceUsdc: "4.59",
    imageUrl: buildImageUrl("Orange Juice 1L"),
    inStock: true,
    stockQty: 17,
    rating: "4.0",
    reviewCount: 24,
    tags: ["beverages"],
    providerId: providers[0].id
  },
  {
    name: "Spaghetti 500g",
    brand: "Casa Pasta",
    category: "pantry",
    description: "Durum wheat spaghetti with a firm bite for weeknight dinners.",
    priceUsdc: "2.29",
    imageUrl: buildImageUrl("Spaghetti 500g"),
    inStock: true,
    stockQty: 35,
    rating: "4.6",
    reviewCount: 83,
    tags: ["pantry", "vegan"],
    providerId: providers[2].id
  },
  {
    name: "Jasmine Rice 1kg",
    brand: "Golden Bowl",
    category: "pantry",
    description: "Fragrant jasmine rice with fluffy grains that stay tender after cooking.",
    priceUsdc: "3.79",
    imageUrl: buildImageUrl("Jasmine Rice 1kg"),
    inStock: true,
    stockQty: 29,
    rating: "4.5",
    reviewCount: 67,
    tags: ["pantry", "gluten-free", "vegan"],
    providerId: providers[2].id
  },
  {
    name: "Extra Virgin Olive Oil 500ml",
    brand: "Oliva Alta",
    category: "pantry",
    description: "Peppery extra virgin olive oil for dressings, roasting, and finishing.",
    priceUsdc: "8.99",
    imageUrl: buildImageUrl("Extra Virgin Olive Oil 500ml"),
    inStock: true,
    stockQty: 16,
    rating: "4.9",
    reviewCount: 112,
    tags: ["pantry", "organic", "vegan"],
    providerId: providers[0].id
  },
  {
    name: "Chicken Breast Fillets 500g",
    brand: "Field Butcher",
    category: "meat",
    description: "Lean trimmed chicken breast fillets for quick weeknight meals.",
    priceUsdc: "9.49",
    imageUrl: buildImageUrl("Chicken Breast Fillets 500g"),
    inStock: true,
    stockQty: 11,
    rating: "4.4",
    reviewCount: 39,
    tags: ["meat", "high-protein"],
    providerId: providers[0].id
  },
  {
    name: "Ground Beef 500g",
    brand: "Butcher's Table",
    category: "meat",
    description: "Versatile medium-fat mince for burgers, pasta sauces, and tacos.",
    priceUsdc: "8.79",
    imageUrl: buildImageUrl("Ground Beef 500g"),
    inStock: true,
    stockQty: 13,
    rating: "4.3",
    reviewCount: 41,
    tags: ["meat", "high-protein"],
    providerId: providers[2].id
  },
  {
    name: "Streaky Bacon 250g",
    brand: "Smoky Ridge",
    category: "meat",
    description: "Naturally smoked bacon with balanced fat for crisp breakfast slices.",
    priceUsdc: "5.99",
    imageUrl: buildImageUrl("Streaky Bacon 250g"),
    inStock: false,
    stockQty: 0,
    rating: null,
    reviewCount: 0,
    tags: ["meat", "breakfast"],
    providerId: providers[2].id
  },
  {
    name: "Frozen Mixed Berries 500g",
    brand: "North Farm",
    category: "frozen",
    description: "Blend of strawberries, blueberries, and raspberries for smoothies and desserts.",
    priceUsdc: "6.49",
    imageUrl: buildImageUrl("Frozen Mixed Berries 500g"),
    inStock: true,
    stockQty: 20,
    rating: "4.8",
    reviewCount: 73,
    tags: ["frozen", "vegan"],
    providerId: providers[1].id
  },
  {
    name: "Frozen Margherita Pizza",
    brand: "Stone Hearth",
    category: "frozen",
    description: "Thin-crust margherita pizza with mozzarella and basil.",
    priceUsdc: "7.29",
    imageUrl: buildImageUrl("Frozen Margherita Pizza"),
    inStock: true,
    stockQty: 15,
    rating: "4.0",
    reviewCount: 25,
    tags: ["frozen"],
    providerId: providers[2].id
  },
  {
    name: "Frozen Peas 500g",
    brand: "Farm Frost",
    category: "frozen",
    description: "Sweet green peas picked and frozen quickly for easy weeknight sides.",
    priceUsdc: "2.89",
    imageUrl: buildImageUrl("Frozen Peas 500g"),
    inStock: false,
    stockQty: 0,
    rating: null,
    reviewCount: 0,
    tags: ["frozen", "vegan"],
    providerId: providers[0].id
  },
  {
    name: "High-Protein Chocolate Bar",
    brand: "Fuel Bite",
    category: "snacks",
    description: "Chocolate snack bar with added protein and a soft center.",
    priceUsdc: "2.79",
    imageUrl: buildImageUrl("High-Protein Chocolate Bar"),
    inStock: true,
    stockQty: 33,
    rating: "4.1",
    reviewCount: 58,
    tags: ["snacks", "high-protein"],
    providerId: providers[0].id
  },
  {
    name: "Sea Salt Tortilla Chips",
    brand: "Crunch Co",
    category: "snacks",
    description: "Crisp corn tortilla chips with just enough sea salt.",
    priceUsdc: "3.59",
    imageUrl: buildImageUrl("Sea Salt Tortilla Chips"),
    inStock: true,
    stockQty: 26,
    rating: "4.2",
    reviewCount: 37,
    tags: ["snacks", "vegan", "gluten-free"],
    providerId: providers[2].id
  },
  {
    name: "Roasted Almonds 200g",
    brand: "Nut Grove",
    category: "snacks",
    description: "Dry-roasted almonds with a clean crunch and simple ingredient list.",
    priceUsdc: "5.19",
    imageUrl: buildImageUrl("Roasted Almonds 200g"),
    inStock: true,
    stockQty: 18,
    rating: "4.6",
    reviewCount: 44,
    tags: ["snacks", "vegan", "high-protein"],
    providerId: providers[1].id
  },
  {
    name: "Tomato Ketchup 500ml",
    brand: "Red Pantry",
    category: "condiments",
    description: "Classic tomato ketchup with a balanced sweet-savory finish.",
    priceUsdc: "2.99",
    imageUrl: buildImageUrl("Tomato Ketchup 500ml"),
    inStock: true,
    stockQty: 24,
    rating: "4.4",
    reviewCount: 51,
    tags: ["condiments"],
    providerId: providers[2].id
  },
  {
    name: "Dijon Mustard 200g",
    brand: "Maison Gold",
    category: "condiments",
    description: "Smooth Dijon mustard with sharp heat and a clean finish.",
    priceUsdc: "3.49",
    imageUrl: buildImageUrl("Dijon Mustard 200g"),
    inStock: true,
    stockQty: 12,
    rating: "4.7",
    reviewCount: 22,
    tags: ["condiments"],
    providerId: providers[0].id
  },
  {
    name: "Classic Mayonnaise 400g",
    brand: "Kitchen Table",
    category: "condiments",
    description: "Creamy mayonnaise for sandwiches, dressings, and dipping sauces.",
    priceUsdc: "3.89",
    imageUrl: buildImageUrl("Classic Mayonnaise 400g"),
    inStock: true,
    stockQty: 14,
    rating: null,
    reviewCount: 0,
    tags: ["condiments"],
    providerId: providers[2].id
  },
  {
    name: "Plain Flour 1kg",
    brand: "Baker's Mill",
    category: "baking",
    description: "Fine plain flour suited to cakes, cookies, batters, and sauces.",
    priceUsdc: "2.39",
    imageUrl: buildImageUrl("Plain Flour 1kg"),
    inStock: true,
    stockQty: 34,
    rating: "4.7",
    reviewCount: 91,
    tags: ["baking", "pantry"],
    providerId: providers[0].id
  },
  {
    name: "Granulated Sugar 1kg",
    brand: "Sweet Pantry",
    category: "baking",
    description: "Classic white sugar that dissolves cleanly in cakes, glazes, and drinks.",
    priceUsdc: "2.19",
    imageUrl: buildImageUrl("Granulated Sugar 1kg"),
    inStock: true,
    stockQty: 31,
    rating: "4.5",
    reviewCount: 64,
    tags: ["baking", "pantry"],
    providerId: providers[2].id
  },
  {
    name: "Cocoa Powder 250g",
    brand: "Cacao House",
    category: "baking",
    description: "Deep cocoa powder for brownies, cakes, hot chocolate, and frosting.",
    priceUsdc: "3.99",
    imageUrl: buildImageUrl("Cocoa Powder 250g"),
    inStock: true,
    stockQty: 19,
    rating: "4.8",
    reviewCount: 72,
    tags: ["baking", "chocolate"],
    providerId: providers[1].id
  },
  {
    name: "Baking Powder 200g",
    brand: "Rise Up",
    category: "baking",
    description: "Double-acting baking powder for reliable lift in cakes and muffins.",
    priceUsdc: "1.89",
    imageUrl: buildImageUrl("Baking Powder 200g"),
    inStock: true,
    stockQty: 27,
    rating: "4.6",
    reviewCount: 49,
    tags: ["baking"],
    providerId: providers[0].id
  },
  {
    name: "Vanilla Extract 50ml",
    brand: "Pure Pantry",
    category: "baking",
    description: "Fragrant vanilla extract that lifts cakes, custards, and cookies.",
    priceUsdc: "4.49",
    imageUrl: buildImageUrl("Vanilla Extract 50ml"),
    inStock: true,
    stockQty: 10,
    rating: "4.9",
    reviewCount: 58,
    tags: ["baking"],
    providerId: providers[1].id
  },
  {
    name: "Free Range Eggs 12-Pack",
    brand: "Meadow Hen",
    category: "dairy",
    description: "Free range eggs with rich yolks for breakfast and reliable baking.",
    priceUsdc: "5.29",
    imageUrl: buildImageUrl("Free Range Eggs 12-Pack"),
    inStock: true,
    stockQty: 20,
    rating: "4.7",
    reviewCount: 85,
    tags: ["dairy", "baking", "high-protein"],
    providerId: providers[1].id
  },
  {
    name: "Brown Sugar 1kg",
    brand: "Sweet Pantry",
    category: "baking",
    description: "Soft brown sugar with molasses notes for cookies and rich sauces.",
    priceUsdc: "2.49",
    imageUrl: buildImageUrl("Brown Sugar 1kg"),
    inStock: true,
    stockQty: 23,
    rating: "4.3",
    reviewCount: 35,
    tags: ["baking", "pantry"],
    providerId: providers[2].id
  },
  {
    name: "Dark Chocolate Chips 300g",
    brand: "Cacao House",
    category: "baking",
    description: "Dark chocolate chips that hold shape in cookies and melt into batters.",
    priceUsdc: "4.39",
    imageUrl: buildImageUrl("Dark Chocolate Chips 300g"),
    inStock: true,
    stockQty: 17,
    rating: "4.8",
    reviewCount: 61,
    tags: ["baking", "chocolate"],
    providerId: providers[1].id
  },
  {
    name: "Skim Milk 2L",
    brand: "Farm Crest",
    category: "dairy",
    description: "Light skim milk with a clean dairy taste for cereal and everyday drinking.",
    priceUsdc: "7.19",
    imageUrl: buildImageUrl("Skim Milk 2L"),
    inStock: true,
    stockQty: 36,
    rating: "4.4",
    reviewCount: 54,
    tags: ["dairy", "low-fat", "milk"],
    providerId: providers[3].id
  },
  {
    name: "Chocolate Milk 1L",
    brand: "Morning Moo",
    category: "beverages",
    description: "Creamy chocolate milk made with real cocoa.",
    priceUsdc: "8.49",
    imageUrl: buildImageUrl("Chocolate Milk 1L"),
    inStock: true,
    stockQty: 24,
    rating: "4.6",
    reviewCount: 112,
    tags: ["dairy", "beverages", "milk"],
    providerId: providers[2].id
  },
  {
    name: "Unsweetened Almond Milk 1L",
    brand: "Blue Orchard",
    category: "beverages",
    description: "Zero-sugar almond milk with a mild nutty note.",
    priceUsdc: "5.99",
    imageUrl: buildImageUrl("Unsweetened Almond Milk 1L"),
    inStock: true,
    stockQty: 32,
    rating: "4.5",
    reviewCount: 203,
    tags: ["vegan", "dairy-free", "milk"],
    providerId: providers[4].id
  },
  {
    name: "Organic Soy Milk 1L",
    brand: "Pacific Roots",
    category: "beverages",
    description: "Organic soy milk with a smooth body.",
    priceUsdc: "9.29",
    imageUrl: buildImageUrl("Organic Soy Milk 1L"),
    inStock: true,
    stockQty: 21,
    rating: "4.3",
    reviewCount: 76,
    tags: ["organic", "vegan", "dairy-free", "milk"],
    providerId: providers[1].id
  },
  {
    name: "Lactose-Free Whole Milk 2L",
    brand: "Easy Dairy",
    category: "dairy",
    description: "Real whole milk without lactose.",
    priceUsdc: "6.79",
    imageUrl: buildImageUrl("Lactose-Free Whole Milk 2L"),
    inStock: true,
    stockQty: 27,
    rating: "4.7",
    reviewCount: 98,
    tags: ["dairy", "lactose-free", "milk"],
    providerId: providers[0].id
  },
  {
    name: "A2 Protein Whole Milk 2L",
    brand: "Heritage Fields",
    category: "dairy",
    description: "Whole milk from cows selected for A2 beta-casein protein.",
    priceUsdc: "10.49",
    imageUrl: buildImageUrl("A2 Protein Whole Milk 2L"),
    inStock: true,
    stockQty: 15,
    rating: "4.8",
    reviewCount: 41,
    tags: ["dairy", "high-protein", "milk"],
    providerId: providers[4].id
  },
  {
    name: "Goat Milk 1L",
    brand: "Hillside Dairy",
    category: "dairy",
    description: "Mild and creamy goat milk for specialty diets.",
    priceUsdc: "11.99",
    imageUrl: buildImageUrl("Goat Milk 1L"),
    inStock: true,
    stockQty: 11,
    rating: "4.4",
    reviewCount: 27,
    tags: ["dairy", "milk"],
    providerId: providers[2].id
  },
  {
    name: "Organic Jersey Milk 2L",
    brand: "Meadow Gold",
    category: "dairy",
    description: "Rich organic Jersey milk with full cream texture.",
    priceUsdc: "14.50",
    imageUrl: buildImageUrl("Organic Jersey Milk 2L"),
    inStock: true,
    stockQty: 10,
    rating: "4.7",
    reviewCount: 19,
    tags: ["organic", "dairy", "milk"],
    providerId: providers[3].id
  },
  {
    name: "Premium Lactose-Free Milk 3L",
    brand: "Silk Valley",
    category: "dairy",
    description: "Family-size lactose-free milk with creamy taste.",
    priceUsdc: "16.99",
    imageUrl: buildImageUrl("Premium Lactose-Free Milk 3L"),
    inStock: true,
    stockQty: 9,
    rating: "4.5",
    reviewCount: 13,
    tags: ["dairy", "lactose-free", "milk"],
    providerId: providers[1].id
  },
  {
    name: "Chef's Gold Milk 3L",
    brand: "Chef's Gold",
    category: "dairy",
    description: "Premium milk chosen for cafe and bakery use.",
    priceUsdc: "19.49",
    imageUrl: buildImageUrl("Chef's Gold Milk 3L"),
    inStock: true,
    stockQty: 7,
    rating: "4.6",
    reviewCount: 11,
    tags: ["dairy", "milk"],
    providerId: providers[0].id
  },
  {
    name: "Artisan Farm Reserve Milk 5L",
    brand: "Heritage Reserve",
    category: "dairy",
    description: "Small-batch reserve milk in a large format for specialty kitchens.",
    priceUsdc: "22.99",
    imageUrl: buildImageUrl("Artisan Farm Reserve Milk 5L"),
    inStock: true,
    stockQty: 5,
    rating: "4.9",
    reviewCount: 8,
    tags: ["dairy", "milk"],
    providerId: providers[2].id
  }
];

async function main(): Promise<void> {
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.provider.deleteMany();

  await prisma.provider.createMany({
    data: providers
  });

  await prisma.product.createMany({
    data: products
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Failed to seed database", { error });
    await prisma.$disconnect();
    process.exit(1);
  });
