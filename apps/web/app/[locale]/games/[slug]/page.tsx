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

const SectionRenderer = ({ section, game, locale }: { section: GameSection; game: Game; locale: string }) => {
  const content = section.content || {};
  const getLoc = (key: string): string => {
    const val = content[`${key}_${locale}`] || content[`${key}_ko`] || '';
    return typeof val === 'string' ? val : '';
  };
  const title = getLocalizedField(section, 'title', locale);

  switch (section.type) {
    case 'text':
    case 'info':
    case 'synopsis':
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">
              {section.type === 'info' ? 'info' : section.type === 'synopsis' ? 'auto_stories' : 'article'}
            </span>
            {title}
          </h2>
          <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300">
            {getLoc('lead') && <p className="lead font-medium text-primary">{getLoc('lead')}</p>}
            {getLoc('p1') && <p className="whitespace-pre-line">{getLoc('p1')}</p>}
            {getLoc('p2') && <p className="whitespace-pre-line">{getLoc('p2')}</p>}
            {getLoc('content') && <p className="whitespace-pre-line">{getLoc('content')}</p>}

            {section.type === 'info' && (
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
            )}

            {getLoc('quote') && (
              <div className="pl-4 border-l-4 border-romance-pink/50 italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r-lg mt-6">
                {getLoc('quote')}
              </div>
            )}
          </div>
        </section>
      );

    case 'gallery':
      const images = (content.images as string[]) || [];
      if (images.length === 0) return null;
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">photo_library</span>
            {title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <a
                key={idx}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={img}
                  alt={`Gallery image ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-3xl drop-shadow-lg">
                    zoom_in
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      );

    case 'timeline':
      const items = (content.items as { date: string; text_ko?: string; text_en?: string; text_ja?: string }[]) || [];
      if (items.length === 0) return null;
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">history</span>
            {title}
          </h2>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <ul className="space-y-4">
              {items.map((item, idx) => (
                <li key={idx} className="flex gap-4 text-sm">
                  <span className="font-bold text-primary min-w-[80px]">{item.date}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {item[`text_${locale}` as keyof typeof item] || item.text_ko || ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case 'video':
      if (!content.youtube_id) return null;
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">play_circle</span>
            {title}
          </h2>
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${content.youtube_id}`}
              title={title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>
      );

    case 'store':
      const links = (content.links as { label: string; url: string; icon?: string }[]) || [];
      if (links.length === 0) return null;
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
            {title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors group"
              >
                <span className="flex items-center gap-3 font-bold text-gray-900 dark:text-white">
                  {link.icon && <i className={`${link.icon} text-xl w-6 text-center text-gray-400 group-hover:text-primary transition-colors`} />}
                  {link.label}
                </span>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">arrow_outward</span>
              </a>
            ))}
          </div>
        </section>
      );

    case 'credits':
      const credits = (content.credits as { role: string; name: string }[]) || [];
      if (credits.length === 0) return null;
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">group</span>
            {title}
          </h2>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {credits.map((credit, idx) => (
                <div key={idx} className="flex gap-4">
                  <dt className="text-gray-500 dark:text-gray-400 min-w-[120px] text-sm font-medium">{credit.role}</dt>
                  <dd className="text-gray-900 dark:text-white font-semibold">{credit.name}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );

    case 'custom':
      const customImages = Array.isArray(content.images) ? (content.images as string[]) : [];
      return (
        <section className="scroll-mt-24" id={`section-${section.id}`}>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">widgets</span>
            {title}
          </h2>
          <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300">
            {getLoc('content') && <div className="whitespace-pre-line">{getLoc('content')}</div>}
            {customImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-6 not-prose">
                {customImages.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="rounded-xl" />
                ))}
              </div>
            )}
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
