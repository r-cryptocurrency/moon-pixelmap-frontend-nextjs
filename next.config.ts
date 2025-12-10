import type { NextConfig } from 'next';

const csp = [
  "default-src 'self'",
  // WalletConnect / Reown / Web3Modal scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com",
  // XHR, Web-socket, RPC etc.
  "connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com " +
    "https://api.web3modal.org " + // Added for Web3Modal API
    "https://polygon-mainnet.g.alchemy.com https://*.infura.io " +
    "https://ethereum-mainnet.publicnode.com https://nova.arbitrum.io " + // Added Arbitrum Nova RPC
    "wss://*.walletconnect.org wss://*.walletconnect.com " +
    "ws://localhost:* http://localhost:* https://localhost:*",
  // Inline styles are required for Web3Modal
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*",
  // Allow WC iframes
  "frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com",
  // Allow WC to embed *us* in its iframe
  "frame-ancestors 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com"
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

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4321/api/:path*'
      }
    ];
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
