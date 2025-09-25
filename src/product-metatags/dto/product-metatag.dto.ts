import { IsInt, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductMetatagDto {
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    productId: number;

    @IsString()
    @IsOptional()
    metaTitle?: string;

    @IsString()
    @IsOptional()
    metaDescription?: string;

    @IsString()
    @IsOptional()
    metaKeywords?: string;

    @IsString()
    @IsOptional()
    ogTitle?: string;

    @IsString()
    @IsOptional()
    ogDescription?: string;

    @IsString()
    @IsOptional()
    ogImage?: string;

    @IsString()
    @IsOptional()
    canonicalUrl?: string;

    @IsOptional()
    @IsBoolean()
    robotsIndex?: boolean;

    @IsOptional()
    @IsBoolean()
    robotsFollow?: boolean;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
    priority?: number;

    @IsString()
    @IsOptional()
    changefreq?: string;
}

export class UpdateProductMetatagDto {
    @IsString()
    @IsOptional()
    metaTitle?: string;

    @IsString()
    @IsOptional()
    metaDescription?: string;

    @IsString()
    @IsOptional()
    metaKeywords?: string;

    @IsString()
    @IsOptional()
    ogTitle?: string;

    @IsString()
    @IsOptional()
    ogDescription?: string;

    @IsString()
    @IsOptional()
    ogImage?: string;

    @IsString()
    @IsOptional()
    canonicalUrl?: string;

    @IsOptional()
    @IsBoolean()
    robotsIndex?: boolean;

    @IsOptional()
    @IsBoolean()
    robotsFollow?: boolean;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
    priority?: number;

    @IsString()
    @IsOptional()
    changefreq?: string;
}
