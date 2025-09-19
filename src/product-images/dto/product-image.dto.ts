import { IsInt, IsOptional, IsString, IsUrl, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
    @IsInt()
    productId: number;

    @IsUrl()
    url: string;

    @IsOptional()
    @IsString()
    alt?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;

    @IsOptional()
    @IsString()
    level?: string; // e.g., "thumbnail", "gallery", "detail"
}

// New DTO for your specific data format
export class SimpleImageDto {
    @IsInt()
    product_id: number;

    @IsUrl()
    image_url: string;

    @IsOptional()
    @IsString()
    alt?: string;

    @IsOptional()
    @IsString()
    level?: string;
}

// New wrapper DTO for your preferred wrapped format
export class BulkCreateSimpleImagesWrapperDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SimpleImageDto)
    images: SimpleImageDto[];
}

export class UpdateProductImageDto {
    @IsOptional()
    @IsUrl()
    url?: string;

    @IsOptional()
    @IsString()
    alt?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;

    @IsOptional()
    @IsString()
    level?: string;
}

export class ImageUploadDto {
    @IsUrl()
    url: string;

    @IsOptional()
    @IsString()
    alt?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;

    @IsOptional()
    @IsString()
    level?: string;
}

export class BulkCreateProductImagesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageUploadDto)
    images: ImageUploadDto[];
}

export class ReorderImagesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderImageDto)
    images: ReorderImageDto[];
}

export class ReorderImageDto {
    @IsInt()
    id: number;

    @IsInt()
    @Min(0)
    position: number;
}