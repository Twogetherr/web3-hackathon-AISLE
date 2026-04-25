const GROCERY_KEYWORDS = [
  "bake",
  "bread",
  "butter",
  "cake",
  "cart",
  "cheese",
  "chicken",
  "cook",
  "dinner",
  "egg",
  "flour",
  "food",
  "fruit",
  "grocery",
  "ingredient",
  "list",
  "meal",
  "milk",
  "oat",
  "pasta",
  "produce",
  "protein",
  "recipe",
  "rice",
  "sauce",
  "shop",
  "snack",
  "sugar",
  "vegan",
  "vegetable"
] as const;

/**
 * Determines whether a prompt is related to grocery shopping.
 *
 * @param prompt The prompt to inspect.
 * @returns True when the prompt appears grocery-related, otherwise false.
 * @throws Never.
 */
export function isGroceryPrompt(prompt: string): boolean {
  const normalizedPrompt = prompt.trim().toLowerCase();

  return GROCERY_KEYWORDS.some((keyword) => normalizedPrompt.includes(keyword));
}
