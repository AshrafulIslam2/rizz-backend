import { Module } from '@nestjs/common';
import { ProductFaqsService } from './product-faqs.service';
import { ProductFaqsController } from './product-faqs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ProductFaqsService],
    controllers: [ProductFaqsController],
    exports: [ProductFaqsService],
})
export class ProductFaqsModule { }
