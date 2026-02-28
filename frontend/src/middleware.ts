import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Define Public, Guest, and Protected paths
    const publicPaths = ['/browse', '/pricing', '/about', '/contact', '/privacy', '/terms'];
    const guestPaths = ['/login', '/register', '/forgot-password'];
    // Protected paths are everything else not in exclusions

    const { pathname } = request.nextUrl;

    // 2. Exclude Static Assets and API Routes (API routes are handled by Next.js rewrites)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2)$/)
    ) {
        return NextResponse.next();
    }

    // 3. Get Auth State Hint
    // Check both is_authenticated and access_token cookies as auth signals.
    // With same-origin API proxy, cookies are first-party and reliably stored.
    const isAuthenticated = request.cookies.has('is_authenticated') || request.cookies.has('access_token');

    // 4. Guest Paths Logic (Login/Register)
    // If authenticated (has token hint), redirect to Dashboard
    if (guestPaths.includes(pathname) && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 5. Protected Paths Logic
    // If NO token hint and NOT public/guest -> Redirect to Login
    const isPublic = pathname === '/' || publicPaths.some(path => pathname.startsWith(path));
    const isGuest = guestPaths.includes(pathname);

    if (!isPublic && !isGuest && !isAuthenticated) {
        // Allow public access to resource pages likely, checking dynamic routes
        if (pathname.startsWith('/resource/')) {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
