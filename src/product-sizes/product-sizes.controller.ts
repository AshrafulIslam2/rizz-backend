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
} from '@nestjs/common';
import { ProductSizesService } from './product-sizes.service';
import {
    AddSizeToProductDto,
    UpdateProductSizeDto,
    BulkAddSizesToProductDto,
    RemoveSizeFromProductDto
} from './dto/product-size.dto';

@Controller('product-sizes')
export class ProductSizesController {
    constructor(private readonly productSizesService: ProductSizesService) { }

    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    addSizeToProduct(@Body() addSizeToProductDto: AddSizeToProductDto) {
        return this.productSizesService.addSizeToProduct(addSizeToProductDto);
    }

    @Post('bulk-add')
    @HttpCode(HttpStatus.CREATED)
    bulkAddSizesToProduct(@Body() bulkAddSizesToProductDto: BulkAddSizesToProductDto) {
        return this.productSizesService.bulkAddSizesToProduct(bulkAddSizesToProductDto);
    }

    @Get('product/:productId')
    getProductSizes(@Param('productId', ParseIntPipe) productId: number) {
        return this.productSizesService.getProductSizes(productId);
    }

    @Get('size/:sizeId')
    getSizeProducts(@Param('sizeId', ParseIntPipe) sizeId: number) {
        return this.productSizesService.getSizeProducts(sizeId);
    }

    @Patch('product/:productId/size/:sizeId')
    updateProductSize(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('sizeId', ParseIntPipe) sizeId: number,
        @Body() updateProductSizeDto: UpdateProductSizeDto,
    ) {
        return this.productSizesService.updateProductSize(
            productId,
            sizeId,
            updateProductSizeDto,
        );
    }

    @Delete('remove')
    @HttpCode(HttpStatus.OK)
    removeSizeFromProduct(@Body() removeSizeFromProductDto: RemoveSizeFromProductDto) {
        return this.productSizesService.removeSizeFromProduct(removeSizeFromProductDto);
    }

    @Delete('product/:productId/size/:sizeId')
    @HttpCode(HttpStatus.OK)
    removeSizeFromProductByParams(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('sizeId', ParseIntPipe) sizeId: number,
    ) {
        return this.productSizesService.removeSizeFromProduct({
            productId,
            sizeId,
        });
    }
}