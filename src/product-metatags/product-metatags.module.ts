import { Module } from '@nestjs/common';
import { ProductMetatagsService } from './product-metatags.service';
import { ProductMetatagsController } from './product-metatags.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ProductMetatagsService],
    controllers: [ProductMetatagsController],
    exports: [ProductMetatagsService],
})
export class ProductMetatagsModule { }
