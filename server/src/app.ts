import cors from "cors";
import express, { type Express } from "express";
import { isValidWalletAddress } from "./lib/avalanche.js";
import { AppError } from "./lib/errors.js";
import { createAgentRateLimiter } from "./lib/rateLimiter.js";
import { createErrorResponse, createSuccessResponse } from "./lib/response.js";
import { assertValidUuid, parseOptionalPositiveNumber } from "./lib/validation.js";
import { recommendProducts } from "./services/agentRecommendationService.js";
import { generateGroceryList } from "./services/groceryListService.js";
import { addItemToCart, getCartById } from "./services/cartService.js";
import { createCheckout } from "./services/checkoutService.js";
import { getOrderById } from "./services/orderService.js";
import { getProductById, listProducts, searchProducts } from "./services/productService.js";
import { buildAiContext, buildFallbackAiContext } from "./services/aiContextService.js";

/**
 * Creates the AISLE Express application.
 *
 * @returns The configured Express application instance.
 * @throws Never.
 */
export function createApp(): Express {
  const app = express();
  const agentRateLimiter = createAgentRateLimiter();

  app.set("trust proxy", true);
  app.use(express.json());
  app.use(
    cors({
      origin: "*"
    })
  );

  app.get("/ai-context.json", async (_request, response) => {
    try {
      const aiContext = await buildAiContext();
      return response.status(200).json(aiContext);
    } catch (error) {
      console.error("Failed to build ai context", { error });
      return response.status(200).json(buildFallbackAiContext());
    }
  });

  app.get("/api/products", async (request, response) => {
    try {
      const limit = Number(request.query.limit ?? 20);
      const offset = Number(request.query.offset ?? 0);
      const result = await listProducts({
        limit: Number.isFinite(limit) ? limit : 20,
        offset: Number.isFinite(offset) ? offset : 0
      });

      return response.status(200).json(createSuccessResponse(result));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.get("/api/products/search", async (request, response) => {
    try {
      const maxPrice = parseOptionalPositiveNumber(
        typeof request.query.maxPrice === "string" ? request.query.maxPrice : undefined,
        "maxPrice"
      );
      const tags =
        typeof request.query.tags === "string" && request.query.tags.length > 0
          ? request.query.tags.split(",")
          : undefined;

      const result = await searchProducts({
        q: typeof request.query.q === "string" ? request.query.q : undefined,
        category:
          typeof request.query.category === "string" ? request.query.category : undefined,
        maxPrice,
        tags
      });

      return response.status(200).json(createSuccessResponse(result));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.get("/api/products/:id", async (request, response) => {
    try {
      const productId = assertValidUuid(request.params.id);
      const product = await getProductById(productId);

      return response.status(200).json(createSuccessResponse(product));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.post("/api/agent/recommend", agentRateLimiter, async (request, response) => {
    try {
      assertValidPrompt(request.body?.prompt);
      const recommendation = await recommendProducts({
        prompt: request.body.prompt,
        maxPrice: request.body.maxPrice,
        filters: request.body.filters
      });

      return response.status(200).json(createSuccessResponse(recommendation));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.post("/api/agent/grocery-list", agentRateLimiter, async (request, response) => {
    try {
      assertValidPrompt(request.body?.prompt);
      const groceryList = await generateGroceryList({
        prompt: request.body.prompt,
        budget: request.body.budget,
        excludeItems: request.body.excludeItems,
        remainingBudget: request.body.remainingBudget
      });

      return response.status(200).json(createSuccessResponse(groceryList));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.post("/api/cart", async (request, response) => {
    try {
      assertNonEmptyString(request.body?.cartId, "INVALID_CART_ID", "cartId is required.");
      assertValidUuid(request.body?.productId);
      assertValidQuantity(request.body?.quantity);

      const cart = await addItemToCart({
        cartId: request.body.cartId,
        productId: request.body.productId,
        quantity: request.body.quantity
      });

      return response.status(200).json(createSuccessResponse(cart));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.get("/api/cart/:id", async (request, response) => {
    try {
      assertNonEmptyString(request.params.id, "INVALID_CART_ID", "cartId is required.");
      const cart = await getCartById(request.params.id);

      return response.status(200).json(createSuccessResponse(cart));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.post("/api/checkout", async (request, response) => {
    try {
      assertNonEmptyString(request.body?.cartId, "INVALID_CART_ID", "cartId is required.");
      assertValidWalletAddress(request.body?.walletAddress);

      const checkout = await createCheckout({
        cartId: request.body.cartId,
        walletAddress: request.body.walletAddress,
        txHash: typeof request.body.txHash === "string" ? request.body.txHash : undefined
      });

      return response.status(200).json(createSuccessResponse(checkout));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  app.get("/api/orders/:id", async (request, response) => {
    try {
      assertValidUuid(request.params.id);
      const order = await getOrderById(request.params.id);

      return response.status(200).json(createSuccessResponse(order));
    } catch (error) {
      return sendErrorResponse(error, response);
    }
  });

  return app;
}

function sendErrorResponse(error: unknown, response: express.Response) {
  if (error instanceof AppError) {
    return response
      .status(error.statusCode)
      .json(createErrorResponse({ code: error.code, message: error.message }));
  }

  if (error instanceof Error) {
    console.error("Unhandled route failure", {
      error: error.message,
      stack: error.stack
    });
  } else {
    console.error("Unhandled route failure", { error });
  }

  return response.status(500).json(
    createErrorResponse({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred."
    })
  );
}

function assertValidPrompt(prompt: unknown): asserts prompt is string {
  if (typeof prompt !== "string") {
    throw new AppError("INVALID_PROMPT", "Prompt must be between 3 and 500 characters.", 400);
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 3 || trimmedPrompt.length > 500) {
    throw new AppError("INVALID_PROMPT", "Prompt must be between 3 and 500 characters.", 400);
  }
}

function assertValidQuantity(quantity: unknown): asserts quantity is number {
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  ) {
    throw new AppError("INVALID_QUANTITY", "Quantity must be an integer between 1 and 99.", 400);
  }
}

function assertValidWalletAddress(walletAddress: unknown): asserts walletAddress is string {
  if (typeof walletAddress !== "string" || !isValidWalletAddress(walletAddress)) {
    throw new AppError(
      "INVALID_WALLET_ADDRESS",
      "walletAddress must be a valid EVM address.",
      400
    );
  }
}

function assertNonEmptyString(
  value: unknown,
  code: string,
  message: string
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(code, message, 400);
  }
}
