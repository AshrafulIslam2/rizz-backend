import { Module } from '@nestjs/common';
import { ProductQuantitiesService } from './product-quantities.service';
import { ProductQuantitiesController } from './product-quantities.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProductQuantitiesController],
    providers: [ProductQuantitiesService],
    exports: [ProductQuantitiesService],
})
export class ProductQuantitiesModule { }