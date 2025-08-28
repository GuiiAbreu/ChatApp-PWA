/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA and Service Worker configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
  
  // Enable experimental features for PWA
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // Optimize for PWA
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },
  
  // Compression
  compress: true,
  
  // Security headers
  async rewrites() {
    return []
  },
  
  // ESLint and TypeScript configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
