
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Prisma, $Enums } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async checkout(dto: CheckoutDto) {
        return this.prisma.$transaction(async (tx) => {
            // Validate products and stock
            const items = await Promise.all(
                dto.items.map(async (item) => {
                    const pq = await tx.product_quantity.findFirst({
                        where: {
                            productId: item.productId,
                            colorId: item.colorId ?? undefined,
                            sizeId: item.sizeId ?? undefined,
                        },
                    });
                    if (!pq || pq.available_quantity < item.quantity) {
                        throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
                    }
                    return pq;
                })
            );
            // Reduce stock
            await Promise.all(
                items.map((pq, idx) =>
                    tx.product_quantity.update({
                        where: { id: pq.id },
                        data: { available_quantity: { decrement: dto.items[idx].quantity } },
                    })
                )
            );
            // Create order
            const total = dto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const order = await tx.order.create({
                data: {
                    userId: dto.userId,
                    status: $Enums.OrderStatus.PENDING,
                    total,
                    items: {
                        create: dto.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            colorId: item.colorId,
                            sizeId: item.sizeId,
                        })),
                    },
                    shipping: {
                        create: dto.shipping,
                    },
                },
                include: { items: true, shipping: true },
            });
            return order;
        });
    }

    async getUserOrders(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: true, shipping: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getOrderById(id: number, userId?: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true, shipping: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        if (userId && order.userId !== userId) throw new NotFoundException('Order not found');
        return order;
    }

    async getAllOrders() {
        return this.prisma.order.findMany({
            include: { items: true, shipping: true, user: true },
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
}
