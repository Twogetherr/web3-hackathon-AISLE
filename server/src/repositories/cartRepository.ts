import { getPrismaClient } from "../lib/prisma.js";
import type { Cart } from "../types/cart.js";

const demoCartStore = new Map<string, Cart>();

/**
 * Returns a cart and its snapshot items by cart id.
 *
 * @param cartId The anonymous session cart id.
 * @returns The cart with computed total, or null when it does not exist.
 * @throws {Error} Throws when the database query fails.
 */
export async function findCartById(cartId: string): Promise<Cart | null> {
  try {
    const prisma = getPrismaClient();
    const cart = await prisma.cart.findUnique({
      where: {
        id: cartId
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (cart === null) {
      return null;
    }

    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceUsdc: Number(item.priceUsdc),
        name: item.name,
        imageUrl: item.imageUrl
      })),
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
      totalUsdc: Number(
        cart.items
          .reduce((sum, item) => sum + Number(item.priceUsdc) * item.quantity, 0)
          .toFixed(2)
      )
    };
  } catch (error) {
    console.error("Cart repository falling back to in-memory store", {
      requestId: "system",
      reason: error instanceof Error ? error.message : String(error)
    });
    return demoCartStore.get(cartId) ?? null;
  }
}

/**
 * Adds or increments a snapshot cart item for the given cart.
 *
 * @param input The snapshot data to persist onto the cart.
 * @returns The updated cart with recomputed total.
 * @throws {Error} Throws when the database write fails.
 */
export async function upsertCartItem(input: {
  cartId: string;
  productId: string;
  quantity: number;
  priceUsdc: number;
  name: string;
  imageUrl: string;
}): Promise<Cart> {
  try {
    const prisma = getPrismaClient();

    await prisma.cart.upsert({
      where: { id: input.cartId },
      create: { id: input.cartId },
      update: {}
    });

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: input.cartId,
        productId: input.productId
      }
    });

    if (existingItem === null) {
      await prisma.cartItem.create({
        data: {
          cartId: input.cartId,
          productId: input.productId,
          quantity: input.quantity,
          priceUsdc: input.priceUsdc,
          name: input.name,
          imageUrl: input.imageUrl
        }
      });
    } else {
      await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + input.quantity
        }
      });
    }

    const updatedCart = await findCartById(input.cartId);

    if (updatedCart === null) {
      throw new Error("Cart write completed without a retrievable cart.");
    }

    return updatedCart;
  } catch (error) {
    console.error("Cart write falling back to in-memory store", {
      requestId: "system",
      reason: error instanceof Error ? error.message : String(error)
    });

    const currentCart = demoCartStore.get(input.cartId) ?? {
      id: input.cartId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalUsdc: 0
    };
    const existingItem = currentCart.items.find((item) => item.productId === input.productId);
    const nextItems =
      existingItem === undefined
        ? [
            ...currentCart.items,
            {
              productId: input.productId,
              quantity: input.quantity,
              priceUsdc: input.priceUsdc,
              name: input.name,
              imageUrl: input.imageUrl
            }
          ]
        : currentCart.items.map((item) =>
            item.productId === input.productId
              ? { ...item, quantity: item.quantity + input.quantity }
              : item
          );
    const nextCart: Cart = {
      ...currentCart,
      items: nextItems,
      updatedAt: new Date().toISOString(),
      totalUsdc: Number(
        nextItems.reduce((sum, item) => sum + item.priceUsdc * item.quantity, 0).toFixed(2)
      )
    };

    demoCartStore.set(input.cartId, nextCart);

    return nextCart;
  }
}
