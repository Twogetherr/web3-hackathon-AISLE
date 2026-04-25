import { AppError } from "../lib/errors.js";
import { isGroceryPrompt } from "../lib/groceryKeywords.js";
import { callOpenAiJson } from "../lib/openai.js";
import { searchProducts } from "./productService.js";
import type { RecommendRequest, RecommendResponseData } from "../types/agent.js";
import type { Product } from "../types/product.js";

const FILTER_TAGS = ["organic", "vegan", "gluten-free", "high-protein", "dairy-free"] as const;
const QUERY_NOISE_PATTERNS = [
  /\bunder\s*\$?\d+(?:\.\d+)?\b/gi,
  /\bover\s*\$?\d+(?:\.\d+)?\b/gi,
  /\bbelow\s*\$?\d+(?:\.\d+)?\b/gi,
  /\bcheapest\b/gi,
  /\bbest-priced\b/gi,
  /\bbest priced\b/gi,
  /\bbest\b/gi,
  /\bfind\b/gi,
  /\bshow me\b/gi,
  /\bi want\b/gi,
  /\bplease\b/gi
] as const;

/**
 * Recommends grocery products for a single-item prompt.
 *
 * @param input The recommendation request payload.
 * @returns Ranked single-product recommendations with reasoning metadata.
 * @throws {AppError} Throws when the prompt is invalid or out of scope.
 */
export async function recommendProducts(
  input: RecommendRequest
): Promise<RecommendResponseData> {
  const prompt = input.prompt.trim();
  const parsedPrompt = parsePromptConstraints(prompt, input);

  if (prompt.length < 3 || prompt.length > 500) {
    throw new AppError("INVALID_PROMPT", "Prompt must be between 3 and 500 characters.", 400);
  }

  if (parsedPrompt.maxPrice !== undefined && parsedPrompt.maxPrice <= 0) {
    throw new AppError("INVALID_PRICE", "maxPrice must be greater than 0.", 400);
  }

  if (!isGroceryPrompt(prompt)) {
    throw new AppError("OUT_OF_SCOPE", "Prompt must be grocery-related.", 400);
  }

  const result = await searchProducts({
    q: parsedPrompt.query,
    category: parsedPrompt.category,
    maxPrice: parsedPrompt.maxPrice,
    tags: parsedPrompt.tags
  });

  console.info("OpenAI recommendation requested", {
    requestId: "system",
    prompt,
    candidateCount: result.results.length
  });

  try {
    const aiResult = await callWithRetry<{
      recommendations: Array<{ id: string }>;
      reasoning?: string;
      searchQuery?: string;
    }>({
      systemPrompt:
        "You rank grocery products for a shopper. Return strict JSON with recommendations as an array of objects containing product id, plus reasoning and searchQuery.",
      userPrompt: JSON.stringify({
        prompt,
        maxPrice: parsedPrompt.maxPrice ?? null,
        filters: {
          category: parsedPrompt.category ?? null,
          tags: parsedPrompt.tags ?? null
        },
        candidates: result.results.slice(0, 10)
      })
    });
    const rankedProducts = mapRecommendedProducts(result.results, aiResult.recommendations);

    if (rankedProducts.length > 0) {
      return {
        mode: "single",
        recommendations: rankedProducts.slice(0, 3),
        reasoning:
          aiResult.reasoning ?? "These were the closest grocery matches under your current constraints.",
        searchQuery: aiResult.searchQuery ?? parsedPrompt.query,
        fallback: false
      };
    }
  } catch (error) {
    console.error("OpenAI recommendation fallback engaged", {
      requestId: "system",
      prompt,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return {
    mode: "single",
    recommendations: result.results.slice(0, 3),
    reasoning: "These were the closest grocery matches under your current constraints.",
    searchQuery: parsedPrompt.query,
    fallback: true
  };
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

function mapRecommendedProducts(
  candidates: Product[],
  recommendations: Array<{ id: string }>
): Product[] {
  const candidateMap = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  return recommendations
    .map((recommendation) => candidateMap.get(recommendation.id))
    .filter((product): product is Product => product !== undefined);
}

function parsePromptConstraints(
  prompt: string,
  input: RecommendRequest
): {
  query: string;
  category: string | undefined;
  maxPrice: number | undefined;
  tags: string[] | undefined;
} {
  const normalizedPrompt = prompt.toLowerCase();
  const maxPrice = input.maxPrice ?? extractMaxPrice(normalizedPrompt);
  const inferredTags = FILTER_TAGS.filter((tag) => normalizedPrompt.includes(tag));
  const explicitTags = input.filters?.tags?.map((tag) => tag.trim().toLowerCase()).filter(Boolean) ?? [];
  const mergedTags = Array.from(new Set([...explicitTags, ...inferredTags]));
  const query = sanitizeSearchQuery(prompt, mergedTags);

  return {
    query,
    category: input.filters?.category,
    maxPrice,
    tags: mergedTags.length > 0 ? mergedTags : undefined
  };
}

function extractMaxPrice(prompt: string): number | undefined {
  const match = prompt.match(/\b(?:under|below|max)\s*\$?(\d+(?:\.\d+)?)\b/i);

  if (match === null) {
    return undefined;
  }

  return Number(match[1]);
}

function sanitizeSearchQuery(prompt: string, tags: string[]): string {
  let nextQuery = prompt.toLowerCase();

  for (const pattern of QUERY_NOISE_PATTERNS) {
    nextQuery = nextQuery.replace(pattern, " ");
  }

  for (const tag of tags) {
    nextQuery = nextQuery.replace(new RegExp(`\\b${escapeRegExp(tag)}\\b`, "gi"), " ");
  }

  nextQuery = nextQuery.replace(/[$,]/g, " ");
  nextQuery = nextQuery.replace(/\s+/g, " ").trim();

  return nextQuery.length > 0 ? nextQuery : prompt.trim().toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
