import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateProductImageDto,
    UpdateProductImageDto,
    BulkCreateProductImagesDto,
    BulkCreateSimpleImagesWrapperDto,
    SimpleImageDto,
    ReorderImagesDto,
} from './dto/product-image.dto';

@Injectable()
export class ProductImagesService {
    constructor(private prisma: PrismaService) { }

    async createProductImage(createProductImageDto: CreateProductImageDto) {
        const { productId } = createProductImageDto;

        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // If position is not provided, set it as the next available position
        if (!createProductImageDto.position) {
            const lastImage = await this.prisma.product_image.findFirst({
                where: { productId },
                orderBy: { position: 'desc' },
            });
            createProductImageDto.position = lastImage ? (lastImage.position ?? 0) + 1 : 1;
        }

        const createdImage = await this.prisma.product_image.create({
            data: createProductImageDto,
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                    },
                },
            },
        });

        return createdImage;
    }

    async bulkCreateProductImages(productId: number, bulkCreateDto: BulkCreateProductImagesDto) {
        const { images } = bulkCreateDto;

        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const createdImages: any[] = [];
        const errorList: any[] = [];

        // Get the current highest position for this product
        const lastImage = await this.prisma.product_image.findFirst({
            where: { productId },
            orderBy: { position: 'desc' },
        });

        let currentPosition = lastImage ? (lastImage.position ?? 0) + 1 : 1;

        for (const imageData of images) {
            try {
                // Set position if not provided
                if (!imageData.position) {
                    imageData.position = currentPosition++;
                }

                const createdImage = await this.createProductImage({
                    productId,
                    url: imageData.url,
                    alt: imageData.alt,
                    position: imageData.position,
                    level: imageData.level,
                });

                createdImages.push(createdImage);
            } catch (error: any) {
                errorList.push({
                    imageData,
                    error: error.message,
                });
            }
        }

        return {
            created: createdImages.length,
            errorsCount: errorList.length,
            createdImages,
            errors: errorList.length > 0 ? errorList : undefined,
        };
    }

    async bulkCreateSimpleImages(images: SimpleImageDto[]) {
        const createdImages: any[] = [];
        const errorList: any[] = [];

        // Group images by product_id for better performance
        const imagesByProduct = images.reduce((acc, image) => {
            if (!acc[image.product_id]) {
                acc[image.product_id] = [];
            }
            acc[image.product_id].push(image);
            return acc;
        }, {} as Record<number, SimpleImageDto[]>);

        // Process each product's images
        for (const [productIdStr, productImages] of Object.entries(imagesByProduct)) {
            const productId = parseInt(productIdStr);

            try {
                // Validate product exists
                const product = await this.prisma.product.findUnique({
                    where: { id: productId },
                });
                if (!product) {
                    // Add all images for this product to error list
                    productImages.forEach(imageData => {
                        errorList.push({
                            imageData,
                            error: `Product with ID ${productId} not found`,
                        });
                    });
                    continue;
                }

                // Get the current highest position for this product
                const lastImage = await this.prisma.product_image.findFirst({
                    where: { productId },
                    orderBy: { position: 'desc' },
                });

                let currentPosition = lastImage ? (lastImage.position ?? 0) + 1 : 1;

                // Process each image for this product
                for (const imageData of productImages) {
                    try {
                        const createdImage = await this.prisma.product_image.create({
                            data: {
                                productId: imageData.product_id,
                                url: imageData.image_url,
                                alt: imageData.alt,
                                level: imageData.level,
                                position: currentPosition++,
                            },
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        title: true,
                                        sku: true,
                                    },
                                },
                            },
                        });

                        createdImages.push(createdImage);
                    } catch (error: any) {
                        errorList.push({
                            imageData,
                            error: error.message,
                        });
                    }
                }
            } catch (error: any) {
                // Add all images for this product to error list
                productImages.forEach(imageData => {
                    errorList.push({
                        imageData,
                        error: error.message,
                    });
                });
            }
        }

        return {
            created: createdImages.length,
            errorsCount: errorList.length,
            createdImages,
            errors: errorList.length > 0 ? errorList : undefined,
        };
    }

    async bulkCreateSimpleImagesWrapped(bulkCreateDto: BulkCreateSimpleImagesWrapperDto) {
        const { images } = bulkCreateDto;
        // Delegate to the existing method that handles the array
        return this.bulkCreateSimpleImages(images);
    }

    async getProductImages(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return this.prisma.product_image.findMany({
            where: { productId },
            orderBy: [
                { position: 'asc' },
                { createdAt: 'asc' },
            ],
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                    },
                },
            },
        });
    }

    async getProductImagesByLevel(productId: number, level: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return this.prisma.product_image.findMany({
            where: {
                productId,
                level,
            },
            orderBy: [
                { position: 'asc' },
                { createdAt: 'asc' },
            ],
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                    },
                },
            },
        });
    }

    async getProductImage(id: number) {
        const image = await this.prisma.product_image.findUnique({
            where: { id },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                    },
                },
            },
        });

        if (!image) {
            throw new NotFoundException(`Product image with ID ${id} not found`);
        }

        return image;
    }

    async updateProductImage(id: number, updateProductImageDto: UpdateProductImageDto) {
        const existingImage = await this.prisma.product_image.findUnique({
            where: { id },
        });

        if (!existingImage) {
            throw new NotFoundException(`Product image with ID ${id} not found`);
        }

        const updatedImage = await this.prisma.product_image.update({
            where: { id },
            data: updateProductImageDto,
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                    },
                },
            },
        });

        return updatedImage;
    }

    async reorderImages(productId: number, reorderDto: ReorderImagesDto) {
        const { images } = reorderDto;

        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Validate all image IDs belong to this product
        const imageIds = images.map(img => img.id);
        const existingImages = await this.prisma.product_image.findMany({
            where: {
                id: { in: imageIds },
                productId,
            },
        });

        if (existingImages.length !== imageIds.length) {
            throw new BadRequestException('Some images do not belong to this product');
        }

        // Update positions in a transaction
        const updatedImages = await this.prisma.$transaction(
            images.map(({ id, position }) =>
                this.prisma.product_image.update({
                    where: { id },
                    data: { position },
                })
            )
        );

        return {
            message: 'Images reordered successfully',
            updatedImages,
        };
    }

    async deleteProductImage(id: number) {
        const existingImage = await this.prisma.product_image.findUnique({
            where: { id },
        });

        if (!existingImage) {
            throw new NotFoundException(`Product image with ID ${id} not found`);
        }

        await this.prisma.product_image.delete({
            where: { id },
        });

        return {
            message: 'Product image deleted successfully',
            deletedImage: existingImage,
        };
    }

    async deleteAllProductImages(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const deleteResult = await this.prisma.product_image.deleteMany({
            where: { productId },
        });

        return {
            message: `Deleted ${deleteResult.count} images for product ${productId}`,
            deletedCount: deleteResult.count,
        };
    }

    async setMainImage(productId: number, imageId: number) {
        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Validate image exists and belongs to this product
        const image = await this.prisma.product_image.findUnique({
            where: { id: imageId },
        });
        if (!image || image.productId !== productId) {
            throw new NotFoundException(`Image with ID ${imageId} not found for this product`);
        }

        // Set this image as position 1 and adjust others
        const allImages = await this.prisma.product_image.findMany({
            where: { productId },
            orderBy: { position: 'asc' },
        });

        const updatedImages = await this.prisma.$transaction([
            // Set the selected image to position 1
            this.prisma.product_image.update({
                where: { id: imageId },
                data: { position: 1 },
            }),
            // Update positions of other images
            ...allImages
                .filter(img => img.id !== imageId)
                .map((img, index) =>
                    this.prisma.product_image.update({
                        where: { id: img.id },
                        data: { position: index + 2 },
                    })
                ),
        ]);

        return {
            message: 'Main image set successfully',
            mainImage: updatedImages[0],
        };
    }
}