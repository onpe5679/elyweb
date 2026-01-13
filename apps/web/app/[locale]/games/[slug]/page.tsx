import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  getGameBySlug,
  getGames,
  getLocalizedField,
  getStatusText,
  getGameSections,
  GameSection,
  Game
} from '@/lib/supabase';

// Component to render individual sections
const SectionRenderer = ({ section, game, locale }: { section: GameSection; game: Game; locale: string }) => {
  const content = section.content || {};
  const isKo = locale === 'ko';

  // Helper for content localization
  const getLoc = (key: string) => content[`${key}_${locale}`] || content[`${key}_ko`] || '';

  const title = getLocalizedField(section, 'title', locale);

  switch (section.type) {
    case 'info':
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">info</span>
            {title}
          </h2>
          <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300">
            {getLoc('lead') && <p className="lead font-medium text-primary">{getLoc('lead')}</p>}
            <p className="whitespace-pre-line">{getLocalizedField(game, 'description', locale)}</p>

            <div className="grid grid-cols-2 gap-4 mt-6 not-prose">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Genre</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {getLocalizedField(game, 'genre', locale) || game.genre_ko?.join(', ')}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Platform</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {game.platforms?.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    case 'synopsis':
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
            {title}
          </h2>
          <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {getLoc('p1') && <p className="whitespace-pre-line">{getLoc('p1')}</p>}
            {getLoc('p2') && <p className="whitespace-pre-line">{getLoc('p2')}</p>}

            {getLoc('quote') && (
              <div className="pl-4 border-l-4 border-romance-pink/50 italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r-lg">
                {getLoc('quote')}
              </div>
            )}

            {content.characters && Array.isArray(content.characters) && (
              <ul className="space-y-2 mt-4 text-base">
                {content.characters.map((char: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-romance-pink mt-1"><i className="fa-solid fa-heart"></i></span>
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      );

    case 'timeline':
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">history</span>
            {title}
          </h2>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <ul className="space-y-4">
              {content.items?.map((item: any, idx: number) => (
                <li key={idx} className="flex gap-4 text-sm">
                  <span className="font-bold text-primary min-w-[60px]">{item.date}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {isKo ? item.text_ko : item.text_en}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case 'video':
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">play_circle</span>
            {title}
          </h2>
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-black">
            {content.youtube_id && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${content.youtube_id}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            )}
          </div>
        </section>
      );

    case 'store':
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
            {title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.links?.map((link: any, idx: number) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors group"
              >
                <span className="flex items-center gap-3 font-bold text-gray-900 dark:text-white">
                  {link.icon && <i className={`${link.icon} text-xl w-6 text-center text-gray-400 group-hover:text-primary transition-colors`}></i>}
                  {link.label}
                </span>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">arrow_outward</span>
              </a>
            ))}
          </div>
        </section>
      );

    default:
      return null;
  }
};

export default async function GameDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;

  // Still fetch common translations for standard UI elements
  const t = await getTranslations('Common');

  const game = await getGameBySlug(slug);
  if (!game) {
    notFound();
  }

  const sections = await getGameSections(slug);
  const title = getLocalizedField(game, 'title', locale);

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
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/90 text-white text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm">
            {getStatusText(game.status, locale)}
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 leading-tight drop-shadow-xl text-shadow whitespace-pre-line">
            {title}
          </h1>
          <p className="text-lg text-white/90 font-medium drop-shadow-md max-w-2xl mx-auto">
            {getLocalizedField(game, 'series', locale)}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Left Column: Cover & Sticky Meta */}
            <div className="sticky top-24 space-y-8">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 group">
                {game.cover_image && (
                  <img
                    alt="Game Poster"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    src={game.cover_image}
                  />
                )}
              </div>

              {/* External Links */}
              <div className="flex flex-col gap-3">
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
            </div>
          </div>

          <div className="lg:col-span-7 space-y-16 pt-4">
            {/* Dynamic Sections */}
            {sections.length > 0 ? (
              sections.map(section => (
                <div key={section.id}>
                  <SectionRenderer section={section} game={game} locale={locale} />
                  <hr className="border-gray-100 dark:border-gray-800 mt-16" />
                </div>
              ))
            ) : (
              // Fallback if no sections defined
              <section>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6">
                  Game Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {getLocalizedField(game, 'description', locale)}
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
