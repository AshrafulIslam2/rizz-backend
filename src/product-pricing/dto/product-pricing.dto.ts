import { IsInt, IsOptional, IsString, IsBoolean, IsNumber, Min, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum PricingRuleType {
    STANDARD = 'STANDARD',
    BULK = 'BULK',
    VARIANT = 'VARIANT',
    VIP = 'VIP',
    WHOLESALE = 'WHOLESALE',
}

export class CreatePricingRuleDto {
    @IsInt()
    productId: number;

    @IsOptional()
    @IsInt()
    colorId?: number;

    @IsOptional()
    @IsInt()
    sizeId?: number;

    @IsInt()
    @Min(1)
    min_quantity: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    max_quantity?: number;

    @IsNumber()
    @Min(0)
    unit_price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount_percentage?: number;

    @IsOptional()
    @IsString()
    rule_name?: string;

    @IsEnum(PricingRuleType)
    rule_type: PricingRuleType = PricingRuleType.STANDARD;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean = true;

    @IsOptional()
    @IsInt()
    @Min(1)
    priority?: number = 1;
}

export class UpdatePricingRuleDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    min_quantity?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    max_quantity?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    unit_price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount_percentage?: number;

    @IsOptional()
    @IsString()
    rule_name?: string;

    @IsOptional()
    @IsEnum(PricingRuleType)
    rule_type?: PricingRuleType;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsInt()
    @Min(1)
    priority?: number;
}

export class GetPriceDto {
    @IsInt()
    productId: number;

    @IsOptional()
    @IsInt()
    colorId?: number;

    @IsOptional()
    @IsInt()
    sizeId?: number;

    @IsInt()
    @Min(1)
    quantity: number = 1;
}

export class PricingTierDto {
    @IsInt()
    @Min(1)
    min_quantity: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    max_quantity?: number;

    @IsNumber()
    @Min(0)
    unit_price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount_percentage?: number;
}

export class BulkCreatePricingRuleItemDto {
    @IsInt()
    colorId: number;

    @IsInt()
    sizeId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PricingTierDto)
    pricingTiers: PricingTierDto[];
}

export class BulkCreatePricingRulesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkCreatePricingRuleItemDto)
    variantPricingRules: BulkCreatePricingRuleItemDto[];
}