/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Exclude packages that use Node.js APIs from Edge Runtime  
    serverComponentsExternalPackages: ['@supabase/realtime-js'],
    // Reduce CSS preloading to prevent unused resource warnings
    optimizeCss: false,
  },
  // Disable problematic CSS optimization for now
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable CSS optimization that's causing parser errors
      config.optimization = {
        ...config.optimization,
        minimize: false,
        // Reduce CSS chunking to prevent excessive preloading
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            styles: {
              name: 'styles',
              type: 'css/mini-extract',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
      // Avoid webpack's automatic publicPath behavior in browsers that
      // don't support `document.currentScript`. Use a fixed publicPath
      // so runtime asset loading doesn't attempt 'auto' detection.
      config.output = config.output || {};
      config.output.publicPath = '/_next/';
    }
    return config;
  },
  // Handle route group static exports properly
  trailingSlash: false,
  // Optimize resource loading to reduce preload warnings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  // Reduce resource preloading aggressiveness
  poweredByHeader: false,
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