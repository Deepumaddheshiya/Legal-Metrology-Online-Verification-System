/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      // Production domain (update for actual deployment)
      {
        protocol: 'https',
        hostname: 'lmovs.gov.in',
      },
      {
        protocol: 'https',
        hostname: 'storage.lmovs.gov.in',
      },
    ],
  },
};

export default nextConfig;
