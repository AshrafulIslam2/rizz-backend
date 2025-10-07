/*
  Warnings:

  - You are about to drop the column `address2` on the `order_shipping` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `order_shipping` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `order_shipping` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `order_shipping` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `order_shipping` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deliveryArea` to the `order_shipping` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `order_shipping` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `phoneNumber` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."order_shipping" DROP COLUMN "address2",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "postalCode",
DROP COLUMN "state",
ADD COLUMN     "deliveryArea" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "password",
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "public"."posts";

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "public"."users"("phoneNumber");
