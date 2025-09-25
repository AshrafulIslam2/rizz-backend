-- CreateTable
CREATE TABLE "public"."product_metatags" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "robotsIndex" BOOLEAN DEFAULT true,
    "robotsFollow" BOOLEAN DEFAULT true,
    "priority" DOUBLE PRECISION DEFAULT 0.5,
    "changefreq" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_metatags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_metatags_productId_key" ON "public"."product_metatags"("productId");

-- CreateIndex
CREATE INDEX "product_metatags_productId_idx" ON "public"."product_metatags"("productId");

-- AddForeignKey
ALTER TABLE "public"."product_metatags" ADD CONSTRAINT "product_metatags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
