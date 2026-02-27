import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    // Register new user
    async register(dto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const saltRounds = this.configService.get<number>('security.bcryptSaltRounds') || 12;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                password: hashedPassword,
                name: dto.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                dailyCredits: true,
                uploadCredits: true,
            },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            ...tokens,
            user,
        };
    }

    // Login user
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                dailyCredits: user.dailyCredits,
                uploadCredits: user.uploadCredits,
            },
        };
    }

    // Refresh access token
    async refreshToken(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('jwt.refreshSecret'),
            });

            // Find all refresh tokens for user
            const userTokens = await this.prisma.refreshToken.findMany({
                where: { userId: payload.sub },
                include: { user: true },
            });

            // Find matching token
            let storedToken = null;
            for (const token of userTokens) {
                const isMatch = await bcrypt.compare(refreshToken, token.token);
                if (isMatch) {
                    storedToken = token;
                    break;
                }
            }

            if (!storedToken || storedToken.expiresAt < new Date()) {
                // Potential reuse detection could go here (invalidate all user tokens)
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Delete old refresh token (Rotation)
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });

            // Generate new tokens
            const tokens = await this.generateTokens(
                storedToken.user.id,
                storedToken.user.email,
                storedToken.user.role,
            );

            return {
                ...tokens,
                user: {
                    id: storedToken.user.id,
                    email: storedToken.user.email,
                    name: storedToken.user.name,
                    role: storedToken.user.role,
                    dailyCredits: storedToken.user.dailyCredits,
                    uploadCredits: storedToken.user.uploadCredits,
                },
            };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    // Logout user
    async logout(refreshToken: string) {
        // We can't delete by token directly since it's hashed.
        // We rely on the user ID from the token, or we iterate.
        // If the token is invalid/expired, we can't get the ID. 
        // For logout, we might just accept it properly if we can decode it.
        try {
            const payload = this.jwtService.decode(refreshToken) as any;
            if (payload && payload.sub) {
                const userTokens = await this.prisma.refreshToken.findMany({
                    where: { userId: payload.sub },
                });
                for (const token of userTokens) {
                    if (await bcrypt.compare(refreshToken, token.token)) {
                        await this.prisma.refreshToken.delete({ where: { id: token.id } });
                        break;
                    }
                }
            }
        } catch (e) {
            // Ignore errors during logout
        }

        return { message: 'Logged out successfully' };
    }

    // Get current user
    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                dailyCredits: true,
                uploadCredits: true,
                subscription: {
                    select: {
                        plan: { select: { id: true, name: true, interval: true } },
                        active: true,
                        endDate: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    // Update profile
    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { ...dto },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                dailyCredits: true,
                uploadCredits: true,
            },
        });
        return user;
    }

    // Generate access and refresh tokens
    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('jwt.secret'),
            expiresIn: '15m', // Short-lived
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('jwt.refreshSecret'),
            expiresIn: '7d',
        });

        // Store hashed refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const salt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

        await this.prisma.refreshToken.create({
            data: {
                token: hashedRefreshToken,
                userId,
                expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }
}
