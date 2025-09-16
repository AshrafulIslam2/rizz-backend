import {
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateSizeDto {
    @IsString()
    @IsNotEmpty()
    value: string; // e.g., "42", "M", "10.5"

    @IsString()
    @IsOptional()
    system?: string; // e.g., "EU", "US", "UK"
}

export class UpdateSizeDto {
    @IsString()
    @IsOptional()
    value?: string;

    @IsString()
    @IsOptional()
    system?: string;
}