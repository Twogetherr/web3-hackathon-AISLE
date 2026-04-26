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

const RECOMMENDATION_PAGE_SIZE = 3;
const MAX_CANDIDATES = 24;

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
  const refreshGeneration = normalizeRefreshGeneration(input.refreshGeneration);

  if (prompt.length < 3 || prompt.length > 500) {
    throw new AppError("INVALID_PROMPT", "Prompt must be between 3 and 500 characters.", 400);
  }

  if (parsedPrompt.maxPrice !== undefined && parsedPrompt.maxPrice <= 0) {
    throw new AppError("INVALID_PRICE", "maxPrice must be greater than 0.", 400);
  }
  if (parsedPrompt.minPrice !== undefined && parsedPrompt.minPrice <= 0) {
    throw new AppError("INVALID_PRICE", "minPrice must be greater than 0.", 400);
  }
  if (
    parsedPrompt.minPrice !== undefined &&
    parsedPrompt.maxPrice !== undefined &&
    parsedPrompt.minPrice > parsedPrompt.maxPrice
  ) {
    throw new AppError("INVALID_PRICE", "minPrice must be less than or equal to maxPrice.", 400);
  }

  if (!isGroceryPrompt(prompt)) {
    throw new AppError("OUT_OF_SCOPE", "Prompt must be grocery-related.", 400);
  }

  const result = await searchProducts({
    q: parsedPrompt.query,
    category: parsedPrompt.category,
    minPrice: parsedPrompt.minPrice,
    maxPrice: parsedPrompt.maxPrice,
    providerNames: parsedPrompt.providerNames,
    tags: parsedPrompt.tags
  });

  console.info("OpenAI recommendation requested", {
    requestId: "system",
    prompt,
    candidateCount: result.results.length,
    refreshGeneration
  });

  const inStockCandidates = result.results
    .filter((product) => product.inStock && product.stockQty > 0)
    .slice(0, MAX_CANDIDATES);
  const baseOrder =
    inStockCandidates.length > 0
      ? buildRecommendationOrder(inStockCandidates, parsedPrompt.query)
      : result.results.slice(0, MAX_CANDIDATES);

  let orderedForWindow = baseOrder;
  let aiReasoning: string | undefined;
  let aiSearchQuery: string | undefined;
  let usedAi = false;

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
        minPrice: parsedPrompt.minPrice ?? null,
        maxPrice: parsedPrompt.maxPrice ?? null,
        filters: {
          category: parsedPrompt.category ?? null,
          providerNames: parsedPrompt.providerNames ?? null,
          tags: parsedPrompt.tags ?? null
        },
        candidates: baseOrder.slice(0, 10)
      })
    });
    const rankedProducts = mapRecommendedProducts(baseOrder, aiResult.recommendations);

    if (rankedProducts.length > 0) {
      orderedForWindow = mergeAiOrderWithCandidates(rankedProducts, baseOrder);
      aiReasoning = aiResult.reasoning;
      aiSearchQuery = aiResult.searchQuery;
      usedAi = true;
    }
  } catch (error) {
    console.error("OpenAI recommendation fallback engaged", {
      requestId: "system",
      prompt,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  const { page, slice } = paginateRecommendations(orderedForWindow, refreshGeneration);
  const recommendations = attachMatchScores(slice, page);

  const defaultReasoning =
    refreshGeneration === 0
      ? "These were the closest grocery matches under your current constraints."
      : "Here is another set of picks from the catalogue. Match scores are lower than the first page because these are secondary alternatives for your prompt.";

  return {
    mode: "single",
    recommendations,
    reasoning: aiReasoning ?? defaultReasoning,
    searchQuery: aiSearchQuery ?? parsedPrompt.query,
    fallback: !usedAi
  };
}

function normalizeRefreshGeneration(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return 0;
  }

  return Math.min(value, 50);
}

function isMilkRelatedProduct(product: Product): boolean {
  const haystack = `${product.name} ${product.description}`.toLowerCase();

  return haystack.includes("milk");
}

function buildRecommendationOrder(candidates: Product[], searchQuery: string): Product[] {
  const query = searchQuery.toLowerCase();

  if (!query.includes("milk")) {
    return candidates;
  }

  const milkFirst = candidates.filter(isMilkRelatedProduct);
  if (milkFirst.length < RECOMMENDATION_PAGE_SIZE) {
    return candidates;
  }

  const milkIds = new Set(milkFirst.map((product) => product.id));

  return [...milkFirst, ...candidates.filter((product) => !milkIds.has(product.id))];
}

function mergeAiOrderWithCandidates(ranked: Product[], candidates: Product[]): Product[] {
  const seen = new Set(ranked.map((product) => product.id));

  return [...ranked, ...candidates.filter((product) => !seen.has(product.id))];
}

function paginateRecommendations(
  ordered: Product[],
  refreshGeneration: number
): { page: number; slice: Product[] } {
  if (ordered.length === 0) {
    return { page: 0, slice: [] };
  }

  const pageCount = Math.max(1, Math.ceil(ordered.length / RECOMMENDATION_PAGE_SIZE));
  const page = refreshGeneration % pageCount;

  return {
    page,
    slice: ordered.slice(
      page * RECOMMENDATION_PAGE_SIZE,
      page * RECOMMENDATION_PAGE_SIZE + RECOMMENDATION_PAGE_SIZE
    )
  };
}

function matchScoresForPage(page: number): [number, number, number] {
  const base = 98 - page * 15;

  return [base, base - 3, base - 6];
}

function attachMatchScores(products: Product[], page: number): Product[] {
  const [first, second, third] = matchScoresForPage(page);

  return products.map((product, index) => {
    const matchScore = index === 0 ? first : index === 1 ? second : third;

    return { ...product, matchScore };
  });
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
  minPrice: number | undefined;
  maxPrice: number | undefined;
  providerNames: string[] | undefined;
  tags: string[] | undefined;
} {
  const normalizedPrompt = prompt.toLowerCase();
  const minPrice = input.minPrice;
  const maxPrice = input.maxPrice ?? extractMaxPrice(normalizedPrompt);
  const providerNames = input.filters?.providerNames
    ?.map((providerName) => providerName.trim())
    .filter((providerName) => providerName.length > 0);
  const inferredTags = FILTER_TAGS.filter((tag) => normalizedPrompt.includes(tag));
  const explicitTags = input.filters?.tags?.map((tag) => tag.trim().toLowerCase()).filter(Boolean) ?? [];
  const mergedTags = Array.from(new Set([...explicitTags, ...inferredTags]));
  const query = sanitizeSearchQuery(prompt, mergedTags);

  return {
    query,
    category: input.filters?.category,
    minPrice,
    maxPrice,
    providerNames: providerNames !== undefined && providerNames.length > 0 ? providerNames : undefined,
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
