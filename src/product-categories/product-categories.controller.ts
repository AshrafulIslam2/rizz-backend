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
import { ProductCategoriesService } from './product-categories.service';
import {
    AddCategoryToProductDto,
    RemoveCategoryFromProductDto,
    BulkAddCategoriesToProductDto,
    BulkAddProductsToCategoryDto
} from './dto/product-category.dto';

@Controller('product-categories')
export class ProductCategoriesController {
    constructor(private readonly productCategoriesService: ProductCategoriesService) { }

    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    addCategoryToProduct(@Body() addCategoryToProductDto: AddCategoryToProductDto) {
        return this.productCategoriesService.addCategoryToProduct(addCategoryToProductDto);
    }

    @Post('bulk-add-categories')
    @HttpCode(HttpStatus.CREATED)
    bulkAddCategoriesToProduct(@Body() bulkAddCategoriesToProductDto: BulkAddCategoriesToProductDto) {
        return this.productCategoriesService.bulkAddCategoriesToProduct(bulkAddCategoriesToProductDto);
    }

    @Post('bulk-add-products')
    @HttpCode(HttpStatus.CREATED)
    bulkAddProductsToCategory(@Body() bulkAddProductsToCategoryDto: BulkAddProductsToCategoryDto) {
        return this.productCategoriesService.bulkAddProductsToCategory(bulkAddProductsToCategoryDto);
    }

    @Get('product/:productId')
    getProductCategories(@Param('productId', ParseIntPipe) productId: number) {
        return this.productCategoriesService.getProductCategories(productId);
    }

    @Get('category/:categoryId')
    getCategoryProducts(@Param('categoryId', ParseIntPipe) categoryId: number) {
        return this.productCategoriesService.getCategoryProducts(categoryId);
    }

    @Delete('remove')
    @HttpCode(HttpStatus.OK)
    removeCategoryFromProduct(@Body() removeCategoryFromProductDto: RemoveCategoryFromProductDto) {
        return this.productCategoriesService.removeCategoryFromProduct(removeCategoryFromProductDto);
    }

    @Delete('product/:productId/category/:categoryId')
    @HttpCode(HttpStatus.OK)
    removeCategoryFromProductByParams(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('categoryId', ParseIntPipe) categoryId: number,
    ) {
        return this.productCategoriesService.removeCategoryFromProduct({
            productId,
            categoryId,
        });
    }

    @Delete('product/:productId/all-categories')
    @HttpCode(HttpStatus.OK)
    removeAllCategoriesFromProduct(@Param('productId', ParseIntPipe) productId: number) {
        return this.productCategoriesService.removeAllCategoriesFromProduct(productId);
    }

    @Delete('category/:categoryId/all-products')
    @HttpCode(HttpStatus.OK)
    removeAllProductsFromCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
        return this.productCategoriesService.removeAllProductsFromCategory(categoryId);
    }
}