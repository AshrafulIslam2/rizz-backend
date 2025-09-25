/*
  Warnings:

  - You are about to drop the column `description` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `originalFileName` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `uploadAttempts` on the `product_videos` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeVideoId` on the `product_videos` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."product_videos_status_idx";

-- AlterTable
ALTER TABLE "public"."product_videos" DROP COLUMN "description",
DROP COLUMN "errorMessage",
DROP COLUMN "filePath",
DROP COLUMN "originalFileName",
DROP COLUMN "position",
DROP COLUMN "status",
DROP COLUMN "title",
DROP COLUMN "uploadAttempts",
DROP COLUMN "youtubeVideoId",
ADD COLUMN     "iframeUrl" TEXT,
ADD COLUMN     "videoType" TEXT;
