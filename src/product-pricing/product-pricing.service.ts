import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreatePricingRuleDto,
    UpdatePricingRuleDto,
    GetPriceDto,
    BulkCreatePricingRulesDto,
    PricingRuleType
} from './dto/product-pricing.dto';

export interface PriceCalculationResult {
    productId: number;
    colorId?: number;
    sizeId?: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountPercentage?: number;
    discountAmount?: number;
    appliedRule: {
        id: number;
        ruleName?: string;
        ruleType: string;
        priority: number;
    };
    variantInfo?: {
        color?: { id: number; name: string; hexCode?: string };
        size?: { id: number; value: string; system?: string };
    };
}

@Injectable()
export class ProductPricingService {
    constructor(private prisma: PrismaService) { }

    async createPricingRule(createPricingRuleDto: CreatePricingRuleDto) {
        console.log("🚀 ~ ProductPricingService ~ createPricingRule ~ createPricingRuleDto:", createPricingRuleDto)
        const { productId, colorId, sizeId, min_quantity } = createPricingRuleDto;

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

        // Check for existing rule with same parameters
        const existingRule = await this.prisma.product_pricing.findFirst({
            where: {
                productId,
                colorId: colorId || null,
                sizeId: sizeId || null,
                min_quantity,
            },
        });

        if (existingRule) {
            throw new ConflictException(
                `Pricing rule already exists for this product${colorId ? ` and color` : ''}${sizeId ? ` and size` : ''} with min_quantity ${min_quantity}`
            );
        }

        try {
            return await this.prisma.product_pricing.create({
                data: {
                    productId: createPricingRuleDto.productId,
                    colorId: createPricingRuleDto.colorId || null,
                    sizeId: createPricingRuleDto.sizeId || null,
                    min_quantity: createPricingRuleDto.min_quantity,
                    max_quantity: createPricingRuleDto.max_quantity || null,
                    unit_price: createPricingRuleDto.unit_price,
                    discount_percentage: createPricingRuleDto.discount_percentage || null,
                    rule_name: createPricingRuleDto.rule_name || null,
                    rule_type: createPricingRuleDto.rule_type,
                    is_active: createPricingRuleDto.is_active ?? true,
                    priority: createPricingRuleDto.priority ?? 1,
                },
                include: {
                    product: {
                        select: { id: true, title: true, sku: true },
                    },
                },
            });
        } catch (error) {
            throw new BadRequestException('Failed to create pricing rule');
        }
    }

    async getProductPricingRules(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return this.prisma.product_pricing.findMany({
            where: { productId },
            orderBy: [
                { priority: 'desc' },
                { rule_type: 'asc' },
                { min_quantity: 'asc' },
            ],
        });
    }

    async calculatePrice(getPriceDto: GetPriceDto): Promise<PriceCalculationResult> {
        const { productId, colorId, sizeId, quantity } = getPriceDto;

        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Find applicable pricing rules
        const applicableRules = await this.prisma.product_pricing.findMany({
            where: {
                productId,
                is_active: true,
                min_quantity: { lte: quantity },
                OR: [
                    { max_quantity: null },
                    { max_quantity: { gte: quantity } },
                ],
            },
            orderBy: [
                { priority: 'desc' },
                { min_quantity: 'desc' },
            ],
        });

        if (applicableRules.length === 0) {
            // Fallback to product base price
            const unitPrice = product.discountedPrice || product.basePrice;
            const totalPrice = unitPrice * quantity;

            return {
                productId,
                colorId,
                sizeId,
                quantity,
                unitPrice,
                totalPrice,
                appliedRule: {
                    id: 0,
                    ruleName: 'Base Price',
                    ruleType: 'FALLBACK',
                    priority: 0,
                },
            };
        }

        // Use the highest priority rule
        const bestRule = applicableRules[0];
        const unitPrice = bestRule.unit_price;
        const discountPercentage = bestRule.discount_percentage;
        const discountAmount = discountPercentage ? (unitPrice * quantity * discountPercentage) / 100 : 0;
        const totalPrice = (unitPrice * quantity) - discountAmount;

        return {
            productId,
            colorId,
            sizeId,
            quantity,
            unitPrice,
            totalPrice,
            discountPercentage: discountPercentage || undefined,
            discountAmount,
            appliedRule: {
                id: bestRule.id,
                ruleName: bestRule.rule_name || undefined,
                ruleType: bestRule.rule_type,
                priority: bestRule.priority,
            },
        };
    }

    async updatePricingRule(id: number, updatePricingRuleDto: UpdatePricingRuleDto) {
        const rule = await this.prisma.product_pricing.findUnique({
            where: { id },
        });

        if (!rule) {
            throw new NotFoundException(`Pricing rule with ID ${id} not found`);
        }

        try {
            return await this.prisma.product_pricing.update({
                where: { id },
                data: updatePricingRuleDto,
            });
        } catch (error) {
            throw new BadRequestException('Failed to update pricing rule');
        }
    }

    async deletePricingRule(id: number) {
        const rule = await this.prisma.product_pricing.findUnique({
            where: { id },
        });

        if (!rule) {
            throw new NotFoundException(`Pricing rule with ID ${id} not found`);
        }

        await this.prisma.product_pricing.delete({
            where: { id },
        });

        return {
            message: `Pricing rule has been deleted successfully`,
        };
    }

    async bulkCreatePricingRules(productId: number, bulkCreateDto: BulkCreatePricingRulesDto) {
        const { variantPricingRules } = bulkCreateDto;

        // Validate product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const createdRules: any[] = [];
        const errorList: any[] = [];

        for (const ruleItem of variantPricingRules) {
            const { colorId, sizeId, pricingTiers } = ruleItem;

            // Validate color exists
            const color = await this.prisma.color.findUnique({
                where: { id: colorId },
            });
            if (!color) {
                errorList.push({
                    ruleItem,
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
                    ruleItem,
                    error: `Size with ID ${sizeId} not found`,
                });
                continue;
            }

            // Create pricing rules for each tier
            for (const tier of pricingTiers) {
                try {
                    const createdRule = await this.createPricingRule({
                        productId,
                        colorId,
                        sizeId,
                        min_quantity: tier.min_quantity,
                        max_quantity: tier.max_quantity,
                        unit_price: tier.unit_price,
                        discount_percentage: tier.discount_percentage,
                        rule_type: PricingRuleType.VARIANT,
                        is_active: true,
                        priority: 1,
                    });
                    createdRules.push(createdRule);
                } catch (error: any) {
                    errorList.push({
                        ruleItem: { colorId, sizeId, tier },
                        error: error.message,
                    });
                }
            }
        }

        return {
            created: createdRules.length,
            errorsCount: errorList.length,
            createdRules,
            errors: errorList.length > 0 ? errorList : undefined,
        };
    }

    async getPricingRulesByType(productId: number, ruleType: PricingRuleType) {
        return this.prisma.product_pricing.findMany({
            where: {
                productId,
                rule_type: ruleType,
                is_active: true,
            },
            orderBy: [
                { priority: 'desc' },
                { min_quantity: 'asc' },
            ],
        });
    }
}