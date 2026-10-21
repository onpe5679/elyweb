import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
// PREVIEW_EXPORT=1 : 서버 없이 호스팅 가능한 정적 시안으로 내보낸다(scripts/preview/build-static-preview.mjs 가 사용).
const isExport = process.env.PREVIEW_EXPORT === '1';

const nextConfig = {
  // 여러 dev 서버를 동시에 띄울 때 .next 충돌을 피하려는 용도(기본값은 그대로 .next)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: isExport ? 'export' : 'standalone',
  ...(isExport ? { trailingSlash: true } : {}),
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
