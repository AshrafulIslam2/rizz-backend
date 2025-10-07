import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';

export class UpdateShippingDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    address1?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    deliveryArea?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsNumber()
    deliveryCharge?: number;
}
