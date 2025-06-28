import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during builds for demo purposes
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript strict checking for demo
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: false,
  },
  images: {
    domains: ['pbs.twimg.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore node-specific modules when bundling for the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        buffer: false,
        events: false,
        querystring: false,
      };
      
      // Exclude Coinbase SDK and other node-specific modules from client bundle
      config.externals = config.externals || [];
      config.externals.push(
        '@coinbase/coinbase-sdk',
        'node-telegram-bot-api',
        'ws',
        'pg',
        'prisma',
        '@prisma/client'
      );
    }

    return config;
  },
};

export default nextConfig;
