import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
    HttpStatus,
    HttpCode,
    ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductImagesService } from './product-images.service';
import {
    CreateProductImageDto,
    UpdateProductImageDto,
    BulkCreateProductImagesDto,
    BulkCreateSimpleImagesWrapperDto,
    SimpleImageDto,
    ReorderImagesDto,
} from './dto/product-image.dto';

@Controller('product-images')
// @UseGuards(JwtAuthGuard)
export class ProductImagesController {
    constructor(private readonly productImagesService: ProductImagesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createProductImage(@Body() createProductImageDto: CreateProductImageDto) {
        return this.productImagesService.createProductImage(createProductImageDto);
    }

    // @Post('bulk/:productId')
    // @HttpCode(HttpStatus.CREATED)
    // async bulkCreateProductImages(
    //     @Param('productId', ParseIntPipe) productId: number,
    //     @Body() bulkCreateDto: BulkCreateProductImagesDto,
    // ) {
    //     return this.productImagesService.bulkCreateProductImages(productId, bulkCreateDto);
    // }

    // @Post('bulk-simple')
    // @HttpCode(HttpStatus.CREATED)
    // async bulkCreateSimpleImages(@Body() images: SimpleImageDto[]) {
    //     return this.productImagesService.bulkCreateSimpleImages(images);
    // }

    @Post('bulk-simple-wrapped')
    @HttpCode(HttpStatus.CREATED)
    async bulkCreateSimpleImagesWrapped(@Body() bulkCreateDto: BulkCreateSimpleImagesWrapperDto) {
        return this.productImagesService.bulkCreateSimpleImagesWrapped(bulkCreateDto);
    }

    @Get('product/:productId')
    async getProductImages(@Param('productId', ParseIntPipe) productId: number) {
        return this.productImagesService.getProductImages(productId);
    }

    @Get('product/:productId/level/:level')
    async getProductImagesByLevel(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('level') level: string,
    ) {
        return this.productImagesService.getProductImagesByLevel(productId, level);
    }

    @Get(':id')
    async getProductImage(@Param('id', ParseIntPipe) id: number) {
        return this.productImagesService.getProductImage(id);
    }

    @Put(':id')
    async updateProductImage(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductImageDto: UpdateProductImageDto,
    ) {
        return this.productImagesService.updateProductImage(id, updateProductImageDto);
    }

    @Put('reorder/:productId')
    async reorderImages(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() reorderDto: ReorderImagesDto,
    ) {
        return this.productImagesService.reorderImages(productId, reorderDto);
    }

    @Put('set-main/:productId/:imageId')
    async setMainImage(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('imageId', ParseIntPipe) imageId: number,
    ) {
        return this.productImagesService.setMainImage(productId, imageId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteProductImage(@Param('id', ParseIntPipe) id: number) {
        return this.productImagesService.deleteProductImage(id);
    }

    @Delete('product/:productId/all')
    @HttpCode(HttpStatus.OK)
    async deleteAllProductImages(@Param('productId', ParseIntPipe) productId: number) {
        return this.productImagesService.deleteAllProductImages(productId);
    }
}