import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 여러 dev 서버를 동시에 띄울 때 .next 충돌을 피하려는 용도(기본값은 그대로 .next)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'iastilhaidneaghdzrdb.supabase.co',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
