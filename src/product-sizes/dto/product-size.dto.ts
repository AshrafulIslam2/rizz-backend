import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    Min,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class SizeQuantityDto {
    @IsNumber()
    @IsNotEmpty()
    sizeId: number;
}

export class AddSizeToProductDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    sizeId: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    quantity?: number;
}

export class UpdateProductSizeDto {
    @IsNumber()
    @IsOptional()
    @Min(0)
    quantity?: number;
}

export class BulkAddSizesToProductDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SizeQuantityDto)
    sizes: SizeQuantityDto[];
}

export class RemoveSizeFromProductDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    sizeId: number;
}