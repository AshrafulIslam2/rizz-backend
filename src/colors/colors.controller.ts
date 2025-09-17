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
import { ColorsService } from './colors.service';
import { CreateColorDto, UpdateColorDto } from './dto/color.dto';

@Controller('colors')
export class ColorsController {
    constructor(private readonly colorsService: ColorsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createColorDto: CreateColorDto) {
        return this.colorsService.create(createColorDto);
    }

    @Get()
    findAll() {
        return this.colorsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.colorsService.findOne(id);
    }

    @Get(':id/products')
    getColorProducts(@Param('id', ParseIntPipe) id: number) {
        return this.colorsService.getColorProducts(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateColorDto: UpdateColorDto,
    ) {
        return this.colorsService.update(id, updateColorDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.colorsService.remove(id);
    }
}