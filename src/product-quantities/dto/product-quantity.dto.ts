import { IsInt, IsOptional, IsString, IsBoolean, IsNumber, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductQuantityDto {
    @IsInt()
    productId: number;

    @IsOptional()
    @IsInt()
    colorId?: number;

    @IsOptional()
    @IsInt()
    sizeId?: number;

    @IsInt()
    @Min(0)
    available_quantity: number = 0;

    @IsOptional()
    @IsInt()
    @Min(0)
    reserved_quantity?: number = 0;

    @IsOptional()
    @IsInt()
    @Min(0)
    minimum_threshold?: number = 0;

    @IsOptional()
    @IsInt()
    @Min(1)
    maximum_capacity?: number;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean = true;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateProductQuantityDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    available_quantity?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    reserved_quantity?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    minimum_threshold?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    maximum_capacity?: number;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class QuantityVariantDto {
    @IsInt()
    colorId: number;

    @IsInt()
    sizeId: number;

    @IsInt()
    @Min(0)
    available_quantity: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    reserved_quantity?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    minimum_threshold?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    maximum_capacity?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class BulkCreateProductQuantitiesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuantityVariantDto)
    variantQuantities: QuantityVariantDto[];
}

export class UpdateQuantityDto {
    @IsInt()
    productId: number;

    @IsInt()
    colorId: number;

    @IsInt()
    sizeId: number;

    @IsInt()
    quantity: number; // Can be negative for reducing stock

    @IsOptional()
    @IsString()
    reason?: string; // e.g., "sale", "restock", "adjustment", "return"
}

export class BulkUpdateQuantitiesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateQuantityDto)
    updates: UpdateQuantityDto[];
}

export class GetQuantityDto {
    @IsInt()
    productId: number;

    @IsOptional()
    @IsInt()
    colorId?: number;

    @IsOptional()
    @IsInt()
    sizeId?: number;
}