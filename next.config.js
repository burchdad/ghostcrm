/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Exclude packages that use Node.js APIs from Edge Runtime  
    serverComponentsExternalPackages: ['@supabase/realtime-js']
  },
  // Optimize builds for Vercel deployment
  swcMinify: true,
  // Handle route group static exports properly
  trailingSlash: false
}

module.exports = nextConfig