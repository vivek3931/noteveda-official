import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // Exempt safe methods
        if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
            return true;
        }

        // Exempt Refresh Endpoint
        if (request.url.includes('/auth/refresh')) {
            return true;
        }

        const tokenFromHeader = request.headers['x-csrf-token'];
        const tokenFromCookie = request.cookies['csrf_token'];

        if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
            throw new UnauthorizedException('Invalid CSRF Token');
        }

        return true;
    }
}
