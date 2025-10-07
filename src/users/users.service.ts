import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        return this.prisma.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                phoneNumber: createUserDto.phoneNumber,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        await this.findOne(id); // Verify user exists

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Verify user exists

        return this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
            },
        });
    }
}
