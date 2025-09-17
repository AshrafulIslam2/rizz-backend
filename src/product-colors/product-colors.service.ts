import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    AddColorToProductDto,
    RemoveColorFromProductDto,
    BulkAddColorsToProductDto,
    BulkAddProductsToColorDto
} from './dto/product-color.dto';

@Injectable()
export class ProductColorsService {
    constructor(private prisma: PrismaService) { }

    async addColorToProduct(addColorToProductDto: AddColorToProductDto) {
        const { productId, selectedColors } = addColorToProductDto;

        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Check if all colors exist
        const colors = await this.prisma.color.findMany({
            where: { id: { in: selectedColors } },
        });

        if (colors.length !== selectedColors.length) {
            const foundColorIds = colors.map(c => c.id);
            const missingColorIds = selectedColors.filter(id => !foundColorIds.includes(id));
            throw new NotFoundException(`Colors with IDs ${missingColorIds.join(', ')} not found`);
        }

        // Check for existing associations
        const existingProductColors = await this.prisma.product_colors.findMany({
            where: {
                productId,
                colorId: { in: selectedColors },
            },
        });

        const existingColorIds = existingProductColors.map(pc => pc.colorId);
        const newColorIds = selectedColors.filter(id => !existingColorIds.includes(id));

        // If all colors are already associated, throw error
        if (newColorIds.length === 0) {
            const existingColorNames = colors
                .filter(c => existingColorIds.includes(c.id))
                .map(c => c.name);
            throw new ConflictException(
                `Product "${product.title}" is already associated with all selected colors: ${existingColorNames.join(', ')}`
            );
        }

        try {
            // Create associations only for new colors
            const createData = newColorIds.map(colorId => ({
                productId,
                colorId,
            }));

            const createdAssociations = await this.prisma.product_colors.createMany({
                data: createData,
            });

            // Return the created associations with product and color details
            const result = await this.prisma.product_colors.findMany({
                where: {
                    productId,
                    colorId: { in: newColorIds },
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            sku: true,
                        },
                    },
                    color: {
                        select: {
                            id: true,
                            name: true,
                            hexCode: true,
                        },
                    },
                },
            });

            // Prepare message with details about what was added and what was skipped
            let message = `Successfully added ${createdAssociations.count} colors to product`;

            if (existingColorIds.length > 0) {
                const skippedColorNames = colors
                    .filter(c => existingColorIds.includes(c.id))
                    .map(c => c.name);
                message += `. Skipped ${existingColorIds.length} already associated colors: ${skippedColorNames.join(', ')}`;
            }

