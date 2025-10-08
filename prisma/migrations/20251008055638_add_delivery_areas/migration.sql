-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."OrderStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';

-- CreateTable
CREATE TABLE "public"."delivery_areas" (
    "id" SERIAL NOT NULL,
    "areaName" TEXT NOT NULL,
    "charge" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_areas_areaName_key" ON "public"."delivery_areas"("areaName");
