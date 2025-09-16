import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSizeDto, UpdateSizeDto } from './dto/size.dto';

@Injectable()
export class SizesService {
    constructor(private prisma: PrismaService) { }

    async create(createSizeDto: CreateSizeDto) {
        try {
            return await this.prisma.size.create({
                data: createSizeDto,
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException(
                    `Size with value "${createSizeDto.value}" and system "${createSizeDto.system}" already exists`
                );
            }
            throw error;
        }
    }

    async findAll() {
        return this.prisma.size.findMany({
            orderBy: [
                { system: 'asc' },
                { value: 'asc' },
            ],
        });
    }

    async findOne(id: number) {
        const size = await this.prisma.size.findUnique({
            where: { id },
        });

        if (!size) {
            throw new NotFoundException(`Size with ID ${id} not found`);
        }

        return size;
    }

    async findByValueAndSystem(value: string, system?: string) {
        const size = await this.prisma.size.findFirst({
            where: {
                value,
                system: system || null,
            },
        });

        if (!size) {
            throw new NotFoundException(
                `Size with value "${value}" and system "${system || 'none'}" not found`
            );
        }

        return size;
    }

    async findBySystem(system: string) {
        return this.prisma.size.findMany({
            where: { system },
            orderBy: { value: 'asc' },
        });
    }

    async update(id: number, updateSizeDto: UpdateSizeDto) {
        const size = await this.prisma.size.findUnique({
            where: { id },
        });

        if (!size) {
            throw new NotFoundException(`Size with ID ${id} not found`);
        }

        try {
            return await this.prisma.size.update({
                where: { id },
                data: updateSizeDto,
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException(
                    `Size with value "${updateSizeDto.value}" and system "${updateSizeDto.system}" already exists`
                );
            }
            throw error;
        }
    }

    async remove(id: number) {
        const size = await this.prisma.size.findUnique({
            where: { id },
            // include: {
            //     products: true,
            // },
        });

        if (!size) {
            throw new NotFoundException(`Size with ID ${id} not found`);
        }

        // if (size.products.length > 0) {
        //     throw new ConflictException(
        //         `Cannot delete size "${size.value}" as it is associated with ${size.products.length} product(s)`
        //     );
        // }

        await this.prisma.size.delete({
            where: { id },
        });

        return { message: `Size "${size.value}" has been deleted` };
    }
}