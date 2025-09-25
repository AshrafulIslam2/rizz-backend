-- CreateTable
CREATE TABLE "public"."product_faqs" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_faqs_productId_idx" ON "public"."product_faqs"("productId");

-- AddForeignKey
ALTER TABLE "public"."product_faqs" ADD CONSTRAINT "product_faqs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
