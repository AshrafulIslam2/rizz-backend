import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Cron, CronExpression } from '@nestjs/schedule';
import { YoutubeService } from '../youtube/youtube.service';
import * as fs from 'fs';
import * as path from 'path';
import { CreateProductVideoDto, ProductVideoStatus, UpdateProductVideoDto } from './dto/product-video.dto';

@Injectable()
export class ProductVideosService {
    private readonly logger = new Logger(ProductVideosService.name);
    private readonly uploadDirectory = 'uploads/videos';

    constructor(
        private prisma: PrismaService,
        private youtubeService: YoutubeService,
    ) {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDirectory)) {
            fs.mkdirSync(this.uploadDirectory, { recursive: true });
        }
    }

    // async create(createProductVideoDto: CreateProductVideoDto, file: Express.Multer.File) {
    //     // Verify product exists
    //     const product = await this.prisma.product.findUnique({
    //         where: { id: createProductVideoDto.productId }
    //     });

    //     if (!product) {
    //         throw new NotFoundException(`Product with ID ${createProductVideoDto.productId} not found`);
    //     }

    //     // Save file to uploads directory
    //     const fileName = `${Date.now()}-${file.originalname}`;
    //     const filePath = path.join(this.uploadDirectory, fileName);

    //     fs.writeFileSync(filePath, file.buffer);

    //     // Create video record in database
    //     const productVideo = await this.prisma.product_video.create({
    //         data: {
    //             productId: createProductVideoDto.productId,
    //             originalFileName: file.originalname,
    //             filePath,
    //             title: createProductVideoDto.title,
    //             description: createProductVideoDto.description,
    //             position: createProductVideoDto.position,
    //             status: ProductVideoStatus.QUEUED,
    //             scheduledAt: new Date(), // Schedule for immediate processing
    //         },
    //         include: {
    //             product: {
    //                 select: {
    //                     id: true,
    //                     title: true,
    //                 }
    //             }
    //         }
    //     });

    //     this.logger.log(`E-commerce video queued for upload: ${productVideo.id} for product ${productVideo.productId}`);

    //     return {
    //         message: 'Video successfully queued for upload to e-commerce YouTube channel',
    //         videoId: productVideo.id,
    //         status: productVideo.status
    //     };
    // }

    async findAll() {
        return this.prisma.product_video.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: number) {
        const video = await this.prisma.product_video.findUnique({
            where: { id },
            include: {
                product: true
            }
        });

        if (!video) {
            throw new NotFoundException(`Product video with ID ${id} not found`);
        }

        return video;
    }

    // async findByProduct(productId: number) {
    //     const product = await this.prisma.product.findUnique({
    //         where: { id: productId }
    //     });

    //     if (!product) {
    //         throw new NotFoundException(`Product with ID ${productId} not found`);
    //     }

    //     return this.prisma.product_video.findMany({
    //         where: {
    //             productId,
    //             status: ProductVideoStatus.LIVE // Only return live videos for frontend
    //         },
    //         orderBy: { position: 'asc' }
    //     });
    // }

    // async findByStatus(status: ProductVideoStatus) {
    //     return this.prisma.product_video.findMany({
    //         where: { status },
    //         include: {
    //             product: {
    //                 select: {
    //                     id: true,
    //                     title: true,
    //                 }
    //             }
    //         },
    //         orderBy: { createdAt: 'desc' }
    //     });
    // }

    // async update(id: number, updateProductVideoDto: UpdateProductVideoDto) {
    //     const existingVideo = await this.findOne(id);

    //     return this.prisma.product_video.update({
    //         where: { id },
    //         data: updateProductVideoDto,
    //         include: {
    //             product: {
    //                 select: {
    //                     id: true,
    //                     title: true,
    //                 }
    //             }
    //         }
    //     });
    // }

    // async remove(id: number) {
    //     const video = await this.findOne(id);

    //     // Delete YouTube video if it exists
    //     if (video.youtubeVideoId && video.status === ProductVideoStatus.LIVE) {
    //         try {
    //             await this.youtubeService.deleteVideo(video.youtubeVideoId);
    //             this.logger.log(`Deleted video ${video.youtubeVideoId} from YouTube`);
    //         } catch (error) {
    //             this.logger.warn(`Could not delete YouTube video ${video.youtubeVideoId}:`, error);
    //         }
    //     }

    //     // Delete local file if it exists
    //     if (video.filePath && fs.existsSync(video.filePath)) {
    //         try {
    //             fs.unlinkSync(video.filePath);
    //             this.logger.log(`Deleted local file: ${video.filePath}`);
    //         } catch (error) {
    //             this.logger.warn(`Could not delete local file ${video.filePath}:`, error);
    //         }
    //     }

    //     // Delete database record
    //     await this.prisma.product_video.delete({
    //         where: { id }
    //     });

    //     return { message: `Product video with ID ${id} has been deleted` };
    // }

    /**
     * Create product_video records from frontend-provided iframe embeds.
     * Each embed item contains an iframe html string in `url` (or direct src).
     */
    async createFromEmbeds(createEmbedVideosDto: any) {
        const { productId } = createEmbedVideosDto;

        // Verify product exists
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const items = [
            { key: 'mainVideo', type: 'mainVideo' },
            { key: 'cuttingVideo', type: 'cuttingVideo' },
            { key: 'stitchingVideo', type: 'stitchingVideo' },
            { key: 'assemblyVideo', type: 'assemblyVideo' },
            { key: 'finishingVideo', type: 'finishingVideo' },
        ];

        const created: any[] = [];

        for (const item of items) {
            const embed = createEmbedVideosDto[item.key];
            if (!embed || !embed.url) continue;

            // extract src from iframe if full iframe provided, else accept raw src
            const srcMatch = String(embed.url).match(/src\s*=\s*"([^"]+)"/i);
            const src = srcMatch ? srcMatch[1] : String(embed.url).trim();

            if (!src) continue;

            // Attempt to normalize YouTube embed src to an embeddable URL
            // Accept urls like https://www.youtube.com/embed/VIDEO_ID?... or https://youtu.be/VIDEO_ID
            let iframeUrl = src;

            // If short youtu.be link, convert to embed form
            const shortMatch = src.match(/https?:\/\/(?:www\.)?youtu\.be\/([A-Za-z0-9_-]+)/i);
            if (shortMatch) {
                iframeUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
            }

            // Create DB record - mark as LIVE since these are already hosted on YouTube
            const data: any = {
                productId,
                iframeUrl,
                videoType: item.type,
                uploadedAt: new Date(),
            };

            const record = await this.prisma.product_video.create({ data });

            created.push(record);
        }

        return {
            message: 'Embed videos saved',
            createdCount: created.length,
            items: created
        };
    }

    // Background job to process queued videos every 30 seconds
    // @Cron(CronExpression.EVERY_30_SECONDS)
    // async processQueuedVideos() {
    //     this.logger.log('Processing queued videos for e-commerce YouTube channel...');

    //     const queuedVideos = await this.prisma.product_video.findMany({
    //         where: {
    //             status: ProductVideoStatus.QUEUED,
    //             scheduledAt: {
    //                 lte: new Date()
    //             }
    //         },
    //         take: 5 // Process 5 videos at a time
    //     });

    //     if (queuedVideos.length === 0) {
    //         return;
    //     }

    //     for (const video of queuedVideos) {
    //         try {
    //             // Mark as uploading
    //             await this.prisma.product_video.update({
    //                 where: { id: video.id },
    //                 data: {
    //                     status: ProductVideoStatus.UPLOADING,
    //                     uploadAttempts: { increment: 1 }
    //                 }
    //             });

    //             // Upload to YouTube
    //             const youtubeVideoId = await this.uploadToYoutube(video.id);

    //             // Mark as processing (YouTube processing)
    //             await this.prisma.product_video.update({
    //                 where: { id: video.id },
    //                 data: {
    //                     status: ProductVideoStatus.PROCESSING,
    //                     youtubeVideoId,
    //                     uploadedAt: new Date()
    //                 }
    //             });

    //             this.logger.log(`Video ${video.id} uploaded to YouTube with ID: ${youtubeVideoId}`);

    //         } catch (error) {
    //             this.logger.error(`Failed to upload video ${video.id}:`, error);

    //             await this.prisma.product_video.update({
    //                 where: { id: video.id },
    //                 data: {
    //                     status: ProductVideoStatus.FAILED,
    //                     errorMessage: error.message
    //                 }
    //             });
    //         }
    //     }
    // }

    // Check processing videos every minute
    // @Cron(CronExpression.EVERY_MINUTE)
    // async checkProcessingVideos() {
    //     const processingVideos = await this.prisma.product_video.findMany({
    //         where: { status: ProductVideoStatus.PROCESSING }
    //     });

    //     for (const video of processingVideos) {
    //         if (!video.youtubeVideoId) continue;

    //         try {
    //             const isProcessed = await this.youtubeService.isVideoProcessed(video.youtubeVideoId);

    //             if (isProcessed) {
    //                 await this.markVideoAsLive(video.id);
    //                 this.logger.log(`Video ${video.id} is now LIVE on YouTube`);
    //             }
    //         } catch (error) {
    //             this.logger.warn(`Could not check processing status for video ${video.id}:`, error);
    //         }
    //     }
    // }

    // private async uploadToYoutube(videoId: number): Promise<string> {
    //     const video = await this.prisma.product_video.findUnique({
    //         where: { id: videoId },
    //         include: { product: true }
    //     });

    //     if (!video || !video.filePath || !fs.existsSync(video.filePath)) {
    //         throw new Error('Video file not found');
    //     }

    //     // Check if YouTube channel is connected
    //     const isConnected = await this.youtubeService.isConnected();
    //     if (!isConnected) {
    //         throw new Error('E-commerce YouTube channel is not connected. Please connect via /youtube/oauth/start');
    //     }

    //     try {
    //         const title = video.title || `${video.product.title} - Product Video`;
    //         const description = video.description || `Product video for ${video.product.title}\n\nUpload from e-commerce store.`;
    //         const tags = ['ecommerce', 'product', video.product.title.toLowerCase()];

    //         this.logger.log(`Uploading video ${videoId} to e-commerce YouTube channel: ${title}`);

    //         const youtubeVideoId = await this.youtubeService.uploadVideo(
    //             video.filePath,
    //             title,
    //             description,
    //             tags
    //         );

    //         this.logger.log(`YouTube upload completed for video ${videoId}. YouTube ID: ${youtubeVideoId}`);
    //         return youtubeVideoId;
    //     } catch (error) {
    //         this.logger.error(`YouTube upload failed for video ${videoId}:`, error);
    //         throw error;
    //     }
    // }

    // private async markVideoAsLive(videoId: number) {
    //     const video = await this.prisma.product_video.findUnique({
    //         where: { id: videoId }
    //     });

    //     if (!video) return;

    //     await this.prisma.product_video.update({
    //         where: { id: videoId },
    //         data: { status: ProductVideoStatus.LIVE }
    //     });

    //     // Clean up local file after successful upload
    //     if (video.filePath && fs.existsSync(video.filePath)) {
    //         try {
    //             fs.unlinkSync(video.filePath);
    //             this.logger.log(`Cleaned up local file: ${video.filePath}`);

    //             // Clear file path in database
    //             await this.prisma.product_video.update({
    //                 where: { id: videoId },
    //                 data: { filePath: null }
    //             });
    //         } catch (error) {
    //             this.logger.warn(`Could not delete local file ${video.filePath}:`, error);
    //         }
    //     }
    // }
}