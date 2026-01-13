import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';

const gameData: Record<string, {
  bannerImage: string;
  coverImage: string;
}> = {
  'memorial-circuit': {
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwMxjmoU2dFZiNcKAo6scC2pXTlU9Eo3CFv5SAi1KgZEFosi2mg8jzVaGXF2-oQBfnC4sPZuUy04YlTjXg5yx6zWoL5O0XHihOA7WE_lVhRydAbL4_4pHGMoCvmN6qryd-nvFW0v2itQSxaz38QeoqEMv-ZLG10X1xFQygj30kDwKFDqT7hi7XnRhhndI-r-2F8MOaG3ypBJstBdDjWQkgcsreXu3WwW46tBIw2wIN5KMBR6dTt-ZBEBsPj8-J29ALPToexQQmljc',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwMxjmoU2dFZiNcKAo6scC2pXTlU9Eo3CFv5SAi1KgZEFosi2mg8jzVaGXF2-oQBfnC4sPZuUy04YlTjXg5yx6zWoL5O0XHihOA7WE_lVhRydAbL4_4pHGMoCvmN6qryd-nvFW0v2itQSxaz38QeoqEMv-ZLG10X1xFQygj30kDwKFDqT7hi7XnRhhndI-r-2F8MOaG3ypBJstBdDjWQkgcsreXu3WwW46tBIw2wIN5KMBR6dTt-ZBEBsPj8-J29ALPToexQQmljc',
  },
  sharehouse: {
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZfqh4yPrE9cgvF1fwUTOa1M5S2XYI586T0LQ-3y0qBZ0vXfEB3ZAENXD8cUaEGeVKT9rSp1_THPFDANvhD0ahAU5LxXMddBhaWTcigCt9wKCW4rFPQB83ZjkpDc0ZAxOuEymtRP48ZzJxdhrCzJMqG1EI1eUNJWf3OCClgQHEuKl_ShO1Rcop_UD7cdPUp5_4--gW1OT1j3-G0RSkaYAH7Rw98aWknssLlSA-sMTwe2NmaNzeaLAbbnLkbzvn_dXksYBAxCIZ3EU',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZfqh4yPrE9cgvF1fwUTOa1M5S2XYI586T0LQ-3y0qBZ0vXfEB3ZAENXD8cUaEGeVKT9rSp1_THPFDANvhD0ahAU5LxXMddBhaWTcigCt9wKCW4rFPQB83ZjkpDc0ZAxOuEymtRP48ZzJxdhrCzJMqG1EI1eUNJWf3OCClgQHEuKl_ShO1Rcop_UD7cdPUp5_4--gW1OT1j3-G0RSkaYAH7Rw98aWknssLlSA-sMTwe2NmaNzeaLAbbnLkbzvn_dXksYBAxCIZ3EU',
  },
  'space-empathy': {
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9wLTEAMj-8JrucPk5Ur88qM2wkr0D7LmWA3pqOugBqSwgxs_JMdFKyRDQZtbOXs4BAwzQeD-dXw57d8TA7fRHk5dfRrbpnlhRJOUyPw8gDa1RAJe7NsX4UuhWp_ngpAchZJUP0-JwpLOjmqZQffL_DWgFz2IEyi-BLhNPphWbAMtWjxtRQs0nr1oGG_a7lr5wpxBMP8Na1ABVLLEODq5dUHLsU3FEG7p9nFx5v2lgqJxBiifLN1AUyQ1-v4z652DE3VTY4IVBUHs',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9wLTEAMj-8JrucPk5Ur88qM2wkr0D7LmWA3pqOugBqSwgxs_JMdFKyRDQZtbOXs4BAwzQeD-dXw57d8TA7fRHk5dfRrbpnlhRJOUyPw8gDa1RAJe7NsX4UuhWp_ngpAchZJUP0-JwpLOjmqZQffL_DWgFz2IEyi-BLhNPphWbAMtWjxtRQs0nr1oGG_a7lr5wpxBMP8Na1ABVLLEODq5dUHLsU3FEG7p9nFx5v2lgqJxBiifLN1AUyQ1-v4z652DE3VTY4IVBUHs',
  },
  'festival-not-over': {
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNROh0Z8PhYTXUyJDxtlLPTmmgxzMgjGjKY1hNp4QaCGMbtCgTAos2kOnxhqdqz3yNqJ0eakHI4Es4WQBKgi4H6qsdBlQ4ZXiAg4np4EA_foFXIVc0eJ5DRxzWOb7jSEHdUl60fxxNCNKnWWYvWL2BWok3924lFrUjdUoIaM4Ot8eXbCEd5fafCXhD7F0aFkf1UFLuFmz0oMWa3TWwm-ZLKCBmANif8O1GkFoMa_mWfADFgx-X1YzKX2EYkVwldk42BQBBcPyFMCs',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNROh0Z8PhYTXUyJDxtlLPTmmgxzMgjGjKY1hNp4QaCGMbtCgTAos2kOnxhqdqz3yNqJ0eakHI4Es4WQBKgi4H6qsdBlQ4ZXiAg4np4EA_foFXIVc0eJ5DRxzWOb7jSEHdUl60fxxNCNKnWWYvWL2BWok3924lFrUjdUoIaM4Ot8eXbCEd5fafCXhD7F0aFkf1UFLuFmz0oMWa3TWwm-ZLKCBmANif8O1GkFoMa_mWfADFgx-X1YzKX2EYkVwldk42BQBBcPyFMCs',
  },
};

export default function GameDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const t = useTranslations('ProjectSharehouse');
  const pt = useTranslations('Projects');

  const game = gameData[params.slug];
  if (!game) {
    notFound();
  }

  const isSharehouse = params.slug === 'sharehouse';

  return (
    <div className="bg-white dark:bg-background-dark text-text-light dark:text-text-dark font-body transition-colors duration-300">
      <header className="relative h-[60vh] min-h-[500px] flex items-end pb-12 justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" data-testid="game-banner">
          <img
            alt="Game Banner"
            className="w-full h-full object-cover object-center"
            src={game.bannerImage}
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
              <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 leading-tight drop-shadow-xl text-shadow">
                {params.slug === 'memorial-circuit' && pt('memorialCircuit.title')}
                {params.slug === 'space-empathy' && pt('spaceEmpathy.title')}
                {params.slug === 'festival-not-over' && pt('festival.title')}
              </h1>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 group">
              <img
                alt="Game Poster"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                src={game.coverImage}
              />
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
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {params.slug === 'memorial-circuit' && pt('memorialCircuit.desc')}
                  {params.slug === 'space-empathy' && pt('spaceEmpathy.desc')}
                  {params.slug === 'festival-not-over' && pt('festival.desc')}
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export function generateStaticParams() {
  return [
    { slug: 'memorial-circuit' },
    { slug: 'sharehouse' },
    { slug: 'space-empathy' },
    { slug: 'festival-not-over' },
  ];
}
