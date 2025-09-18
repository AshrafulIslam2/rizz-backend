import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { ProductQuantitiesService } from './product-quantities.service';
import {
    CreateProductQuantityDto,
    UpdateProductQuantityDto,
    BulkCreateProductQuantitiesDto,
    UpdateQuantityDto,
    BulkUpdateQuantitiesDto,
    GetQuantityDto,
} from './dto/product-quantity.dto';

@Controller('product-quantities')
export class ProductQuantitiesController {
    constructor(private readonly productQuantitiesService: ProductQuantitiesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    createProductQuantity(@Body() createProductQuantityDto: CreateProductQuantityDto) {
        return this.productQuantitiesService.createProductQuantity(createProductQuantityDto);
    }

    @Post('product/:productId/bulk')
    @HttpCode(HttpStatus.CREATED)
    bulkCreateProductQuantities(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() bulkCreateDto: BulkCreateProductQuantitiesDto
    ) {
        return this.productQuantitiesService.bulkCreateProductQuantities(productId, bulkCreateDto);
    }

    @Get('product/:productId')
    getProductQuantities(@Param('productId', ParseIntPipe) productId: number) {
        return this.productQuantitiesService.getProductQuantities(productId);
    }

    @Post('check')
    @HttpCode(HttpStatus.OK)
    getQuantity(@Body() getQuantityDto: GetQuantityDto) {
        return this.productQuantitiesService.getQuantity(getQuantityDto);
    }

    @Get('product/:productId/color/:colorId/size/:sizeId')
    getVariantQuantity(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('colorId', ParseIntPipe) colorId: number,
        @Param('sizeId', ParseIntPipe) sizeId: number,
    ) {
        return this.productQuantitiesService.getQuantity({ productId, colorId, sizeId });
    }

    @Patch('update-stock')
    @HttpCode(HttpStatus.OK)
    updateQuantity(@Body() updateQuantityDto: UpdateQuantityDto) {
        return this.productQuantitiesService.updateQuantity(updateQuantityDto);
    }

    @Patch(':id')
    updateProductQuantity(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductQuantityDto: UpdateProductQuantityDto,
    ) {
        return this.productQuantitiesService.updateProductQuantity(id, updateProductQuantityDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    deleteProductQuantity(@Param('id', ParseIntPipe) id: number) {
        return this.productQuantitiesService.deleteProductQuantity(id);
    }

    @Get('low-stock')
    getLowStockProducts(@Query('threshold') threshold?: string) {
        const thresholdNumber = threshold ? parseInt(threshold) : undefined;
        return this.productQuantitiesService.getLowStockProducts(thresholdNumber);
    }

    @Get('out-of-stock')
    getOutOfStockProducts() {
        return this.productQuantitiesService.getLowStockProducts(0);
    }
}