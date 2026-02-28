import type { NextConfig } from "next";

// Backend URL for API proxy rewrites (server-side only, not exposed to client)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const isProd = process.env.NODE_ENV === 'production';

// Build CSP dynamically based on environment
const connectSrc = isProd
  ? "'self' https:"
  : `'self' http://localhost:5000 https:`;
const imgSrc = isProd
  ? "'self' data: blob: https:"
  : "'self' data: blob: https: http://localhost:5000";

const cspValue = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src ${imgSrc}; connect-src ${connectSrc}; frame-src 'self' https://api.razorpay.com;`;

const nextConfig: NextConfig = {
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent XSS attacks
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
    ];
  },

  // API Proxy Rewrites — makes API calls same-origin so cookies work reliably.
  // In production: frontend calls /api/... → rewritten to Render backend.
  // In local dev: NEXT_PUBLIC_API_URL points directly to localhost:5000/api,
  //               so these rewrites are only used as a fallback.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Strict mode for development
  reactStrictMode: true,

  // Transpile packages to fix ESM/CJS interop issues
  transpilePackages: ['react-pdf', 'pdfjs-dist'],

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },

  // Turbopack config (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
