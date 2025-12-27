/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip Prisma generation if DATABASE_URL is not set (for landing page only deployment)
  webpack: (config, { isServer }) => {
    if (isServer && !process.env.DATABASE_URL) {
      // Allow build to continue without database
      config.resolve.alias = {
        ...config.resolve.alias,
      }
    }
    return config
  },
}

module.exports = nextConfig

