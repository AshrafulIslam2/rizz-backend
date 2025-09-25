import { Module } from '@nestjs/common';
import { ProductFeaturesService } from './product-features.service';
import { ProductFeaturesController } from './product-features.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ProductFeaturesService],
    controllers: [ProductFeaturesController],
    exports: [ProductFeaturesService],
})
export class ProductFeaturesModule { }
