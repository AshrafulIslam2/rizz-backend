import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto) {
        return this.prisma.product.create({
            data: createProductDto,
            include: {
                product_colors: {
                    include: {
                        color: true,
                    },
                },
                product_pricing: true,
                product_size: {
                    include: {
                        size: true,
                    },
                },
                product_feature: true,
                product_categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }

    async findAll() {
        return this.prisma.product.findMany({
            include: {
                product_colors: {
                    include: {
                        color: true,
                    },
                },
                product_quantity: {
                    include: {
                        color: true,
                        size: true,
                    }
                },
                product_pricing: {
                    include: {
                        color: true,
                        size: true,
                    }
                },
                product_size: {
                    include: {
                        size: true,
                    },
                },
                product_feature: true,
                product_categories: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                product_colors: {
                    include: {
                        color: true,
                    },
                },
                product_pricing: true,
                product_quantity: true,
                product_size: {
                    include: {
                        size: true,
                    },
                },
                product_feature: true,
                product_categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: {
                product_colors: {
                    include: {
                        color: true,
                    },
                },
                product_pricing: true,
                product_size: {
                    include: {
                        size: true,
                    },
                },
                product_feature: true,
                product_categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }

    async remove(id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.prisma.product.delete({
            where: { id },
        });

        return { message: `Product with ID ${id} has been deleted` };
    }

    async findPublished() {
        return this.prisma.product.findMany({
            where: { published: true },
            include: {
                product_colors: {
                    include: {
                        color: true,
                    },
                },
                product_pricing: true,
                product_size: {
                    include: {
                        size: true,
                    },
                },
                product_feature: true,
                product_categories: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findBySku(sku: string) {
        const product = await this.prisma.product.findUnique({
            where: { sku },
            include: {
                product_colors: {
                    include: {
                        color: true,
                    },
                },
                product_pricing: true,
                product_size: {
                    include: {
                        size: true,
                    },
                },
                product_feature: true,
                product_categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with SKU ${sku} not found`);
        }

        return product;
    }
}