/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kiln-monorepo/shared"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3005/api/:path*',
        },
      ],
    };
  },
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    externalResolver: true,
    timeout: 120000,
  },
}

module.exports = nextConfig