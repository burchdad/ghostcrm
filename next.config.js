/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Exclude packages that use Node.js APIs from Edge Runtime  
    serverComponentsExternalPackages: ['@supabase/realtime-js']
  }
}

module.exports = nextConfig