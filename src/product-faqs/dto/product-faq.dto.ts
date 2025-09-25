import { IsInt, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FaqItemDto {
    @IsString()
    question: string;

    @IsString()
    answer: string;
}

export class CreateProductFaqsDto {
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    productId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FaqItemDto)
    faqs: FaqItemDto[];
}
