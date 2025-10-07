
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Prisma, $Enums } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate a unique order code with format: ORD-YEAR-RANDOM6
     * Example: ORD-2025-9F3C21
     */
    private async generateUniqueOrderCode(tx: any): Promise<string> {
        let orderCode: string;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            // Generate order code: ORD-YEAR-RANDOM6
            const year = new Date().getFullYear();
            const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase();
            orderCode = `ORD-${year}-${randomPart}`;

            // Check if it already exists
            const existing = await tx.order.findUnique({
                where: { orderCode }
            });

            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new BadRequestException('Failed to generate unique order code. Please try again.');
        }

        return orderCode!;
    }

    async checkout(dto: CheckoutDto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Check if user exists by phone or email
            let user = await tx.user.findFirst({
                where: {
                    OR: [
                        { phoneNumber: dto.user.phone },
                        { email: dto.user.email }
                    ]
                }
            });

            // 2. If user doesn't exist, create new user
            if (!user) {
                user = await tx.user.create({
                    data: {
                        name: dto.user.name,
                        email: dto.user.email,
                        phoneNumber: dto.user.phone,
                    }
                });
            }

            // 3. Validate products and stock
            const stockValidations = await Promise.all(
                dto.products.map(async (product) => {
                    const pq = await tx.product_quantity.findFirst({
                        where: {
                            productId: product.id,
                            colorId: product.colorId ?? undefined,
                            sizeId: product.sizeId ?? undefined,
                        },
                    });
                    if (!pq || pq.available_quantity < product.quantity) {
                        throw new BadRequestException(
                            `Insufficient stock for product ${product.name} (ID: ${product.id})`
                        );
                    }
                    return { pq, product };
                })
            );

            // 4. Reduce stock
            await Promise.all(
                stockValidations.map(({ pq, product }) =>
                    tx.product_quantity.update({
                        where: { id: pq.id },
                        data: { available_quantity: { decrement: product.quantity } },
                    })
                )
            );

            // 5. Generate unique order code
            const orderCode = await this.generateUniqueOrderCode(tx);

            // 6. Create order with items and shipping
            const order = await tx.order.create({
                data: {
                    orderCode,
                    userId: user.id,
                    status: $Enums.OrderStatus.PENDING,
                    total: dto.totalPayableAmount,
                    deliveryCharge: dto.deliveryCharge,
                    items: {
                        create: dto.products.map((product) => ({
                            productId: product.id,
                            quantity: product.quantity,
                            price: product.price,
                            colorId: product.colorId,
                            sizeId: product.sizeId,
                        })),
                    },
                    shipping: {
                        create: {
                            fullName: dto.user.name,
                            address1: dto.user.address,
                            email: dto.user.email,
                            phone: dto.user.phone,
                            deliveryArea: dto.user.deliveryArea,
                        },
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    product_image: true,
                                }
                            },
                            color: true,
                            size: true,
                        }
                    },
                    shipping: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                        }
                    }
                },
            });

            return order;
        });
    }

    async getUserOrders(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                product_image: true,
                            }
                        },
                        color: true,
                        size: true,
                    }
                },
                shipping: true
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getOrderById(id: number, userId?: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                product_image: true,
                            }
                        },
                        color: true,
                        size: true,
                    }
                },
                shipping: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                }
            },
        });
        if (!order) throw new NotFoundException('Order not found');
        if (userId && order.userId !== userId) throw new NotFoundException('Order not found');
        return order;
    }

    async getAllOrders() {
        return this.prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                product_image: true,
                            }
                        },
                        color: true,
                        size: true,
                    }
                },
                shipping: true,
                user: true
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateOrderStatus(id: number, dto: UpdateOrderStatusDto) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
        });
        return order;
    }

    async cancelOrder(id: number, userId: number) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
        if (order.status !== $Enums.OrderStatus.PENDING) throw new BadRequestException('Cannot cancel this order');
        // Optionally, restore stock here
        return this.prisma.order.update({ where: { id }, data: { status: $Enums.OrderStatus.CANCELLED } });
    }

    async updateShippingAddress(shippingId: number, updateData: UpdateShippingDto) {
        // Verify shipping record exists
        const shipping = await this.prisma.order_shipping.findUnique({
            where: { id: shippingId }
        });

        if (!shipping) {
            throw new NotFoundException('Shipping information not found');
        }

        // Update shipping address (only fields that are provided)
        const updatedShipping = await this.prisma.order_shipping.update({
            where: { id: shippingId },
            data: updateData,
        });

        return updatedShipping;
    }
}
