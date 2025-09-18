import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateProductQuantityDto,
    UpdateProductQuantityDto,
    BulkCreateProductQuantitiesDto,
    UpdateQuantityDto,
    BulkUpdateQuantitiesDto,
    GetQuantityDto
} from './dto/product-quantity.dto';

export interface QuantityResult {
    productId: number;
    colorId?: number;
    sizeId?: number;
    available_quantity: number;
    reserved_quantity: number;
    total_quantity: number;
    minimum_threshold: number;
    maximum_capacity?: number;
    is_low_stock: boolean;
    is_out_of_stock: boolean;
    variantInfo?: {
        color?: { id: number; name: string; hexCode?: string };
        size?: { id: number; value: string; system?: string };
    };
}

@Injectable()
export class ProductQuantitiesService {
    constructor(private prisma: PrismaService) { }

    async createProductQuantity(createProductQuantityDto: CreateProductQuantityDto) {
        const { productId, colorId, sizeId } = createProductQuantityDto;

        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Validate color exists if provided
        if (colorId) {
            const color = await this.prisma.color.findUnique({
                where: { id: colorId },
            });
            if (!color) {
                throw new NotFoundException(`Color with ID ${colorId} not found`);
            }
        }

        // Validate size exists if provided
        if (sizeId) {
            const size = await this.prisma.size.findUnique({
                where: { id: sizeId },
            });
            if (!size) {
                throw new NotFoundException(`Size with ID ${sizeId} not found`);
            }
        }

        // Check for existing quantity record
        const existingQuantity = await this.prisma.product_quantity.findFirst({
            where: {
                productId,
                colorId: colorId || null,
                sizeId: sizeId || null,
            },
        });

        if (existingQuantity) {
            throw new ConflictException(
                `Quantity record already exists for this product variant`
            );
        }

        const createdQuantity = await this.prisma.product_quantity.create({
            data: createProductQuantityDto,
            include: {
                product: true,
                color: true,
                size: true,
            },
        });

        return {
            ...createdQuantity,
            total_quantity: createdQuantity.available_quantity + createdQuantity.reserved_quantity,
            is_low_stock: createdQuantity.available_quantity <= createdQuantity.minimum_threshold,
            is_out_of_stock: createdQuantity.available_quantity === 0,
        };
    }

    async bulkCreateProductQuantities(productId: number, bulkCreateDto: BulkCreateProductQuantitiesDto) {
        const { variantQuantities } = bulkCreateDto;

        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const createdQuantities: any[] = [];
        const errorList: any[] = [];

        for (const variantQuantity of variantQuantities) {
            const { colorId, sizeId } = variantQuantity;

            try {
                // Validate color exists
                const color = await this.prisma.color.findUnique({
                    where: { id: colorId },
                });
                if (!color) {
                    errorList.push({
                        variantQuantity,
                        error: `Color with ID ${colorId} not found`,
                    });
                    continue;
                }

                // Validate size exists
                const size = await this.prisma.size.findUnique({
                    where: { id: sizeId },
                });
                if (!size) {
                    errorList.push({
                        variantQuantity,
                        error: `Size with ID ${sizeId} not found`,
                    });
                    continue;
                }

                // Check for existing quantity record
                const existingQuantity = await this.prisma.product_quantity.findUnique({
                    where: {
                        productId_colorId_sizeId: {
                            productId,
                            colorId,
                            sizeId,
                        },
                    },
                });

                if (existingQuantity) {
                    errorList.push({
                        variantQuantity,
                        error: `Quantity record already exists for this variant`,
                    });
                    continue;
                }

                const createdQuantity = await this.createProductQuantity({
                    productId,
                    colorId,
                    sizeId,
                    available_quantity: variantQuantity.available_quantity,
                    reserved_quantity: variantQuantity.reserved_quantity || 0,
                    minimum_threshold: variantQuantity.minimum_threshold || 0,
                    maximum_capacity: variantQuantity.maximum_capacity,
                    notes: variantQuantity.notes,
                });

                createdQuantities.push(createdQuantity);
            } catch (error: any) {
                errorList.push({
                    variantQuantity,
                    error: error.message,
                });
            }
        }

        return {
            created: createdQuantities.length,
            errorsCount: errorList.length,
            createdQuantities,
            errors: errorList.length > 0 ? errorList : undefined,
        };
    }

    async getProductQuantities(productId: number): Promise<QuantityResult[]> {
        const quantities = await this.prisma.product_quantity.findMany({
            where: {
                productId,
                is_active: true,
            },
            include: {
                product: true,
                color: true,
                size: true,
            },
            orderBy: [
                { colorId: 'asc' },
                { sizeId: 'asc' },
            ],
        });

        return quantities.map(quantity => ({
            productId: quantity.productId,
            colorId: quantity.colorId ?? undefined,
            sizeId: quantity.sizeId ?? undefined,
            available_quantity: quantity.available_quantity,
            reserved_quantity: quantity.reserved_quantity,
            total_quantity: quantity.available_quantity + quantity.reserved_quantity,
            minimum_threshold: quantity.minimum_threshold,
            maximum_capacity: quantity.maximum_capacity ?? undefined,
            is_low_stock: quantity.available_quantity <= quantity.minimum_threshold,
            is_out_of_stock: quantity.available_quantity === 0,
            variantInfo: {
                color: quantity.colorId ? {
                    id: quantity.colorId,
                    name: `Color ${quantity.colorId}`,
                    hexCode: undefined,
                } : undefined,
                size: quantity.sizeId ? {
                    id: quantity.sizeId,
                    value: `Size ${quantity.sizeId}`,
                    system: undefined,
                } : undefined,
            },
        }));
    }

