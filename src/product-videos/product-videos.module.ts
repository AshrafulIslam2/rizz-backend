import { Module } from '@nestjs/common';
import { ProductVideosService } from './product-videos.service';
import { ProductVideosController } from './product-videos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { YoutubeModule } from '../youtube/youtube.module';

@Module({
    imports: [PrismaModule, YoutubeModule],
    controllers: [ProductVideosController],
    providers: [ProductVideosService],
    exports: [ProductVideosService],
})
export class ProductVideosModule { }