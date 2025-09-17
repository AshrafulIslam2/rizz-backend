import { IsString, IsOptional, IsHexColor, IsNotEmpty } from 'class-validator';

export class CreateColorDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsHexColor()
    hexCode?: string;
}

export class UpdateColorDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsHexColor()
    hexCode?: string;
}