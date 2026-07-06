// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.youtube.com', 'images.unsplash.com', 'localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/file/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
