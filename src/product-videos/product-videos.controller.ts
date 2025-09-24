import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductVideosService } from './product-videos.service';
import { CreateProductVideoDto, UpdateProductVideoDto, ProductVideoStatus } from './dto/product-video.dto';

@Controller('product-videos')
export class ProductVideosController {
    constructor(private readonly productVideosService: ProductVideosService) { }

    @Post()
    @UseInterceptors(FileInterceptor('video'))
    async create(
        @Body() createProductVideoDto: CreateProductVideoDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Video file is required');
        }

        // Validate file type
        const allowedMimeTypes = [
            'video/mp4',
            'video/avi',
            'video/mov',
            'video/wmv',
            'video/webm',
            'video/mkv'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type. Only video files are allowed.');
        }

        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            throw new BadRequestException('File size too large. Maximum allowed size is 100MB.');
        }

        return this.productVideosService.create(createProductVideoDto, file);
    }

    @Get()
    findAll() {
        return this.productVideosService.findAll();
    }

    @Get('status/:status')
    findByStatus(@Param('status') status: ProductVideoStatus) {
        return this.productVideosService.findByStatus(status);
    }

    @Get('product/:productId')
    findByProduct(@Param('productId', ParseIntPipe) productId: number) {
        return this.productVideosService.findByProduct(productId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productVideosService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductVideoDto: UpdateProductVideoDto
    ) {
        return this.productVideosService.update(id, updateProductVideoDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productVideosService.remove(id);
    }
}