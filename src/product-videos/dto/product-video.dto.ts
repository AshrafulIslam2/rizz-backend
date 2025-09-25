import { IsInt, IsString, IsOptional, IsEnum, Min, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ProductVideoStatus {
    QUEUED = 'QUEUED',
    UPLOADING = 'UPLOADING',
    PROCESSING = 'PROCESSING',
    LIVE = 'LIVE',
    FAILED = 'FAILED',
}

export class CreateProductVideoDto {
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    productId: number;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    position?: number;
}

export class UpdateProductVideoDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    position?: number;

    @IsEnum(ProductVideoStatus)
    @IsOptional()
    status?: ProductVideoStatus;
}

export class ProductVideoResponseDto {
    id: number;
    productId: number;
    youtubeVideoId?: string;
    originalFileName: string;
    filePath?: string;
    title?: string;
    description?: string;
    status: ProductVideoStatus;
    errorMessage?: string;
    position?: number;
    uploadAttempts: number;
    scheduledAt?: Date;
    uploadedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    product?: {
        id: number;
        title: string;
    };
}

// DTOs for receiving embed (iframe) based videos from frontend
export class EmbedVideoItem {
    @IsString()
    url: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsOptional()
    isMain?: boolean;
}

export class CreateEmbedVideosDto {
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    productId: number;

    @IsOptional()
    @Type(() => EmbedVideoItem)
    mainVideo?: EmbedVideoItem;

    @IsOptional()
    @Type(() => EmbedVideoItem)
    cuttingVideo?: EmbedVideoItem;

    @IsOptional()
    @Type(() => EmbedVideoItem)
    stitchingVideo?: EmbedVideoItem;

    @IsOptional()
    @Type(() => EmbedVideoItem)
    assemblyVideo?: EmbedVideoItem;

    @IsOptional()
    @Type(() => EmbedVideoItem)
    finishingVideo?: EmbedVideoItem;
}