-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "isLimitedEdition" BOOLEAN NOT NULL DEFAULT false,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sku" TEXT NOT NULL,
    "discountPercentage" DOUBLE PRECISION,
    "material" TEXT,
    "dimensions" TEXT,
    "capacity" TEXT,
    "barcode" TEXT,
    "weight" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."colors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_colors" (
    "productId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_colors_pkey" PRIMARY KEY ("productId","colorId")
);

-- CreateTable
CREATE TABLE "public"."product_tags" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_pricing" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "colorId" INTEGER,
    "sizeId" INTEGER,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "max_quantity" INTEGER,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "discount_percentage" DOUBLE PRECISION,
    "rule_name" TEXT,
    "rule_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_quantity" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "colorId" INTEGER,
    "sizeId" INTEGER,
    "available_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "minimum_threshold" INTEGER NOT NULL DEFAULT 0,
    "maximum_capacity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_quantity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sizes" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "system" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_size" (
    "productId" INTEGER NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_size_pkey" PRIMARY KEY ("productId","sizeId")
);

-- CreateTable
CREATE TABLE "public"."product_features" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "feature_title" TEXT NOT NULL,
    "feature_desc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_category_links" (
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "product_category_links_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."product_media" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "position" INTEGER,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "public"."products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "public"."products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "colors_name_hexCode_key" ON "public"."colors"("name", "hexCode");

-- CreateIndex
CREATE INDEX "product_pricing_productId_rule_type_is_active_idx" ON "public"."product_pricing"("productId", "rule_type", "is_active");

-- CreateIndex
CREATE INDEX "product_pricing_productId_colorId_sizeId_idx" ON "public"."product_pricing"("productId", "colorId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "product_pricing_productId_colorId_sizeId_min_quantity_key" ON "public"."product_pricing"("productId", "colorId", "sizeId", "min_quantity");

-- CreateIndex
CREATE INDEX "product_quantity_productId_is_active_idx" ON "public"."product_quantity"("productId", "is_active");

-- CreateIndex
CREATE INDEX "product_quantity_productId_colorId_sizeId_idx" ON "public"."product_quantity"("productId", "colorId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "product_quantity_productId_colorId_sizeId_key" ON "public"."product_quantity"("productId", "colorId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "sizes_value_system_key" ON "public"."sizes"("value", "system");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "public"."product_categories"("name");

-- CreateIndex
CREATE INDEX "product_media_productId_idx" ON "public"."product_media"("productId");

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_colors" ADD CONSTRAINT "product_colors_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_colors" ADD CONSTRAINT "product_colors_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_tags" ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_pricing" ADD CONSTRAINT "product_pricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_pricing" ADD CONSTRAINT "product_pricing_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_pricing" ADD CONSTRAINT "product_pricing_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "public"."sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_quantity" ADD CONSTRAINT "product_quantity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_quantity" ADD CONSTRAINT "product_quantity_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_quantity" ADD CONSTRAINT "product_quantity_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "public"."sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_size" ADD CONSTRAINT "product_size_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_size" ADD CONSTRAINT "product_size_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "public"."sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_features" ADD CONSTRAINT "product_features_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_categories" ADD CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_category_links" ADD CONSTRAINT "product_category_links_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_category_links" ADD CONSTRAINT "product_category_links_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_media" ADD CONSTRAINT "product_media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
