import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryAreaDto, UpdateDeliveryAreaDto } from './dto/delivery-area.dto';

@Injectable()
export class ShipmentService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all delivery areas
     */
    async getAllDeliveryAreas() {
        return this.prisma.deliveryArea.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Get active delivery areas only
     */
    async getActiveDeliveryAreas() {
        return this.prisma.deliveryArea.findMany({
            where: { isActive: true },
            orderBy: { areaName: 'asc' },
        });
    }

    /**
     * Get delivery area by ID
     */
    async getDeliveryAreaById(id: number) {
        const area = await this.prisma.deliveryArea.findUnique({
            where: { id },
        });

        if (!area) {
            throw new NotFoundException(`Delivery area with ID ${id} not found`);
        }

        return area;
    }

    /**
     * Create new delivery area
     */
    async createDeliveryArea(dto: CreateDeliveryAreaDto) {
        // Check if area name already exists
        const existing = await this.prisma.deliveryArea.findUnique({
            where: { areaName: dto.name },
        });

        if (existing) {
            throw new ConflictException(`Delivery area "${dto.name}" already exists`);
        }

        return this.prisma.deliveryArea.create({
            data: {
                areaName: dto.name,
                charge: dto.charge,
                isActive: dto.isActive ?? true,
            },
        });
    }

    /**
     * Update delivery area
     */
    async updateDeliveryArea(id: number, dto: UpdateDeliveryAreaDto) {
        // Check if area exists
        await this.getDeliveryAreaById(id);

        // If updating name, check if new name already exists
        if (dto.name) {
            const existing = await this.prisma.deliveryArea.findFirst({
                where: {
                    areaName: dto.name,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictException(`Delivery area "${dto.name}" already exists`);
            }
        }

        // Map DTO name to database areaName
        const updateData: any = { ...dto };
        if (dto.name) {
            updateData.areaName = dto.name;
            delete updateData.name;
        }

        return this.prisma.deliveryArea.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Delete delivery area
     */
    async deleteDeliveryArea(id: number) {
        // Check if area exists
        await this.getDeliveryAreaById(id);

        await this.prisma.deliveryArea.delete({
            where: { id },
        });

        return { message: 'Delivery area deleted successfully' };
    }

    /**
     * Toggle delivery area active status
     */
    async toggleDeliveryAreaStatus(id: number) {
        const area = await this.getDeliveryAreaById(id);

        return this.prisma.deliveryArea.update({
            where: { id },
            data: { isActive: !area.isActive },
        });
    }
}
