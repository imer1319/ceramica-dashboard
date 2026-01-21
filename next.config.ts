import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.0.0.10', '*.local'],
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configuración para Electron
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
