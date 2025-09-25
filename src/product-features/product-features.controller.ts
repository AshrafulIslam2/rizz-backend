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

import { CreateProductFeatureDto, UpdateProductFeatureDto, CreateProductFeaturesDto } from './dto/product-feature.dto';
import { ProductFeaturesService } from './product-features.service';

@Controller('product-features')
export class ProductFeaturesController {
    constructor(private readonly productFeaturesService: ProductFeaturesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateProductFeatureDto) {
        // keep single-create API for compatibility
        return this.productFeaturesService.create(dto);
    }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    createMany(@Body() dto: CreateProductFeaturesDto) {
        return this.productFeaturesService.createMany(dto);
    }

    @Get()
    findAll() {
        return this.productFeaturesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productFeaturesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductFeatureDto) {
        return this.productFeaturesService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productFeaturesService.remove(id);
    }
}
