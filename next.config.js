/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'],
  },
  
  // Add transpilePackages to handle ESM modules properly
  transpilePackages: ['@tanstack/react-table', '@tanstack/table-core'],
}

module.exports = nextConfig