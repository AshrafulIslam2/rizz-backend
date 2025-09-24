-- CreateEnum
CREATE TYPE "public"."ProductVideoStatus" AS ENUM ('QUEUED', 'UPLOADING', 'PROCESSING', 'LIVE', 'FAILED');

-- CreateTable
CREATE TABLE "public"."product_images" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER,
    "level" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."youtube_auth" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiryDate" TIMESTAMP(3),
    "scope" TEXT,
    "channelId" TEXT,
    "channelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtube_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_videos" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "youtubeVideoId" TEXT,
    "originalFileName" TEXT NOT NULL,
    "filePath" TEXT,
    "title" TEXT,
    "description" TEXT,
    "status" "public"."ProductVideoStatus" NOT NULL DEFAULT 'QUEUED',
    "errorMessage" TEXT,
    "position" INTEGER,
    "uploadAttempts" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_images_productId_idx" ON "public"."product_images"("productId");

-- CreateIndex
CREATE INDEX "product_videos_productId_idx" ON "public"."product_videos"("productId");

-- CreateIndex
CREATE INDEX "product_videos_status_idx" ON "public"."product_videos"("status");

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_videos" ADD CONSTRAINT "product_videos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
