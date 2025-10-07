import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthResponse } from './types/auth.types';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // Note: Password-based authentication has been removed
    // Users are now created automatically during checkout
    // This auth service is kept for potential future use

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        throw new BadRequestException(
            'Password-based authentication is disabled. Users are created automatically during checkout.'
        );
    }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        throw new BadRequestException(
            'Password-based registration is disabled. Users are created automatically during checkout.'
        );
    }

    // Helper method to generate token for a user (for future use)
    async generateToken(userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const payload = { email: user.email, sub: user.id };
        return this.jwtService.sign(payload);
    }

    // Validate user by email and phone (for future use)
    async validateUserByEmailOrPhone(email: string, phoneNumber: string) {
        const user = await this.usersService.findByEmail(email);

        if (user && user.phoneNumber === phoneNumber) {
            return user;
        }

        return null;
    }
}
