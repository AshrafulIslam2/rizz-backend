
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { $Enums } from '@prisma/client';


export class UpdateOrderStatusDto {
    @IsEnum($Enums.OrderStatus)
    status: $Enums.OrderStatus;

    @IsOptional()
    @IsString()
    note?: string;
}
