import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductFeatureDto, UpdateProductFeatureDto, CreateProductFeaturesDto } from './dto/product-feature.dto';

@Injectable()
export class ProductFeaturesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateProductFeatureDto) {
        // ensure product exists
        const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
        if (!product) throw new NotFoundException(`Product with ID ${dto.productId} not found`);

        return this.prisma.product_feature.create({ data: dto });
    }

    async createMany(dto: CreateProductFeaturesDto) {
        const { productId, features } = dto;
        // ensure product exists
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);

        const data = features.map(f => ({
            productId,
            feature_title: f.name,
            feature_desc: f.value || null,
        }));

        // create many using transaction
        const created = await this.prisma.$transaction(
            data.map(d => this.prisma.product_feature.create({ data: d }))
        );

        return { createdCount: created.length, items: created };
    }

    async findAll() {
        return this.prisma.product_feature.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: number) {
        const item = await this.prisma.product_feature.findUnique({ where: { id } });
        if (!item) throw new NotFoundException(`Product feature with ID ${id} not found`);
        return item;
    }

    async update(id: number, dto: UpdateProductFeatureDto) {
        await this.findOne(id);
        return this.prisma.product_feature.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.product_feature.delete({ where: { id } });
        return { message: `Product feature ${id} deleted` };
    }
}
