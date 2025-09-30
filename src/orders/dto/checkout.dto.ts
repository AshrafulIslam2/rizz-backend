import { IsInt, IsArray, ValidateNested, IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
    @IsInt()
    productId: number;

    @IsInt()
    quantity: number;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsInt()
    colorId?: number;

    @IsOptional()
    @IsInt()
    sizeId?: number;
}

export class ShippingAddressDto {
    @IsString() fullName: string;
    @IsString() address1: string;
    @IsOptional() @IsString() address2?: string;
    @IsString() city: string;
    @IsString() state: string;
    @IsString() postalCode: string;
    @IsString() country: string;
    @IsOptional() @IsString() phone?: string;
}

export class CheckoutDto {
    @IsInt()
    userId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CheckoutItemDto)
    items: CheckoutItemDto[];

    @IsObject()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shipping: ShippingAddressDto;
}
