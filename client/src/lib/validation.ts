const GROCERY_KEYWORDS = [
  "bake",
  "butter",
  "cake",
  "cook",
  "egg",
  "flour",
  "grocery",
  "ingredient",
  "milk",
  "oat",
  "recipe",
  "shop",
  "snack",
  "sugar"
];

/**
 * Validates the shopper prompt before any API request.
 *
 * @param prompt The raw shopper prompt.
 * @returns An error message, or null when valid.
 * @throws Never.
 */
export function validatePrompt(prompt: string): string | null {
  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 3 || trimmedPrompt.length > 500) {
    return "Prompt must be between 3 and 500 characters.";
  }

  const isGroceryPrompt = GROCERY_KEYWORDS.some((keyword) =>
    trimmedPrompt.toLowerCase().includes(keyword)
  );

  if (!isGroceryPrompt) {
    return "Prompt must be grocery-related.";
  }

  return null;
}

/**
 * Determines whether a prompt should open grocery-list mode.
 *
 * @param prompt The shopper prompt to inspect.
 * @returns True when the prompt describes a recipe or grocery list.
 * @throws Never.
 */
export function isListModePrompt(prompt: string): boolean {
  const normalizedPrompt = prompt.toLowerCase();

  return (
    normalizedPrompt.includes("ingredient") ||
    normalizedPrompt.includes("recipe") ||
    normalizedPrompt.includes("weekly shop") ||
    normalizedPrompt.includes("family of") ||
    normalizedPrompt.includes("make ") ||
    normalizedPrompt.includes("cake")
  );
}
