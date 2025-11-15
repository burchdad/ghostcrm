/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Exclude packages that use Node.js APIs from Edge Runtime  
    serverComponentsExternalPackages: ['@supabase/realtime-js']
  },
  // Disable problematic CSS optimization for now
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable CSS optimization that's causing parser errors
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
  // Handle route group static exports properly
  trailingSlash: false,
  // Configure image domains for production
  images: {
    domains: ['ghostcrm.ai', 'www.ghostcrm.ai', 'vercel.app'],
  },
  // Headers for production security
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig