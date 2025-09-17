import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        const { name, parentId } = createCategoryDto;

        // Check if parent category exists (if parentId is provided)
        if (parentId) {
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: parentId },
            });
            if (!parentCategory) {
                throw new NotFoundException(`Parent category with ID ${parentId} not found`);
            }
        }

        try {
            return await this.prisma.category.create({
                data: {
                    name,
                    parentId: parentId || null,
                },
                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    children: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    products: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException(`Category with name "${name}" already exists`);
            }
            throw error;
        }
    }

    async findAll() {
        return this.prisma.category.findMany({
            select: {
                id: true,
                name: true,
                parentId: true, // keep this if you want to know the hierarchy
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findRootCategories() {
        return this.prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                sku: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findCategoryTree() {
        const categories = await this.prisma.category.findMany({
            include: {
                children: {
                    include: {
                        children: {
                            include: {
                                children: true, // Support up to 4 levels deep
                            },
                        },
                    },
                },
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                sku: true,
                            },
                        },
                    },
                },
            },
            where: { parentId: null },
            orderBy: { name: 'asc' },
        });

        return categories;
    }

    async findOne(id: number) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                sku: true,
                                basePrice: true,
                                published: true,
                            },
                        },
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async findChildren(parentId: number) {
        const parentCategory = await this.prisma.category.findUnique({
            where: { id: parentId },
        });

        if (!parentCategory) {
            throw new NotFoundException(`Parent category with ID ${parentId} not found`);
        }

        return this.prisma.category.findMany({
            where: { parentId },
            include: {
                children: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                sku: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        const { name, parentId } = updateCategoryDto;

        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        // Prevent circular references
        if (parentId) {
            if (parentId === id) {
                throw new BadRequestException('Category cannot be its own parent');
            }

            // Check if parentId exists
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: parentId },
            });
            if (!parentCategory) {
                throw new NotFoundException(`Parent category with ID ${parentId} not found`);
            }

            // Check if setting this parent would create a circular reference
            const isDescendant = await this.isDescendant(id, parentId);
            if (isDescendant) {
                throw new BadRequestException(
                    'Cannot set parent category: this would create a circular reference'
                );
            }
        }

        try {
            return await this.prisma.category.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(parentId !== undefined && { parentId: parentId || null }),
                },
                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    children: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    products: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException(`Category with name "${name}" already exists`);
            }
            throw error;
        }
    }

    async remove(id: number) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                products: true,
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        if (category.children.length > 0) {
            throw new ConflictException(
                `Cannot delete category "${category.name}" as it has ${category.children.length} child categories`
            );
        }

        if (category.products.length > 0) {
            throw new ConflictException(
                `Cannot delete category "${category.name}" as it is associated with ${category.products.length} product(s)`
            );
        }

        await this.prisma.category.delete({
            where: { id },
        });

        return { message: `Category "${category.name}" has been deleted` };
    }

    // Helper method to check if a category is a descendant of another
    private async isDescendant(categoryId: number, potentialAncestorId: number): Promise<boolean> {
        const descendants = await this.getDescendants(categoryId);
        return descendants.some(desc => desc.id === potentialAncestorId);
    }

    // Helper method to get all descendants of a category
    private async getDescendants(categoryId: number): Promise<{ id: number }[]> {
        const descendants: { id: number }[] = [];

        const getChildren = async (parentId: number) => {
            const children = await this.prisma.category.findMany({
                where: { parentId },
                select: { id: true },
            });

            for (const child of children) {
                descendants.push(child);
                await getChildren(child.id);
            }
        };

        await getChildren(categoryId);
        return descendants;
    }
}