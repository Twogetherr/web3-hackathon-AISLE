CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'failed');

CREATE TABLE "Provider" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priceUsdc" NUMERIC(10, 2) NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "inStock" BOOLEAN NOT NULL,
  "stockQty" INTEGER NOT NULL,
  "rating" NUMERIC(2, 1),
  "reviewCount" INTEGER NOT NULL,
  "tags" TEXT[] NOT NULL,
  "providerId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Product_providerId_fkey"
    FOREIGN KEY ("providerId")
    REFERENCES "Provider"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE "Cart" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CartItem" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "cartId" TEXT NOT NULL,
  "productId" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  "priceUsdc" NUMERIC(10, 2) NOT NULL,
  "name" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CartItem_cartId_fkey"
    FOREIGN KEY ("cartId")
    REFERENCES "Cart"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE "Order" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "cartId" TEXT NOT NULL,
  "walletAddress" TEXT NOT NULL,
  "txHash" TEXT,
  "amountUsdc" NUMERIC(10, 2) NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Order_cartId_fkey"
    FOREIGN KEY ("cartId")
    REFERENCES "Cart"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_priceUsdc_idx" ON "Product"("priceUsdc");
CREATE INDEX "Product_tags_idx" ON "Product" USING GIN ("tags");
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");
CREATE INDEX "Order_cartId_idx" ON "Order"("cartId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_txHash_idx" ON "Order"("txHash");
