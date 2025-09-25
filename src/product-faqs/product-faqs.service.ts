import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductFaqsDto } from './dto/product-faq.dto';

@Injectable()
export class ProductFaqsService {
    constructor(private prisma: PrismaService) { }

    async createMany(dto: CreateProductFaqsDto) {
        const { productId, faqs } = dto;
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);

        const created = await this.prisma.$transaction(
            faqs.map(f => this.prisma.product_faq.create({ data: { productId, question: f.question, answer: f.answer } }))
        );

        return { createdCount: created.length, items: created };
    }

    findAll() {
        return this.prisma.product_faq.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: number) {
        const item = await this.prisma.product_faq.findUnique({ where: { id } });
        if (!item) throw new NotFoundException(`Product FAQ with ID ${id} not found`);
        return item;
    }

    async update(id: number, body: any) {
        await this.findOne(id);
        return this.prisma.product_faq.update({ where: { id }, data: body as any });
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.prisma.product_faq.delete({ where: { id } });
        return { message: `Product FAQ ${id} deleted` };
    }
}
