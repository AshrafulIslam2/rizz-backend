import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
;
import { CreateProductFaqsDto } from './dto/product-faq.dto';
import { ProductFaqsService } from './product-faqs.service';

@Controller('product-faqs')
export class ProductFaqsController {
    constructor(private readonly service: ProductFaqsService) { }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    createMany(@Body() dto: CreateProductFaqsDto) {
        return this.service.createMany(dto);
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
    update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
        return this.service.update(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