            return {
                message,
                associations: result,
                skipped: existingColorIds.length,
                added: createdAssociations.count,
            };
        } catch (error) {
            throw new BadRequestException('Failed to add colors to product');
        }
    }

    async bulkAddColorsToProduct(bulkAddColorsToProductDto: BulkAddColorsToProductDto) {
        const { productId, colors } = bulkAddColorsToProductDto;

        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Validate all color IDs exist
        const colorIds = colors.map(c => c.colorId);
        const existingColors = await this.prisma.color.findMany({
            where: { id: { in: colorIds } },
        });

        if (existingColors.length !== colorIds.length) {
            const foundColorIds = existingColors.map(c => c.id);
            const missingColorIds = colorIds.filter(id => !foundColorIds.includes(id));
            throw new NotFoundException(`Colors with IDs ${missingColorIds.join(', ')} not found`);
        }

        // Check for existing associations
        const existingProductColors = await this.prisma.product_colors.findMany({
            where: {
                productId,
                colorId: { in: colorIds },
            },
            include: {
                color: true,
            },
        });

        const existingColorIds = existingProductColors.map(pc => pc.colorId);
        const newColorIds = colorIds.filter(id => !existingColorIds.includes(id));

        // If all colors are already associated, throw error
        if (newColorIds.length === 0) {
            const existingColorNames = existingProductColors.map(pc => pc.color.name);
            throw new ConflictException(
                `All selected colors [${existingColorNames.join(', ')}] are already associated with this product`
            );
        }

        // Create associations only for new colors
        const createData = newColorIds.map(colorId => ({
            productId,
            colorId,
        }));

        try {
            const result = await this.prisma.product_colors.createMany({
                data: createData,
            });

            return {
                ...result,
                skipped: existingColorIds.length,
                added: result.count,
                message: `Successfully added ${result.count} new colors. Skipped ${existingColorIds.length} already associated colors.`
            };
        } catch (error) {
            throw new BadRequestException('Failed to add colors to product');
        }
    }

    async bulkAddProductsToColor(bulkAddProductsToColorDto: BulkAddProductsToColorDto) {
        const { colorId, products } = bulkAddProductsToColorDto;

        // Check if color exists
        const color = await this.prisma.color.findUnique({
            where: { id: colorId },
        });
        if (!color) {
            throw new NotFoundException(`Color with ID ${colorId} not found`);
        }

        // Validate all product IDs exist
        const productIds = products.map(p => p.productId);
        const existingProducts = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        if (existingProducts.length !== productIds.length) {
            const foundProductIds = existingProducts.map(p => p.id);
            const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));
            throw new NotFoundException(`Products with IDs ${missingProductIds.join(', ')} not found`);
        }

        // Check for existing associations
        const existingProductColors = await this.prisma.product_colors.findMany({
            where: {
                colorId,
                productId: { in: productIds },
            },
            include: {
                product: true,
            },
        });

        const existingProductIds = existingProductColors.map(pc => pc.productId);
        const newProductIds = productIds.filter(id => !existingProductIds.includes(id));

        // If all products are already associated, throw error
        if (newProductIds.length === 0) {
            const existingProductTitles = existingProductColors.map(pc => pc.product.title);
            throw new ConflictException(
                `All selected products [${existingProductTitles.join(', ')}] are already associated with this color`
            );
        }

        // Create associations only for new products
        const createData = newProductIds.map(productId => ({
            productId,
            colorId,
        }));

        try {
            const result = await this.prisma.product_colors.createMany({
                data: createData,
            });

            return {
                ...result,
                skipped: existingProductIds.length,
                added: result.count,
                message: `Successfully added ${result.count} new products. Skipped ${existingProductIds.length} already associated products.`
            };
        } catch (error) {
            throw new BadRequestException('Failed to add products to color');
        }
    }

    async getProductColors(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return this.prisma.product_colors.findMany({
            where: { productId },
            include: {
                color: {
                    select: {
                        id: true,
                        name: true,
                        hexCode: true,
                    },
                },
            },
            orderBy: {
                color: { name: 'asc' },
            },
        });
    }

    async getColorProducts(colorId: number) {
        const color = await this.prisma.color.findUnique({
            where: { id: colorId },
        });
        if (!color) {
            throw new NotFoundException(`Color with ID ${colorId} not found`);
        }

        return this.prisma.product_colors.findMany({
            where: { colorId },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                        basePrice: true,
                        discountedPrice: true,
                        published: true,
                        isFeatured: true,
                    },
                },
            },
            orderBy: {
                product: { title: 'asc' },
            },
        });
    }

    async removeColorFromProduct(removeColorFromProductDto: RemoveColorFromProductDto) {
        const { productId, colorId } = removeColorFromProductDto;

        const productColor = await this.prisma.product_colors.findUnique({
            where: {
                productId_colorId: {
                    productId,
                    colorId,
                },
            },
            include: {
                product: { select: { title: true } },
                color: { select: { name: true } },
            },
        });

        if (!productColor) {
            throw new NotFoundException(
                `Color association not found for product ID ${productId} and color ID ${colorId}`
            );
        }

        await this.prisma.product_colors.delete({
            where: {
                productId_colorId: {
                    productId,
                    colorId,
                },
            },
        });

        return {
            message: `Color "${productColor.color.name}" removed from product "${productColor.product.title}"`,
        };
    }

    async removeAllColorsFromProduct(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const deletedCount = await this.prisma.product_colors.deleteMany({
            where: { productId },
        });

        return {
            message: `Removed ${deletedCount.count} colors from product "${product.title}"`,
        };
    }

    async removeAllProductsFromColor(colorId: number) {
        const color = await this.prisma.color.findUnique({
            where: { id: colorId },
        });
        if (!color) {
            throw new NotFoundException(`Color with ID ${colorId} not found`);
        }

        const deletedCount = await this.prisma.product_colors.deleteMany({
            where: { colorId },
        });

        return {
            message: `Removed ${deletedCount.count} products from color "${color.name}"`,
        };
    }
}