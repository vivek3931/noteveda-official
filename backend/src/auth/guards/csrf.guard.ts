import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Request } from 'express';
import { CsrfTokenStore } from '../services/csrf-token-store.service';

@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(@Inject(CsrfTokenStore) private readonly csrfTokenStore: CsrfTokenStore) { }

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

        const tokenFromHeader = request.headers['x-csrf-token'] as string | undefined;
        const tokenFromCookie = request.cookies['csrf_token'];

        if (!tokenFromHeader) {
            throw new UnauthorizedException('Invalid CSRF Token');
        }

        // Path 1: Double Submit Cookie (same-origin / local dev)
        if (tokenFromCookie && tokenFromCookie === tokenFromHeader) {
            return true;
        }

        // Path 2: Server-side store validation (cross-origin / production fallback)
        if (this.csrfTokenStore.validate(tokenFromHeader)) {
            return true;
        }

        throw new UnauthorizedException('Invalid CSRF Token');
    }
}
