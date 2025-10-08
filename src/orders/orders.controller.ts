import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // @UseGuards(JwtAuthGuard)
    @Post('checkout')
    async checkout(@Body() dto: CheckoutDto) {
        return this.ordersService.checkout(dto);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('my')
    async getUserOrders(@Query('userId') userId: number) {
        return this.ordersService.getUserOrders(Number(userId));
    }

    // @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getOrderById(@Param('id') id: number, @Query('userId') userId?: number) {
        return this.ordersService.getOrderById(Number(id), userId ? Number(userId) : undefined);
    }

    // @UseGuards(JwtAuthGuard) // Admin only
    @Get()
    async getAllOrders() {
        return this.ordersService.getAllOrders();
    }

    // @UseGuards(JwtAuthGuard) // Admin only
    @Put(':id/status')
    async updateOrderStatus(@Param('id') id: number, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(Number(id), dto);
    }

    // @UseGuards(JwtAuthGuard)
    @Put(':id/cancel')
    async cancelOrder(@Param('id') id: number, @Query('userId') userId: number) {
        return this.ordersService.cancelOrder(Number(id), Number(userId));
    }

    // @UseGuards(JwtAuthGuard)
    @Put('shipping/:shippingId')
    async updateShippingAddress(
        @Param('shippingId') shippingId: number,
        @Body() dto: UpdateShippingDto
    ) {
        return this.ordersService.updateShippingAddress(
            Number(shippingId),
            dto
        );
    }

    // @UseGuards(JwtAuthGuard)
    @Put('items/:itemId/quantity')
    async updateOrderItemQuantity(
        @Param('itemId') itemId: number,
        @Body() dto: UpdateOrderItemDto
    ) {
        return this.ordersService.updateOrderItemQuantity(
            Number(itemId),
            dto
        );
    }
}
