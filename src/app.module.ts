import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SizesModule } from './sizes/sizes.module';
import { ProductSizesModule } from './product-sizes/product-sizes.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ColorsModule } from './colors/colors.module';
import { ProductColorsModule } from './product-colors/product-colors.module';
import { ProductPricingModule } from './product-pricing/product-pricing.module';
import { ProductQuantitiesModule } from './product-quantities/product-quantities.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ProductVideosModule } from './product-videos/product-videos.module';
import { YoutubeModule } from './youtube/youtube.module';
import { ProductFeaturesModule } from './product-features/product-features.module';
import { ProductFaqsModule } from './product-faqs/product-faqs.module';
import { ProductMetatagsModule } from './product-metatags/product-metatags.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    ProductsModule,
    SizesModule,
    ProductSizesModule,
    CategoriesModule,
    ProductCategoriesModule,
    ColorsModule,
    ProductColorsModule,
    ProductPricingModule,
    ProductQuantitiesModule,
    ProductImagesModule,
    ProductVideosModule,
    ProductFeaturesModule,
    ProductMetatagsModule,
    YoutubeModule,
    ProductFaqsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
