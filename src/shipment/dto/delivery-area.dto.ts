import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateDeliveryAreaDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    charge: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateDeliveryAreaDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    charge?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
