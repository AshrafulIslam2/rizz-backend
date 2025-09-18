import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    AddSizeToProductDto,
    UpdateProductSizeDto,
    BulkAddSizesToProductDto,
    RemoveSizeFromProductDto
} from './dto/product-size.dto';

@Injectable()
export class ProductSizesService {
    constructor(private prisma: PrismaService) { }

    async addSizeToProduct(addSizeToProductDto: AddSizeToProductDto) {
        const { productId, sizeId } = addSizeToProductDto;

        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Check if size exists
        const size = await this.prisma.size.findUnique({
            where: { id: sizeId },
        });
        if (!size) {
            throw new NotFoundException(`Size with ID ${sizeId} not found`);
        }

        // Check if this combination already exists
        const existingProductSize = await this.prisma.product_size.findUnique({
            where: {
                productId_sizeId: {
                    productId,
                    sizeId,
                },
            },
        });

        if (existingProductSize) {
            throw new ConflictException(
                `Size "${size.value}" is already associated with product "${product.title}"`
            );
        }

        try {
            return await this.prisma.product_size.create({
                data: {
                    productId,
                    sizeId,
                    // quantity,
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            sku: true,
                        },
                    },
                    size: {
                        select: {
                            id: true,
                            value: true,
                            system: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new BadRequestException('Failed to add size to product');
        }
    }

    async bulkAddSizesToProduct(bulkAddSizesToProductDto: BulkAddSizesToProductDto) {
        const { productId, sizes } = bulkAddSizesToProductDto;

        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        console.log("🚀 ~ ProductSizesService ~ bulkAddSizesToProduct ~ product:", product)
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Validate all size IDs exist
        const sizeIds = sizes.map(s => s.sizeId);
        const existingSizes = await this.prisma.size.findMany({
            where: { id: { in: sizeIds } },
        });
        console.log("🚀 ~ ProductSizesService ~ bulkAddSizesToProduct ~ existingSizes:", existingSizes)

        if (existingSizes.length !== sizeIds.length) {
            const foundSizeIds = existingSizes.map(s => s.id);
            const missingSizeIds = sizeIds.filter(id => !foundSizeIds.includes(id));
            throw new NotFoundException(`Sizes with IDs ${missingSizeIds.join(', ')} not found`);
        }

        // Check for existing associations
        const existingProductSizes = await this.prisma.product_size.findMany({
            where: {
                productId,
                sizeId: { in: sizeIds },
            },
            include: {
                size: true,
            },
        });

        const existingSizeIds = existingProductSizes.map(ps => ps.sizeId);
        const newSizes = sizes.filter(s => !existingSizeIds.includes(s.sizeId));

        // If all sizes are already associated, throw error
        if (newSizes.length === 0) {
            const existingSizeValues = existingProductSizes.map(ps => ps.size.value);
            throw new ConflictException(
                `All selected sizes [${existingSizeValues.join(', ')}] are already associated with this product`
            );
        }

        // Create associations only for new sizes
        const createData = newSizes.map(s => ({
            productId,
            sizeId: s.sizeId,
            // quantity: s.quantity || 0,
        }));

        try {
            const result = await this.prisma.product_size.createMany({
                data: createData,
            });

            return {
                ...result,
                skipped: existingSizeIds.length,
                added: result.count,
                message: `Successfully added ${result.count} new sizes. Skipped ${existingSizeIds.length} already associated sizes.`
            };
        } catch (error) {
            throw new BadRequestException('Failed to add sizes to product');
        }
    }

    async getProductSizes(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return this.prisma.product_size.findMany({
            where: { productId },
            include: {
                size: {
                    select: {
                        id: true,
                        value: true,
                        system: true,
                    },
                },
            },
            orderBy: [
                { size: { system: 'asc' } },
                { size: { value: 'asc' } },
            ],
        });
    }

    async updateProductSize(productId: number, sizeId: number, updateProductSizeDto: UpdateProductSizeDto) {
        const productSize = await this.prisma.product_size.findUnique({
            where: {
                productId_sizeId: {
                    productId,
                    sizeId,
                },
            },
        });

        if (!productSize) {
            throw new NotFoundException(
                `Size association not found for product ID ${productId} and size ID ${sizeId}`
            );
        }

        // Since product_size is just a join table with no updateable fields,
        // we just return the existing association
        return productSize;
    }

    async removeSizeFromProduct(removeSizeFromProductDto: RemoveSizeFromProductDto) {
        const { productId, sizeId } = removeSizeFromProductDto;

        const productSize = await this.prisma.product_size.findUnique({
            where: {
                productId_sizeId: {
                    productId,
                    sizeId,
                },
            },
            include: {
                product: { select: { title: true } },
                size: { select: { value: true } },
            },
        });

        if (!productSize) {
            throw new NotFoundException(
                `Size association not found for product ID ${productId} and size ID ${sizeId}`
            );
        }

        await this.prisma.product_size.delete({
            where: {
                productId_sizeId: {
                    productId,
                    sizeId,
                },
            },
        });

        return {
            message: `Size "${productSize.size.value}" removed from product "${productSize.product.title}"`,
        };
    }

    async getSizeProducts(sizeId: number) {
        const size = await this.prisma.size.findUnique({
            where: { id: sizeId },
        });
        if (!size) {
            throw new NotFoundException(`Size with ID ${sizeId} not found`);
        }

        return this.prisma.product_size.findMany({
            where: { sizeId },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                        basePrice: true,
                        published: true,
                    },
                },
            },
            orderBy: {
                product: { title: 'asc' },
            },
        });
    }
}