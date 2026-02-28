import { Injectable, OnModuleDestroy } from '@nestjs/common';

/**
 * Server-side CSRF token store.
 * 
 * In cross-origin deployments (e.g. Vercel frontend ↔ Render backend),
 * browsers may block/ignore third-party cookies with SameSite=None.
 * This store provides a server-side fallback for CSRF validation
 * when the Double Submit Cookie pattern fails.
 * 
 * Tokens are stored in-memory with a 10-minute TTL and are single-use.
 */
@Injectable()
export class CsrfTokenStore implements OnModuleDestroy {
    private readonly tokens = new Map<string, number>(); // token → expiry timestamp
    private readonly TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes
    private cleanupInterval: ReturnType<typeof setInterval>;

    constructor() {
        // Periodically clean up expired tokens every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    onModuleDestroy() {
        clearInterval(this.cleanupInterval);
    }

    /**
     * Store a CSRF token with TTL.
     */
    store(token: string): void {
        this.tokens.set(token, Date.now() + this.TOKEN_TTL_MS);
    }

    /**
     * Validate and consume a CSRF token (single-use).
     * Returns true if the token is valid and not expired.
     */
    validate(token: string): boolean {
        const expiry = this.tokens.get(token);

        if (expiry === undefined) {
            return false;
        }

        // Always remove — single-use
        this.tokens.delete(token);

        // Check if expired
        return Date.now() < expiry;
    }

    /**
     * Remove all expired tokens from the store.
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [token, expiry] of this.tokens) {
            if (now >= expiry) {
                this.tokens.delete(token);
            }
        }
    }
}
