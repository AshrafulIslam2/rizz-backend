import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    AddCategoryToProductDto,
    RemoveCategoryFromProductDto,
    BulkAddCategoriesToProductDto,
    BulkAddProductsToCategoryDto
} from './dto/product-category.dto';

@Injectable()
export class ProductCategoriesService {
    constructor(private prisma: PrismaService) { }

    async addCategoryToProduct(addCategoryToProductDto: AddCategoryToProductDto) {
        const { productId, selectedCategories } = addCategoryToProductDto;

        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Check if all categories exist
        const categories = await this.prisma.category.findMany({
            where: { id: { in: selectedCategories } },
        });

        if (categories.length !== selectedCategories.length) {
            const foundCategoryIds = categories.map(c => c.id);
            const missingCategoryIds = selectedCategories.filter(id => !foundCategoryIds.includes(id));
            throw new NotFoundException(`Categories with IDs ${missingCategoryIds.join(', ')} not found`);
        }

        // Check for existing associations
        const existingProductCategories = await this.prisma.productCategory.findMany({
            where: {
                productId,
                categoryId: { in: selectedCategories },
            },
        });

        if (existingProductCategories.length > 0) {
            const existingCategoryIds = existingProductCategories.map(pc => pc.categoryId);
            const existingCategoryNames = categories
                .filter(c => existingCategoryIds.includes(c.id))
                .map(c => c.name);
            throw new ConflictException(
                `Product "${product.title}" is already associated with categories: ${existingCategoryNames.join(', ')}`
            );
        }

        try {
            // Create all associations
            const createData = selectedCategories.map(categoryId => ({
                productId,
                categoryId,
            }));

            const createdAssociations = await this.prisma.productCategory.createMany({
                data: createData,
            });

            // Return the created associations with product and category details
            const result = await this.prisma.productCategory.findMany({
                where: {
                    productId,
                    categoryId: { in: selectedCategories },
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            sku: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            return {
                message: `Successfully added ${createdAssociations.count} categories to product`,
                associations: result,
            };
        } catch (error) {
            throw new BadRequestException('Failed to add categories to product');
        }
    }

    async bulkAddCategoriesToProduct(bulkAddCategoriesToProductDto: BulkAddCategoriesToProductDto) {
        const { productId, categories } = bulkAddCategoriesToProductDto;

        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Validate all category IDs exist
        const categoryIds = categories.map(c => c.categoryId);
        const existingCategories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
        });

        if (existingCategories.length !== categoryIds.length) {
            const foundCategoryIds = existingCategories.map(c => c.id);
            const missingCategoryIds = categoryIds.filter(id => !foundCategoryIds.includes(id));
            throw new NotFoundException(`Categories with IDs ${missingCategoryIds.join(', ')} not found`);
        }

        // Check for existing associations
        const existingProductCategories = await this.prisma.productCategory.findMany({
            where: {
                productId,
                categoryId: { in: categoryIds },
            },
            include: {
                category: true,
            },
        });

        if (existingProductCategories.length > 0) {
            const existingCategoryNames = existingProductCategories.map(pc => pc.category.name);
            throw new ConflictException(
                `Categories [${existingCategoryNames.join(', ')}] are already associated with this product`
            );
        }

        // Create all associations
        const createData = categoryIds.map(categoryId => ({
            productId,
            categoryId,
        }));

        try {
            return await this.prisma.productCategory.createMany({
                data: createData,
            });
        } catch (error) {
            throw new BadRequestException('Failed to add categories to product');
        }
    }

    async bulkAddProductsToCategory(bulkAddProductsToCategoryDto: BulkAddProductsToCategoryDto) {
        const { categoryId, products } = bulkAddProductsToCategoryDto;

        // Check if category exists
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }

        // Validate all product IDs exist
        const productIds = products.map(p => p.productId);
        const existingProducts = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        if (existingProducts.length !== productIds.length) {
            const foundProductIds = existingProducts.map(p => p.id);
            const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));
            throw new NotFoundException(`Products with IDs ${missingProductIds.join(', ')} not found`);
        }

        // Check for existing associations
        const existingProductCategories = await this.prisma.productCategory.findMany({
            where: {
                categoryId,
                productId: { in: productIds },
            },
            include: {
                product: true,
            },
        });

        if (existingProductCategories.length > 0) {
            const existingProductTitles = existingProductCategories.map(pc => pc.product.title);
            throw new ConflictException(
                `Products [${existingProductTitles.join(', ')}] are already associated with this category`
            );
        }

        // Create all associations
        const createData = productIds.map(productId => ({
            productId,
            categoryId,
        }));

        try {
            return await this.prisma.productCategory.createMany({
                data: createData,
            });
        } catch (error) {
            throw new BadRequestException('Failed to add products to category');
        }
    }

    async getProductCategories(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return this.prisma.productCategory.findMany({
            where: { productId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        parentId: true,
                        parent: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                category: { name: 'asc' },
            },
        });
    }

    async getCategoryProducts(categoryId: number) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }

        return this.prisma.productCategory.findMany({
            where: { categoryId },
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

    async removeCategoryFromProduct(removeCategoryFromProductDto: RemoveCategoryFromProductDto) {
        const { productId, categoryId } = removeCategoryFromProductDto;

        const productCategory = await this.prisma.productCategory.findUnique({
            where: {
                productId_categoryId: {
                    productId,
                    categoryId,
                },
            },
            include: {
                product: { select: { title: true } },
                category: { select: { name: true } },
            },
        });

        if (!productCategory) {
            throw new NotFoundException(
                `Category association not found for product ID ${productId} and category ID ${categoryId}`
            );
        }

        await this.prisma.productCategory.delete({
            where: {
                productId_categoryId: {
                    productId,
                    categoryId,
                },
            },
        });

        return {
            message: `Category "${productCategory.category.name}" removed from product "${productCategory.product.title}"`,
        };
    }

    async removeAllCategoriesFromProduct(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const deletedCount = await this.prisma.productCategory.deleteMany({
            where: { productId },
        });

        return {
            message: `Removed ${deletedCount.count} categories from product "${product.title}"`,
        };
    }

    async removeAllProductsFromCategory(categoryId: number) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }

        const deletedCount = await this.prisma.productCategory.deleteMany({
            where: { categoryId },
        });

        return {
            message: `Removed ${deletedCount.count} products from category "${category.name}"`,
        };
    }
}