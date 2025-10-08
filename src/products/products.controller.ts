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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('categoryId') categoryId?: number,
        @Query('sortBy') sortBy?: 'lowprice' | 'highprice',
    ) {
        return this.productsService.findAll({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            sortBy,
        });
    }

    @Get('schema')
    async getProductsForSchema() {
        const products = await this.productsService.findAll(); // ডাটাবেস থেকে সব প্রোডাক্ট
        return products.map(product => ({
            "@type": "Offer",
            itemOffered: {
                "@type": "Product",
                name: product.title,
                price: product.basePrice?.toFixed(2) ?? (product.discountedPrice != null ? product.discountedPrice.toFixed(2) : null),
                priceCurrency: "BDT",
                availability: product.published ? "InStock" : "OutOfStock",
                category: product.product_categories.map(cat => cat.category.name).join(", "),
                image: product.product_image.map(img => img.url),  // Assuming product_images is an array of image objects
                url: `https://rizzleather.com/products/${product.sku}`,
                description: product.description,
            },
        }));
    }

    @Get('published')
    findPublished() {
        return this.productsService.findPublished();
    }

    @Get('sku/:sku')
    findBySku(@Param('sku') sku: string) {
        return this.productsService.findBySku(sku);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        console.log("🚀 ~ ProductsController ~ remove ~ id:", id)
        return this.productsService.remove(id);
    }
}