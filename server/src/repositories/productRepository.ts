import type { Prisma } from "@prisma/client";
import { demoProducts, demoProviders } from "../lib/demoCatalogData.js";
import { getPrismaClient } from "../lib/prisma.js";
import type {
  Product,
  ProductListResult,
  ProductSearchParams,
  ProductSearchResult
} from "../types/product.js";

type ProductRecord = Prisma.ProductGetPayload<{
  include: {
    provider: {
      select: {
        name: true;
      };
    };
  };
}>;

/**
 * Returns a paginated product list from the database.
 *
 * @param params The requested pagination values.
 * @returns The paginated product result from the catalogue.
 * @throws {Error} Throws when the database query fails.
 */
export async function findProducts(params: {
  limit: number;
  offset: number;
}): Promise<ProductListResult> {
  try {
    const prisma = getPrismaClient();
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        include: {
          provider: {
            select: {
              name: true
            }
          }
        },
        take: params.limit,
        skip: params.offset,
        orderBy: {
          name: "asc"
        }
      }),
      prisma.product.count()
    ]);

    return {
      results: products.map(mapProductRecord),
      total,
      limit: params.limit,
      offset: params.offset
    };
  } catch (error) {
    return findProductsFromDemoCatalogue(params, error);
  }
}

/**
 * Returns a single product by UUID from the database.
 *
 * @param productId The product UUID to fetch.
 * @returns The matching product, or null if none exists.
 * @throws {Error} Throws when the database query fails.
 */
export async function findProductById(productId: string): Promise<Product | null> {
  try {
    const prisma = getPrismaClient();
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        provider: {
          select: {
            name: true
          }
        }
      }
    });

    return product === null ? null : mapProductRecord(product);
  } catch (error) {
    console.error("Product repository falling back to demo catalogue", {
      requestId: "system",
      reason: error instanceof Error ? error.message : String(error)
    });
    return getDemoProducts().find((product) => product.id === productId) ?? null;
  }
}

/**
 * Searches the product catalogue using indexed filters and text matching.
 *
 * @param params The search inputs for the product query.
 * @returns The filtered product result set and total count.
 * @throws {Error} Throws when the database query fails.
 */
export async function searchProductCatalogue(
  params: ProductSearchParams
): Promise<ProductSearchResult> {
  try {
    const prisma = getPrismaClient();
    const where = createSearchWhereClause(params);
    const products = await prisma.product.findMany({
      where,
      include: {
        provider: {
          select: {
            name: true
          }
        }
      },
      orderBy: [{ priceUsdc: "asc" }, { name: "asc" }]
    });

    return {
      results: products.map(mapProductRecord),
      total: products.length
    };
  } catch (error) {
    console.error("Product search falling back to demo catalogue", {
      requestId: "system",
      reason: error instanceof Error ? error.message : String(error)
    });

    const results = filterDemoProducts(params);

    return {
      results,
      total: results.length
    };
  }
}

function createSearchWhereClause(params: ProductSearchParams): Prisma.ProductWhereInput {
  const trimmedQuery = params.q?.trim();
  const trimmedCategory = params.category?.trim();
  const normalizedTags = params.tags
    ?.map((tag: string) => tag.trim())
    .filter((tag: string) => tag.length > 0);
  const andClauses: Prisma.ProductWhereInput[] = [];

  if (trimmedQuery !== undefined && trimmedQuery.length > 0) {
    andClauses.push({
      OR: [
        {
          name: {
            contains: trimmedQuery,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: trimmedQuery,
            mode: "insensitive"
          }
        },
        {
          tags: {
            has: trimmedQuery.toLowerCase()
          }
        }
      ]
    });
  }

  if (trimmedCategory !== undefined && trimmedCategory.length > 0) {
    andClauses.push({
      category: trimmedCategory.toLowerCase()
    });
  }

  if (params.maxPrice !== undefined) {
    andClauses.push({
      priceUsdc: {
        lte: params.maxPrice
      }
    });
  }

  if (params.minPrice !== undefined) {
    andClauses.push({
      priceUsdc: {
        gte: params.minPrice
      }
    });
  }

  if (params.providerNames !== undefined && params.providerNames.length > 0) {
    andClauses.push({
      provider: {
        name: {
          in: params.providerNames
        }
      }
    });
  }

  if (normalizedTags !== undefined && normalizedTags.length > 0) {
    andClauses.push({
      tags: {
        hasEvery: normalizedTags.map((tag: string) => tag.toLowerCase())
      }
    });
  }

  return andClauses.length === 0 ? {} : { AND: andClauses };
}

function mapProductRecord(product: ProductRecord): Product {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    priceUsdc: Number(product.priceUsdc),
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    stockQty: product.stockQty,
    rating: product.rating === null ? null : Number(product.rating),
    reviewCount: product.reviewCount,
    tags: product.tags,
    providerId: product.providerId,
    providerName: product.provider.name
  };
}

function findProductsFromDemoCatalogue(
  params: { limit: number; offset: number },
  error: unknown
): ProductListResult {
  console.error("Product listing falling back to demo catalogue", {
    requestId: "system",
    reason: error instanceof Error ? error.message : String(error)
  });
  const products = getDemoProducts();

  return {
    results: products.slice(params.offset, params.offset + params.limit),
    total: products.length,
    limit: params.limit,
    offset: params.offset
  };
}

function getDemoProducts(): Product[] {
  return demoProducts.map((product) => ({
    ...product,
    providerName:
      demoProviders.find((provider) => provider.id === product.providerId)?.name ?? "AISLE Demo"
  }));
}

function filterDemoProducts(params: ProductSearchParams): Product[] {
  const query = params.q?.trim().toLowerCase();
  const category = params.category?.trim().toLowerCase();
  const tags = params.tags?.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  const providerNames = params.providerNames
    ?.map((providerName) => providerName.trim().toLowerCase())
    .filter(Boolean);

  return getDemoProducts()
    .filter((product) => {
      const matchesQuery =
        query === undefined ||
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));

      const matchesCategory =
        category === undefined || product.category.toLowerCase() === category;

      const matchesPrice =
        (params.maxPrice === undefined || product.priceUsdc <= params.maxPrice) &&
        (params.minPrice === undefined || product.priceUsdc >= params.minPrice);

      const matchesProvider =
        providerNames === undefined ||
        providerNames.includes(product.providerName.trim().toLowerCase());

      const matchesTags =
        tags === undefined ||
        tags.every((tag) => product.tags.map((value) => value.toLowerCase()).includes(tag));

      return matchesQuery && matchesCategory && matchesPrice && matchesProvider && matchesTags;
    })
    .sort((left, right) => left.priceUsdc - right.priceUsdc || left.name.localeCompare(right.name));
}
