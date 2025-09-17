import { Module } from '@nestjs/common';
import { ProductSizesService } from './product-sizes.service';
import { ProductSizesController } from './product-sizes.controller';

@Module({
    controllers: [ProductSizesController],
    providers: [ProductSizesService],
    exports: [ProductSizesService],
})
export class ProductSizesModule { }