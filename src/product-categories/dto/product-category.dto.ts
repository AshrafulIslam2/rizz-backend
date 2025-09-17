import {
    IsNotEmpty,
    IsNumber,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddCategoryToProductDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsNotEmpty()
    selectedCategories: number[];
}

export class RemoveCategoryFromProductDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    categoryId: number;
}

class CategoryIdDto {
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;
}

export class BulkAddCategoriesToProductDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CategoryIdDto)
    categories: CategoryIdDto[];
}

class ProductIdDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;
}

export class BulkAddProductsToCategoryDto {
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductIdDto)
    products: ProductIdDto[];
}