import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsPositive,
    Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Transform empty strings to undefined
const transformEmptyStringToUndefined = ({ value }: any) =>
    value === '' ? undefined : value;

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    subtitle?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    basePrice: number;

    @IsNumber()
    @IsOptional()
    @IsPositive()
    discountedPrice?: number;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    discountPercentage?: number;

    @IsString()
    @IsOptional()
    material?: string;

    @IsString()
    @IsOptional()
    dimensions?: string;

    @IsString()
    @IsOptional()
    capacity?: string;

    // @IsNumber()
    // @IsOptional()
    // @Min(0)
    // stock?: number;

    // @IsString()
    // @IsOptional()
    // barcode?: string;

    @IsString()
    @IsOptional()
    weight?: string;

    @IsBoolean()
    @IsOptional()
    published?: boolean;

    // Feature flags
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @IsBoolean()
    @IsOptional()
    isNewArrival?: boolean;

    @IsBoolean()
    @IsOptional()
    isOnSale?: boolean;

    @IsBoolean()
    @IsOptional()
    isExclusive?: boolean;

    @IsBoolean()
    @IsOptional()
    isLimitedEdition?: boolean;

    @IsBoolean()
    @IsOptional()
    isBestSeller?: boolean;

    @IsBoolean()
    @IsOptional()
    isTrending?: boolean;

    @IsBoolean()
    @IsOptional()
    isHot?: boolean;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    subtitle?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @IsPositive()
    basePrice?: number;

    @IsNumber()
    @IsOptional()
    @IsPositive()
    discountedPrice?: number;

    @IsString()
    @IsOptional()
    sku?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    discountPercentage?: number;

    @IsString()
    @IsOptional()
    material?: string;

    @IsString()
    @IsOptional()
    dimensions?: string;

    @IsString()
    @IsOptional()
    capacity?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    stock?: number;

    @IsString()
    @IsOptional()
    barcode?: string;

    @IsString()
    @IsOptional()
    weight?: string;

    @IsBoolean()
    @IsOptional()
    published?: boolean;

    // Feature flags
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @IsBoolean()
    @IsOptional()
    isNewArrival?: boolean;

    @IsBoolean()
    @IsOptional()
    isOnSale?: boolean;

    @IsBoolean()
    @IsOptional()
    isExclusive?: boolean;

    @IsBoolean()
    @IsOptional()
    isLimitedEdition?: boolean;

    @IsBoolean()
    @IsOptional()
    isBestSeller?: boolean;

    @IsBoolean()
    @IsOptional()
    isTrending?: boolean;

    @IsBoolean()
    @IsOptional()
    isHot?: boolean;

    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}