export interface CartItemSnapshot {
  productId: string;
  quantity: number;
  priceUsdc: number;
  name: string;
  imageUrl: string;
}

export interface Cart {
  id: string;
  items: CartItemSnapshot[];
  createdAt: string;
  updatedAt: string;
  totalUsdc: number;
}

export interface AddToCartRequest {
  cartId: string;
  productId: string;
  quantity: number;
}
