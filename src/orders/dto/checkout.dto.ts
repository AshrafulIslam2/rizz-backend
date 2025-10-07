import { IsInt, IsArray, ValidateNested, IsNumber, IsString, IsOptional, IsObject, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    address: string;

    @IsString()
    deliveryArea: string;
}

export class ProductDto {
    @IsInt()
    id: number;

    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    originalPrice?: number;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsInt()
    colorId?: number;

    @IsOptional()
    @IsString()
    size?: string;

    @IsOptional()
    @IsInt()
    sizeId?: number;

    @IsInt()
    quantity: number;

    @IsOptional()
    @IsString()
    sku?: string;
}

export class CheckoutDto {
    @IsObject()
    @ValidateNested()
    @Type(() => UserDto)
    user: UserDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductDto)
    products: ProductDto[];

    @IsNumber()
    total: number;

    @IsNumber()
    deliveryCharge: number;

    @IsNumber()
    totalPayableAmount: number;
}
