import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed: output: 'export' - now using Next.js server mode
  distDir: '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
