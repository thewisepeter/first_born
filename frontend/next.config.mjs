// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/home', destination: 'https://prophetnamara.org/', permanent: true },
      { source: '/audios', destination: 'https://prophetnamara.org/audio', permanent: true },
      { source: '/partnership/login', destination: 'https://prophetnamara.org/partnership/landing', permanent: true },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.prophetnamara.org' }],
        destination: 'https://prophetnamara.org/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      // YouTube
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Google Drive
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/file/**',
      },
      // Your production domain (CRITICAL - this is what's missing)
      {
        protocol: 'https',
        hostname: 'prophetnamara.org',
        port: '',
        pathname: '/media/**',
      },
      // Also support www subdomain
      {
        protocol: 'https',
        hostname: 'www.prophetnamara.org',
        port: '',
        pathname: '/media/**',
      },
      // Local development (if you need it)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
