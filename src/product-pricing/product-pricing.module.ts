import { Module } from '@nestjs/common';
import { ProductPricingService } from './product-pricing.service';
import { ProductPricingController } from './product-pricing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProductPricingController],
    providers: [ProductPricingService],
    exports: [ProductPricingService],
})
export class ProductPricingModule { }