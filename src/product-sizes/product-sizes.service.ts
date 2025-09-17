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
        const { productId, sizeId, quantity = 0 } = addSizeToProductDto;

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
                    quantity,
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

        if (existingProductSizes.length > 0) {
            const existingSizeValues = existingProductSizes.map(ps => ps.size.value);
            throw new ConflictException(
                `Sizes [${existingSizeValues.join(', ')}] are already associated with this product`
            );
        }

        // Create all associations
        const createData = sizes.map(s => ({
            productId,
            sizeId: s.sizeId,
            quantity: s.quantity || 0,
        }));

        try {
            return await this.prisma.product_size.createMany({
                data: createData,
            });
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

        return this.prisma.product_size.update({
            where: {
                productId_sizeId: {
                    productId,
                    sizeId,
                },
            },
            data: updateProductSizeDto,
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