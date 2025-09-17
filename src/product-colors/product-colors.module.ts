import { Module } from '@nestjs/common';
import { ProductColorsService } from './product-colors.service';
import { ProductColorsController } from './product-colors.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProductColorsController],
    providers: [ProductColorsService],
    exports: [ProductColorsService],
})
export class ProductColorsModule { }