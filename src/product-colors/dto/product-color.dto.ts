import { IsInt, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class AddColorToProductDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    selectedColors: number[];
}

export class RemoveColorFromProductDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsInt()
    @IsNotEmpty()
    colorId: number;
}

export class BulkAddColorsToProductDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsArray()
    @ArrayNotEmpty()
    colors: ColorAssignmentDto[];
}

export class BulkAddProductsToColorDto {
    @IsInt()
    @IsNotEmpty()
    colorId: number;

    @IsArray()
    @ArrayNotEmpty()
    products: ProductAssignmentDto[];
}

export class ColorAssignmentDto {
    @IsInt()
    @IsNotEmpty()
    colorId: number;
}

export class ProductAssignmentDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;
}