    async getQuantity(getQuantityDto: GetQuantityDto): Promise<QuantityResult | null> {
        const { productId, colorId, sizeId } = getQuantityDto;

        const quantity = await this.prisma.product_quantity.findFirst({
            where: {
                productId,
                colorId: colorId || null,
                sizeId: sizeId || null,
            },
            include: {
                product: true,
                color: true,
                size: true,
            },
        });

        if (!quantity) {
            return null;
        }

        return {
            productId: quantity.productId,
            colorId: quantity.colorId ?? undefined,
            sizeId: quantity.sizeId ?? undefined,
            available_quantity: quantity.available_quantity,
            reserved_quantity: quantity.reserved_quantity,
            total_quantity: quantity.available_quantity + quantity.reserved_quantity,
            minimum_threshold: quantity.minimum_threshold,
            maximum_capacity: quantity.maximum_capacity ?? undefined,
            is_low_stock: quantity.available_quantity <= quantity.minimum_threshold,
            is_out_of_stock: quantity.available_quantity === 0,
            variantInfo: {
                color: quantity.colorId ? {
                    id: quantity.colorId,
                    name: `Color ${quantity.colorId}`,
                    hexCode: undefined,
                } : undefined,
                size: quantity.sizeId ? {
                    id: quantity.sizeId,
                    value: `Size ${quantity.sizeId}`,
                    system: undefined,
                } : undefined,
            },
        };
    }

    async updateQuantity(updateQuantityDto: UpdateQuantityDto) {
        const { productId, colorId, sizeId, quantity, reason } = updateQuantityDto;

        const existingQuantity = await this.prisma.product_quantity.findUnique({
            where: {
                productId_colorId_sizeId: {
                    productId,
                    colorId,
                    sizeId,
                },
            },
        });

        if (!existingQuantity) {
            throw new NotFoundException(
                `Quantity record not found for this product variant`
            );
        }

        const newAvailableQuantity = existingQuantity.available_quantity + quantity;

        if (newAvailableQuantity < 0) {
            throw new BadRequestException(
                `Insufficient stock. Available: ${existingQuantity.available_quantity}, Requested: ${Math.abs(quantity)}`
            );
        }

        const updatedQuantity = await this.prisma.product_quantity.update({
            where: {
                productId_colorId_sizeId: {
                    productId,
                    colorId,
                    sizeId,
                },
            },
            data: {
                available_quantity: newAvailableQuantity,
                notes: reason ? `${existingQuantity.notes || ''} | ${reason}` : existingQuantity.notes,
            },
            include: {
                product: true,
                color: true,
                size: true,
            },
        });

        return {
            ...updatedQuantity,
            total_quantity: updatedQuantity.available_quantity + updatedQuantity.reserved_quantity,
            is_low_stock: updatedQuantity.available_quantity <= updatedQuantity.minimum_threshold,
            is_out_of_stock: updatedQuantity.available_quantity === 0,
            quantity_change: quantity,
        };
    }

    async updateProductQuantity(id: number, updateProductQuantityDto: UpdateProductQuantityDto) {
        const existingQuantity = await this.prisma.product_quantity.findUnique({
            where: { id },
        });

        if (!existingQuantity) {
            throw new NotFoundException(`Quantity record with ID ${id} not found`);
        }

        const updatedQuantity = await this.prisma.product_quantity.update({
            where: { id },
            data: updateProductQuantityDto,
            include: {
                product: true,
                color: true,
                size: true,
            },
        });

        return {
            ...updatedQuantity,
            total_quantity: updatedQuantity.available_quantity + updatedQuantity.reserved_quantity,
            is_low_stock: updatedQuantity.available_quantity <= updatedQuantity.minimum_threshold,
            is_out_of_stock: updatedQuantity.available_quantity === 0,
        };
    }

    async deleteProductQuantity(id: number) {
        const existingQuantity = await this.prisma.product_quantity.findUnique({
            where: { id },
        });

        if (!existingQuantity) {
            throw new NotFoundException(`Quantity record with ID ${id} not found`);
        }

        await this.prisma.product_quantity.delete({
            where: { id },
        });

        return {
            message: `Quantity record has been deleted successfully`,
        };
    }

    async getLowStockProducts(threshold?: number) {
        if (threshold !== undefined) {
            return this.prisma.product_quantity.findMany({
                where: {
                    available_quantity: { lte: threshold },
                    is_active: true,
                },
                include: {
                    product: true,
                    color: true,
                    size: true,
                },
                orderBy: {
                    available_quantity: 'asc',
                },
            });
        } else {
            // Get products where available_quantity is 0 or <= minimum_threshold
            return this.prisma.product_quantity.findMany({
                where: {
                    OR: [
                        { available_quantity: 0 },
                        {
                            available_quantity: { lte: 10 } // Using a default threshold of 10
                        }
                    ],
                    is_active: true,
                },
                include: {
                    product: true,
                    color: true,
                    size: true,
                },
                orderBy: {
                    available_quantity: 'asc',
                },
            });
        }
    }
}