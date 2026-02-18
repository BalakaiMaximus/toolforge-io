import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Minimize chunks - reduce code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce number of chunks by limiting split chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 500000, // Only split if chunk > 500KB
        maxSize: 1000000, // Max chunk size 1MB
        cacheGroups: {
          default: false,
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Bundle app code into fewer chunks
          common: {
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
