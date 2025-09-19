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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
