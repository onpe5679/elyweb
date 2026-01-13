'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function FeaturedGame() {
  const t = useTranslations('Projects.memorialCircuit');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div
      data-testid="featured-game"
      className="mb-16 card-hover bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <div
            data-testid="game-status-badge"
            className="absolute top-4 left-4 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider z-10"
          >
            {t('tag')}
          </div>
          <img
            alt="Memorial Circuit Game Art"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwMxjmoU2dFZiNcKAo6scC2pXTlU9Eo3CFv5SAi1KgZEFosi2mg8jzVaGXF2-oQBfnC4sPZuUy04YlTjXg5yx6zWoL5O0XHihOA7WE_lVhRydAbL4_4pHGMoCvmN6qryd-nvFW0v2itQSxaz38QeoqEMv-ZLG10X1xFQygj30kDwKFDqT7hi7XnRhhndI-r-2F8MOaG3ypBJstBdDjWQkgcsreXu3WwW46tBIw2wIN5KMBR6dTt-ZBEBsPj8-J29ALPToexQQmljc"
          />
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-2 text-primary font-semibold text-sm uppercase tracking-wide">
            {t('series')}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed whitespace-pre-line">
            {t('desc')}
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
              {t('genre1')}
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
              {t('genre2')}
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
              {t('genre3')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://store.steampowered.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <i className="fa-brands fa-steam"></i> {t('steam')}
            </a>
            <Link
              href={`/${locale}/games/memorial-circuit`}
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium transition-colors"
            >
              {t('details')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
