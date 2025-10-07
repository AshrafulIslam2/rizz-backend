/*
  Warnings:

  - A unique constraint covering the columns `[orderCode]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderCode` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add column as nullable first
ALTER TABLE "public"."orders" ADD COLUMN "orderCode" TEXT;

-- Step 2: Generate unique order codes for existing orders
UPDATE "public"."orders"
SET "orderCode" = 'ORD-' || EXTRACT(YEAR FROM "createdAt") || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || "id"::TEXT) FROM 1 FOR 6))
WHERE "orderCode" IS NULL;

-- Step 3: Make the column required (NOT NULL)
ALTER TABLE "public"."orders" ALTER COLUMN "orderCode" SET NOT NULL;

-- Step 4: Create unique index
CREATE UNIQUE INDEX "orders_orderCode_key" ON "public"."orders"("orderCode");
