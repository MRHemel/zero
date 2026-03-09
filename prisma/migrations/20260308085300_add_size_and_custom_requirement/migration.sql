-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('S', 'M', 'L', 'XL');

-- AlterTable: CartItem - add size (required) and customRequirement (optional)
ALTER TABLE "CartItem" ADD COLUMN "size" "ProductSize" NOT NULL DEFAULT 'M';
ALTER TABLE "CartItem" ADD COLUMN "customRequirement" TEXT;

-- Remove the default after backfill (schema says required, no default)
ALTER TABLE "CartItem" ALTER COLUMN "size" DROP DEFAULT;

-- AlterTable: OrderItem - add size (required with default for existing rows) and customRequirement
ALTER TABLE "OrderItem" ADD COLUMN "size" "ProductSize" NOT NULL DEFAULT 'M';
ALTER TABLE "OrderItem" ADD COLUMN "customRequirement" TEXT;

-- Remove the default after backfill
ALTER TABLE "OrderItem" ALTER COLUMN "size" DROP DEFAULT;

-- CreateIndex: unique constraint on CartItem(cartId, productId, size)
CREATE UNIQUE INDEX "CartItem_cartId_productId_size_key" ON "CartItem"("cartId", "productId", "size");
