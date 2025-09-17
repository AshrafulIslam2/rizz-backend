import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ProductColorsService } from './product-colors.service';
import {
    AddColorToProductDto,
    RemoveColorFromProductDto,
    BulkAddColorsToProductDto,
    BulkAddProductsToColorDto,
} from './dto/product-color.dto';

@Controller('product-colors')
export class ProductColorsController {
    constructor(private readonly productColorsService: ProductColorsService) { }

    @Post('add-color-to-product')
    @HttpCode(HttpStatus.CREATED)
    addColorToProduct(@Body() addColorToProductDto: AddColorToProductDto) {
        return this.productColorsService.addColorToProduct(addColorToProductDto);
    }

    @Post('bulk-add-colors-to-product')
    @HttpCode(HttpStatus.CREATED)
    bulkAddColorsToProduct(@Body() bulkAddColorsToProductDto: BulkAddColorsToProductDto) {
        return this.productColorsService.bulkAddColorsToProduct(bulkAddColorsToProductDto);
    }

    @Post('bulk-add-products-to-color')
    @HttpCode(HttpStatus.CREATED)
    bulkAddProductsToColor(@Body() bulkAddProductsToColorDto: BulkAddProductsToColorDto) {
        return this.productColorsService.bulkAddProductsToColor(bulkAddProductsToColorDto);
    }

    @Get('product/:productId')
    getProductColors(@Param('productId', ParseIntPipe) productId: number) {
        return this.productColorsService.getProductColors(productId);
    }

    @Get('color/:colorId')
    getColorProducts(@Param('colorId', ParseIntPipe) colorId: number) {
        return this.productColorsService.getColorProducts(colorId);
    }

    @Delete('remove-color-from-product')
    @HttpCode(HttpStatus.OK)
    removeColorFromProduct(@Body() removeColorFromProductDto: RemoveColorFromProductDto) {
        return this.productColorsService.removeColorFromProduct(removeColorFromProductDto);
    }

    @Delete('product/:productId/colors')
    @HttpCode(HttpStatus.OK)
    removeAllColorsFromProduct(@Param('productId', ParseIntPipe) productId: number) {
        return this.productColorsService.removeAllColorsFromProduct(productId);
    }

    @Delete('color/:colorId/products')
    @HttpCode(HttpStatus.OK)
    removeAllProductsFromColor(@Param('colorId', ParseIntPipe) colorId: number) {
        return this.productColorsService.removeAllProductsFromColor(colorId);
    }
}