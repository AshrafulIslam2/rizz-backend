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
import { SizesService } from './sizes.service';
import { CreateSizeDto, UpdateSizeDto } from './dto/size.dto';

@Controller('sizes')
export class SizesController {
    constructor(private readonly sizesService: SizesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createSizeDto: CreateSizeDto) {
        return this.sizesService.create(createSizeDto);
    }

    @Get()
    findAll(@Query('system') system?: string) {
        if (system) {
            return this.sizesService.findBySystem(system);
        }
        return this.sizesService.findAll();
    }

    @Get('search')
    findByValueAndSystem(
        @Query('value') value: string,
        @Query('system') system?: string,
    ) {
        return this.sizesService.findByValueAndSystem(value, system);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sizesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSizeDto: UpdateSizeDto,
    ) {
        return this.sizesService.update(id, updateSizeDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sizesService.remove(id);
    }
}