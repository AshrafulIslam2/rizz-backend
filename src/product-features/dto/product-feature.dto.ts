import { IsInt, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductFeatureDto {
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    productId: number;

    @IsString()
    feature_title: string;

    @IsString()
    @IsOptional()
    feature_desc?: string;
}

export class UpdateProductFeatureDto {
    @IsString()
    @IsOptional()
    feature_title?: string;

    @IsString()
    @IsOptional()
    feature_desc?: string;
}

export class FeatureItemDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateProductFeaturesDto {
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    productId: number;

    // list of features to create
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeatureItemDto)
    features: FeatureItemDto[];
}
