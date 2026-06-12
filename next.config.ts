import type { NextConfig } from 'next';

// Archive mode: static goodbye page only. No wallet, backend, or websocket origins.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "frame-ancestors 'self'"
].join('; ');

// NOTE: we do not import NextConfig here any more –
//       we will assert the object at the bottom with `satisfies`.
const nextConfig = {
  // dev-only: suppress “cross-origin request detected …” warning
  // cast to plain string[] so the types line up
  allowedDevOrigins: ['http://localhost:3000'] as string[], // Moved from experimental
  experimental: {
    // No longer contains allowedDevOrigins
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
} satisfies NextConfig;          // ✅ type-safe assertion

export default nextConfig;
