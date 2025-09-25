import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductMetatagDto, UpdateProductMetatagDto } from './dto/product-metatag.dto';

@Injectable()
export class ProductMetatagsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateProductMetatagDto) {
        // ensure product exists
        const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
        if (!product) throw new NotFoundException(`Product with ID ${dto.productId} not found`);

        // upsert behavior: if a metatag already exists for this product, replace it
        const existing = await this.prisma.product_metatag.findFirst({ where: { productId: dto.productId } });
        if (existing) {
            return this.prisma.product_metatag.update({ where: { id: existing.id }, data: dto });
        }

        return this.prisma.product_metatag.create({ data: dto as any });
    }

    findAll() {
        return this.prisma.product_metatag.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: number) {
        const item = await this.prisma.product_metatag.findUnique({ where: { id } });
        if (!item) throw new NotFoundException(`Product metatag with ID ${id} not found`);
        return item;
    }

    async update(id: number, dto: UpdateProductMetatagDto) {
        await this.findOne(id);
        return this.prisma.product_metatag.update({ where: { id }, data: dto as any });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.product_metatag.delete({ where: { id } });
        return { message: `Product metatag ${id} deleted` };
    }
}
