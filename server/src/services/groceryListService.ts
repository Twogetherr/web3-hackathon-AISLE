import { AppError } from "../lib/errors.js";
import { demoProducts, demoProviders } from "../lib/demoCatalogData.js";
import { isGroceryPrompt } from "../lib/groceryKeywords.js";
import { callOpenAiJson } from "../lib/openai.js";
import { searchProducts } from "./productService.js";
import type {
  GroceryListItem,
  GroceryListRequest,
  GroceryListResponseData
} from "../types/agent.js";
import type { Product } from "../types/product.js";

const CHOCOLATE_CAKE_INGREDIENTS = [
  "plain flour",
  "granulated sugar",
  "cocoa powder",
  "free range eggs",
  "unsalted butter",
  "baking powder",
  "vanilla extract",
  "whole milk"
] as const;

/**
 * Generates a grocery list for recipe or list-oriented prompts.
 *
 * @param input The grocery-list request payload.
 * @returns The matched grocery list response with pricing metadata.
 * @throws {AppError} Throws when the request is invalid or out of scope.
 */
export async function generateGroceryList(
  input: GroceryListRequest
): Promise<GroceryListResponseData> {
  const prompt = input.prompt.trim();
  const normalizedPrompt = prompt.toLowerCase();
  const isChocolateCakePrompt = normalizedPrompt.includes("chocolate cake");

  if (prompt.length < 3 || prompt.length > 500) {
    throw new AppError("INVALID_PROMPT", "Prompt must be between 3 and 500 characters.", 400);
  }

  if (input.budget !== undefined && input.budget <= 0) {
    throw new AppError("INVALID_BUDGET", "Budget must be greater than 0.", 400);
  }

  if (!isGroceryPrompt(prompt)) {
    throw new AppError("OUT_OF_SCOPE", "Prompt must be grocery-related.", 400);
  }

  console.info("Grocery list generation requested", {
    requestId: "system",
    prompt,
    budget: input.budget ?? null
  });

  let title = `${toTitleCase(isChocolateCakePrompt ? "Chocolate Cake" : "Grocery List")} - 0 ingredients`;
  let ingredients = extractIngredients(prompt, input.excludeItems ?? []);
  let fallback = isChocolateCakePrompt;

  if (!isChocolateCakePrompt) {
    try {
      const aiResult = await callWithRetry<{
        title?: string;
        ingredients?: string[];
      }>({
        systemPrompt:
          "You extract grocery ingredients from shopper prompts. Return strict JSON with title and ingredients as an array of short ingredient names.",
        userPrompt: JSON.stringify({
          prompt,
          excludeItems: input.excludeItems ?? [],
          remainingBudget: input.remainingBudget ?? null
        })
      });

      if (Array.isArray(aiResult.ingredients) && aiResult.ingredients.length > 0) {
        ingredients = aiResult.ingredients
          .map((ingredient) => ingredient.trim().toLowerCase())
          .filter((ingredient) => ingredient.length > 0);
        fallback = false;
      }

      if (typeof aiResult.title === "string" && aiResult.title.trim().length > 0) {
        title = aiResult.title.trim();
      }
    } catch (error) {
      console.error("Grocery list fallback engaged", {
        requestId: "system",
        prompt,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (fallback) {
    title = `${toTitleCase(isChocolateCakePrompt ? "Chocolate Cake" : "Grocery List")} - ${ingredients.length} ingredients`;
  }

  const items: GroceryListItem[] = [];

  for (const ingredient of ingredients) {
    const product = isChocolateCakePrompt
      ? findChocolateCakeDemoMatch(ingredient, input.remainingBudget ?? input.budget)
      : (
          await searchProducts({
            q: ingredient,
            maxPrice: input.remainingBudget ?? input.budget
          })
        ).results[0] ?? null;
    const lineTotal = product?.inStock === false ? 0 : product?.priceUsdc ?? 0;

    items.push({
      ingredient,
      product,
      quantity: 1,
      lineTotal,
      matched: product !== null
    });
  }

  const totalUsdc = Number(
    items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const budgetRemaining =
    input.budget === undefined ? null : Number((input.budget - totalUsdc).toFixed(2));

  return {
    mode: "list",
    title,
    items,
    totalUsdc,
    overBudget: input.budget !== undefined ? totalUsdc > input.budget : false,
    budgetRemaining,
    fallback
  };
}

function extractIngredients(prompt: string, excludedItems: string[]): string[] {
  const normalizedPrompt = prompt.toLowerCase();
  const excludedSet = new Set(excludedItems.map((item) => item.toLowerCase()));

  if (normalizedPrompt.includes("chocolate cake")) {
    return CHOCOLATE_CAKE_INGREDIENTS.filter((item) => !excludedSet.has(item));
  }

  return normalizedPrompt
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .filter((item) => !excludedSet.has(item));
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

async function callWithRetry<T>(input: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<T> {
  try {
    return await callOpenAiJson<T>(input);
  } catch {
    return callOpenAiJson<T>(input);
  }
}

function findChocolateCakeDemoMatch(
  ingredient: string,
  maxPrice: number | undefined
): Product | null {
  const normalizedIngredient = ingredient.toLowerCase();

  const product = getDemoProducts()
    .filter((candidate) => maxPrice === undefined || candidate.priceUsdc <= maxPrice)
    .find((candidate) => {
      const haystacks = [
        candidate.name.toLowerCase(),
        candidate.description.toLowerCase(),
        ...candidate.tags.map((tag) => tag.toLowerCase())
      ];

      return haystacks.some((value) => value.includes(normalizedIngredient));
    });

  return product ?? null;
}

function getDemoProducts(): Product[] {
  return demoProducts.map((product) => ({
    ...product,
    providerName:
      demoProviders.find((provider) => provider.id === product.providerId)?.name ?? "AISLE Demo"
  }));
}
