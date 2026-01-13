import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getGameBySlug, getGames, getLocalizedField, getStatusText } from '@/lib/supabase';

export default async function GameDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const t = await getTranslations('ProjectSharehouse');
  const pt = await getTranslations('Projects');

  const game = await getGameBySlug(slug);
  if (!game) {
    notFound();
  }

  const isSharehouse = slug === 'sharehouse';
  const title = getLocalizedField(game, 'title', locale);
  const description = getLocalizedField(game, 'description', locale);

  return (
    <div className="bg-white dark:bg-background-dark text-text-light dark:text-text-dark font-body transition-colors duration-300">
      <header className="relative h-[60vh] min-h-[500px] flex items-end pb-12 justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" data-testid="game-banner">
          <img
            alt="Game Banner"
            className="w-full h-full object-cover object-center"
            src={game.banner_image || game.cover_image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent opacity-100"></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full">
          {isSharehouse ? (
            <>
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-romance-pink/90 text-white text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">favorite</span> {t('tag')}
              </div>
              <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 leading-tight drop-shadow-xl text-shadow whitespace-pre-line">
                {t('title')}
              </h1>
              <p className="text-lg text-white/90 font-medium drop-shadow-md max-w-2xl mx-auto">
                {t('subtitle')}
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/90 text-white text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm">
                {getStatusText(game.status, locale)}
              </div>
              <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 leading-tight drop-shadow-xl text-shadow">
                {title}
              </h1>
              <p className="text-lg text-white/90 font-medium drop-shadow-md max-w-2xl mx-auto">
                {getLocalizedField(game, 'series', locale)}
              </p>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 group">
              {game.cover_image && (
                <img
                  alt="Game Poster"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                  src={game.cover_image}
                />
              )}
            </div>

            {isSharehouse && (
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800" data-testid="project-timeline">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  {t('historyTitle')}
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-4 text-sm">
                    <span className="font-bold text-primary min-w-[60px]">{t('history.item1.date')}</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('history.item1.text')}</span>
                  </li>
                  <li className="flex gap-4 text-sm">
                    <span className="font-bold text-primary min-w-[60px]">{t('history.item2.date')}</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('history.item2.text')}</span>
                  </li>
                  <li className="flex gap-4 text-sm">
                    <span className="font-bold text-primary min-w-[60px]">{t('history.item3.date')}</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('history.item3.text')}</span>
                  </li>
                </ul>
              </div>
            )}

            {game.steam_url && (
              <a
                href={game.steam_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                <i className="fa-brands fa-steam text-xl"></i>
                Steam Store
              </a>
            )}

            {game.official_url && (
              <a
                href={game.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                <i className="fa-solid fa-globe text-xl"></i>
                Official Site
              </a>
            )}
          </div>

          <div className="lg:col-span-7 space-y-16 pt-4">
            {isSharehouse ? (
              <>
                <section>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">info</span>
                    {t('gameInfo.title')}
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300">
                    <p className="lead font-medium text-primary">{t('gameInfo.lead')}</p>
                    <p>{t('gameInfo.desc')}</p>
                    <div className="grid grid-cols-2 gap-4 mt-6 not-prose">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">{t('gameInfo.genreLabel')}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{t('gameInfo.genreValue')}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">{t('gameInfo.releaseLabel')}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{t('gameInfo.releaseValue')}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">{t('gameInfo.platformLabel')}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{t('gameInfo.platformValue')}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">{t('gameInfo.devLabel')}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{t('gameInfo.devValue')}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100 dark:border-gray-800" />

                <section>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
                    {t('synopsis.title')}
                  </h2>
                  <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    <p className="whitespace-pre-line">{t('synopsis.p1')}</p>
                    <p className="whitespace-pre-line">{t('synopsis.p2')}</p>
                    <div className="pl-4 border-l-4 border-romance-pink/50 italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r-lg">
                      {t('synopsis.quote')}
                    </div>
                    <ul className="space-y-2 mt-4 text-base">
                      <li className="flex items-start gap-2">
                        <span className="text-romance-pink mt-1"><i className="fa-solid fa-heart"></i></span>
                        <span>{t('synopsis.char1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-romance-pink mt-1"><i className="fa-solid fa-heart"></i></span>
                        <span>{t('synopsis.char2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-romance-pink mt-1"><i className="fa-solid fa-heart"></i></span>
                        <span>{t('synopsis.char3')}</span>
                      </li>
                    </ul>
                    <p className="font-medium text-gray-900 dark:text-white mt-4">{t('synopsis.outro')}</p>
                    <p className="text-sm text-gray-400 text-right">{t('synopsis.credit')}</p>
                  </div>
                </section>
              </>
            ) : (
              <section>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6">
                  Game Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const games = await getGames();
  return games.map((game) => ({ slug: game.slug }));
}
