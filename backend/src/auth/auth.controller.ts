import { Controller, Post, Body, Get, HttpCode, HttpStatus, Patch, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto, UpdateProfileDto } from './dto';
import { Public } from './decorators';
import { CurrentUser } from './decorators';
import { CsrfGuard } from './guards/csrf.guard';
import * as crypto from 'crypto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Helper to set cookies
    private setCookies(response: any, tokens: { accessToken: string; refreshToken: string }) {
        const isProd = process.env.NODE_ENV === 'production';

        response.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000, // 15m
        });

        response.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/api/auth/refresh', // Scoped to refresh endpoint
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
        });

        // Readable "logged_in" cookie for middleware to know session exists
        response.cookie('is_authenticated', 'true', {
            httpOnly: false, // JS Readable (optional, but good for client to know state too)
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7d matches refresh token
        });

        // Rotate CSRF Token
        const csrfToken = crypto.randomUUID();
        response.cookie('csrf_token', csrfToken, {
            httpOnly: false, // JS Readable
            secure: isProd,
            sameSite: 'lax',
            path: '/',
        });

        return csrfToken;
    }

    @Public()
    @Get('csrf')
    @ApiOperation({ summary: 'Get CSRF Token' })
    getCsrfToken(@Res({ passthrough: true }) response: any) {
        const csrfToken = crypto.randomUUID();
        const isProd = process.env.NODE_ENV === 'production';

        response.cookie('csrf_token', csrfToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
        });

        return { csrfToken };
    }

    @Public()
    @Post('register')
    @UseGuards(CsrfGuard)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
    @ApiResponse({ status: 409, description: 'Email already registered' })
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: any) {
        const result = await this.authService.register(dto);
        const { accessToken, refreshToken, user } = result;

        this.setCookies(response, { accessToken, refreshToken });

        return { user };
    }

    @Public()
    @Post('login')
    @UseGuards(CsrfGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user and get tokens' })
    @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: any) {
        const result = await this.authService.login(dto);
        const { accessToken, refreshToken, user } = result;

        this.setCookies(response, { accessToken, refreshToken });

        return { user };
    }

    @Public()
    @Post('refresh')
    // No CsrfGuard for refresh as it is protected by HttpOnly cookie and path scope
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(@Res({ passthrough: true }) response: any, @Req() request: any) {
        const refreshToken = request.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const result = await this.authService.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken, user } = result;

        this.setCookies(response, { accessToken, refreshToken: newRefreshToken });

        return { user };
    }

    @Post('logout')
    @UseGuards(CsrfGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    async logout(@Res({ passthrough: true }) response: any, @Req() request: any) {
        const refreshToken = request.cookies['refresh_token'];
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        // Clear all cookies
        const isProd = process.env.NODE_ENV === 'production';
        const clearOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax' as const,
            path: '/',
        };

        response.clearCookie('access_token', clearOptions);
        response.clearCookie('refresh_token', { ...clearOptions, path: '/api/auth/refresh' });
        response.clearCookie('csrf_token', { ...clearOptions, httpOnly: false });
        response.clearCookie('is_authenticated', { ...clearOptions, httpOnly: false });

        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current logged-in user info' })
    @ApiResponse({ status: 200, description: 'User information returned' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getMe(@CurrentUser('id') userId: string) {
        return this.authService.getMe(userId);
    }

    @Patch('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
        return this.authService.updateProfile(userId, dto);
    }
}
