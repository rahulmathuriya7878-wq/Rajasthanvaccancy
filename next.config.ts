import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.run.app',
    '*.asia-southeast1.run.app',
    '*.google.com',
    '*.googleusercontent.com',
  ],
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
