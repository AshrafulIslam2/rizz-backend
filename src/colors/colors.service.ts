import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorDto, UpdateColorDto } from './dto/color.dto';

@Injectable()
export class ColorsService {
    constructor(private prisma: PrismaService) { }

    async create(createColorDto: CreateColorDto) {
        const { name, hexCode } = createColorDto;

        // Check if color with same name and hexCode already exists
        const existingColor = await this.prisma.color.findFirst({
            where: {
                name,
                hexCode: hexCode || null,
            },
        });

        if (existingColor) {
            throw new ConflictException(
                `Color with name "${name}"${hexCode ? ` and hex code "${hexCode}"` : ''} already exists`
            );
        }

        try {
            return await this.prisma.color.create({
                data: {
                    name,
                    hexCode: hexCode || null,
                },
            });
        } catch (error) {
            throw new BadRequestException('Failed to create color');
        }
    }

    async findAll() {
        return this.prisma.color.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    }

    async findOne(id: number) {
        const color = await this.prisma.color.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!color) {
            throw new NotFoundException(`Color with ID ${id} not found`);
        }

        return color;
    }

    async update(id: number, updateColorDto: UpdateColorDto) {
        const color = await this.findOne(id);

        const { name, hexCode } = updateColorDto;

        // If updating name or hexCode, check for conflicts
        if (name !== undefined || hexCode !== undefined) {
            const updatedName = name !== undefined ? name : color.name;
            const updatedHexCode = hexCode !== undefined ? hexCode : color.hexCode;

            const existingColor = await this.prisma.color.findFirst({
                where: {
                    AND: [
                        { id: { not: id } }, // Exclude current color
                        { name: updatedName },
                        { hexCode: updatedHexCode || null },
                    ],
                },
            });

            if (existingColor) {
                throw new ConflictException(
                    `Color with name "${updatedName}"${updatedHexCode ? ` and hex code "${updatedHexCode}"` : ''} already exists`
                );
            }
        }

        try {
            return await this.prisma.color.update({
                where: { id },
                data: {
                    ...(name !== undefined && { name }),
                    ...(hexCode !== undefined && { hexCode: hexCode || null }),
                },
            });
        } catch (error) {
            throw new BadRequestException('Failed to update color');
        }
    }

    async remove(id: number) {
        const color = await this.findOne(id);

        // Check if color is being used by any products
        const productCount = await this.prisma.product_colors.count({
            where: { colorId: id },
        });

        if (productCount > 0) {
            throw new ConflictException(
                `Cannot delete color "${color.name}" as it is associated with ${productCount} product(s)`
            );
        }

        try {
            await this.prisma.color.delete({
                where: { id },
            });

            return {
                message: `Color "${color.name}" has been deleted successfully`,
            };
        } catch (error) {
            throw new BadRequestException('Failed to delete color');
        }
    }

    async getColorProducts(id: number) {
        const color = await this.findOne(id);

        return this.prisma.product_colors.findMany({
            where: { colorId: id },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                        basePrice: true,
                        discountedPrice: true,
                        published: true,
                        isFeatured: true,
                    },
                },
            },
            orderBy: {
                product: { title: 'asc' },
            },
        });
    }
}