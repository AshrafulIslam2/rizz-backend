import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [ConfigModule, PrismaModule],
    providers: [YoutubeService],
    controllers: [YoutubeController],
    exports: [YoutubeService],
})
export class YoutubeModule { }