import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
// import { ProductMetatagsService } from './product-metatags.service';
import { CreateProductMetatagDto, UpdateProductMetatagDto } from './dto/product-metatag.dto';
import { ProductMetatagsService } from './product-metatags.service';

@Controller('product-metatags')
export class ProductMetatagsController {
    constructor(private readonly service: ProductMetatagsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateProductMetatagDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductMetatagDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
