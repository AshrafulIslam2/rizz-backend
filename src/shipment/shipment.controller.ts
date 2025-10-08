import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateDeliveryAreaDto, UpdateDeliveryAreaDto } from './dto/delivery-area.dto';

@Controller('shipment')
export class ShipmentController {
    constructor(private readonly shipmentService: ShipmentService) { }

    /**
     * Get all delivery areas
     * GET /shipment/delivery-areas
     */
    @Get('delivery-areas')
    async getAllDeliveryAreas() {
        return this.shipmentService.getAllDeliveryAreas();
    }

    /**
     * Get active delivery areas only
     * GET /shipment/delivery-areas/active
     */
    @Get('delivery-areas/active')
    async getActiveDeliveryAreas() {
        return this.shipmentService.getActiveDeliveryAreas();
    }

    /**
     * Get delivery area by ID
     * GET /shipment/delivery-areas/:id
     */
    @Get('delivery-areas/:id')
    async getDeliveryAreaById(@Param('id') id: number) {
        return this.shipmentService.getDeliveryAreaById(Number(id));
    }

    /**
     * Create new delivery area
     * POST /shipment/delivery-areas
     */
    @Post('delivery-areas')
    async createDeliveryArea(@Body() dto: CreateDeliveryAreaDto) {
        return this.shipmentService.createDeliveryArea(dto);
    }

    /**
     * Update delivery area
     * PUT /shipment/delivery-areas/:id
     */
    @Put('delivery-areas/:id')
    async updateDeliveryArea(
        @Param('id') id: number,
        @Body() dto: UpdateDeliveryAreaDto
    ) {
        return this.shipmentService.updateDeliveryArea(Number(id), dto);
    }

    /**
     * Delete delivery area
     * DELETE /shipment/delivery-areas/:id
     */
    @Delete('delivery-areas/:id')
    async deleteDeliveryArea(@Param('id') id: number) {
        return this.shipmentService.deleteDeliveryArea(Number(id));
    }

    /**
     * Toggle delivery area status
     * PATCH /shipment/delivery-areas/:id/toggle
     */
    @Patch('delivery-areas/:id/toggle')
    async toggleDeliveryAreaStatus(@Param('id') id: number) {
        return this.shipmentService.toggleDeliveryAreaStatus(Number(id));
    }
}
