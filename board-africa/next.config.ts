import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudflare doesn't support Next.js Image Optimization
    // Use Cloudflare Images or unoptimized images
    unoptimized: true,
    domains: [
      'imagedelivery.net',
      'pub-*.r2.dev',
      'lh3.googleusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  webpack: (config, { isServer }) => {
    // Canvas polyfill (not needed in browser)
    config.resolve.alias.canvas = false;

    // Enable top-level await for ESM compatibility
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true
    };

    // SES-safe handling for pdfjs-dist
    // Externalize pdfjs-dist worker to avoid SES lockdown conflicts
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Force using the ES module version
        'pdfjs-dist/build/pdf': 'pdfjs-dist/build/pdf.mjs',
      };

      // Add fallback for node modules in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Cloudflare Workers compatibility
    if (isServer) {
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      })
    }

    return config;
  },
}

export default nextConfig
