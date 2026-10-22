import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  getGameBySlug,
  getGames,
  getLocalizedArray,
  getLocalizedField,
  getStatusText,
  getGameSections,
  GameSection,
  Game,
} from '@/lib/supabase';
import { isHobomGame } from '@/lib/studios';
import HobomExperience from '@/components/games/HobomExperience';

// Each section of a game page shares one heading style so staff can fill any section in the same format.
function SectionHeading({ index, title, id }: { index: number; title: string; id: string }) {
  return (
    <header className="mb-10">
      <p className="eyebrow !text-ink-3">{String(index).padStart(2, '0')}</p>
      <h2 id={id} className="font-display mt-4 text-balance text-4xl leading-tight md:text-5xl">
        {title}
      </h2>
    </header>
  );
}

const SectionRenderer = ({ section, locale, index }: { section: GameSection; locale: string; index: number }) => {
  const content = section.content || {};
  const getLoc = (key: string): string => {
    const val = content[`${key}_${locale}`] || content[`${key}_ko`] || '';
    return typeof val === 'string' ? val : '';
  };
  const title = getLocalizedField(section, 'title', locale);
  const headingId = `heading-${section.id}`;
  const anchor = `section-${section.id}`;

  switch (section.type) {
    case 'text':
    case 'info':
    case 'synopsis': {
      if (!getLoc('lead') && !getLoc('p1') && !getLoc('p2') && !getLoc('content')) return null;
      return (
        <section aria-labelledby={headingId} id={anchor} className="scroll-mt-32">
          <SectionHeading index={index} title={title} id={headingId} />
          <div className="space-y-6 text-base leading-loose md:text-lg">
            {getLoc('lead') && <p className="font-display text-2xl leading-snug md:text-3xl">{getLoc('lead')}</p>}
            {getLoc('p1') && <p className="whitespace-pre-line text-ink-2">{getLoc('p1')}</p>}
            {getLoc('p2') && <p className="whitespace-pre-line text-ink-2">{getLoc('p2')}</p>}
            {getLoc('content') && <p className="whitespace-pre-line text-ink-2">{getLoc('content')}</p>}
            {getLoc('quote') && (
              <blockquote className="border-l-2 border-seal pl-6 font-display text-xl italic leading-relaxed text-ink md:text-2xl">
                {getLoc('quote')}
              </blockquote>
            )}
          </div>
        </section>
      );
    }

    case 'gallery': {
      const images = (content.images as string[]) || [];
      if (images.length === 0) return null;
      return (
        <section aria-labelledby={headingId} id={anchor} className="scroll-mt-32">
          <SectionHeading index={index} title={title} id={headingId} />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {images.map((img, idx) => (
              <li key={idx} className={['min-w-0', idx === 0 ? 'sm:col-span-2' : ''].join(' ')}>
                <a
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-video overflow-hidden bg-paper-alt focus-visible:outline-offset-4"
                >
                  <img
                    src={img}
                    alt={`${title} ${idx + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 right-3 bg-paper/90 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case 'timeline': {
      const items = (content.items as { date: string; text_ko?: string; text_en?: string; text_ja?: string }[]) || [];
      if (items.length === 0) return null;
      return (
        <section aria-labelledby={headingId} id={anchor} className="scroll-mt-32">
          <SectionHeading index={index} title={title} id={headingId} />
          <ol className="border-t border-ink">
            {items.map((item, idx) => (
              <li key={idx} className="grid grid-cols-[6rem_1fr] gap-6 border-b border-rule py-6">
                <span className="font-display text-xl tabular-nums text-seal">{item.date}</span>
                <span className="text-ink-2">{item[`text_${locale}` as keyof typeof item] || item.text_ko || ''}</span>
              </li>
            ))}
          </ol>
        </section>
      );
    }

    case 'video': {
      if (!content.youtube_id) return null;
      return (
        <section aria-labelledby={headingId} id={anchor} className="scroll-mt-32">
          <SectionHeading index={index} title={title} id={headingId} />
          <div className="aspect-video w-full overflow-hidden bg-night">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${content.youtube_id}`}
              title={title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </section>
      );
    }

    case 'store': {
      const links = (content.links as { label: string; url: string; icon?: string }[]) || [];
      if (links.length === 0) return null;
      return (
        <section aria-labelledby={headingId} id={anchor} className="scroll-mt-32">
          <SectionHeading index={index} title={title} id={headingId} />
          <ul className="divide-y divide-rule border-y border-rule">
            {links.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-6 transition-colors hover:text-seal"
                >
                  <span className="flex items-center gap-4 font-display text-2xl">
                    {link.icon && <i className={`${link.icon} w-6 text-center text-lg text-ink-3 group-hover:text-seal`} aria-hidden="true" />}
                    {link.label}
                  </span>
                  <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">→</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case 'credits': {
      const credits = (content.credits as { role: string; name: string }[]) || [];
      if (credits.length === 0) return null;
      return (
        <section aria-labelledby={headingId} id={anchor} className="scroll-mt-32">
          <SectionHeading index={index} title={title} id={headingId} />
          <dl className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
            {credits.map((credit, idx) => (
              <div key={idx} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-4">
                <dt className="text-sm text-ink-3">{credit.role}</dt>
                <dd className="font-semibold text-ink">{credit.name}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    }

    case 'custom': {
      const customImages = Array.isArray(content.images) ? (content.images as string[]) : [];
      if (!getLoc('content') && customImages.length === 0) return null;
      return (
        <section aria-labelledby={headingId} id={anchor} className="scroll-mt-32">
          <SectionHeading index={index} title={title} id={headingId} />
          {getLoc('content') && <div className="whitespace-pre-line text-base leading-loose text-ink-2 md:text-lg">{getLoc('content')}</div>}
          {customImages.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {customImages.map((img, idx) => (
                <img key={idx} src={img} alt={`${title} ${idx + 1}`} loading="lazy" className="w-full object-cover" />
              ))}
            </div>
          )}
        </section>
      );
    }

    default:
      return null;
  }
};

export default async function GameDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;

  const t = await getTranslations('GameDetail');
  const game = await getGameBySlug(slug);
  if (!game) {
    notFound();
  }

  const sections = await getGameSections(slug);
  const hobom = isHobomGame(game);
  const title = getLocalizedField(game, 'title', locale);
  const series = getLocalizedField(game, 'series', locale);
  const description = getLocalizedField(game, 'description', locale);
  const genres = getLocalizedArray(game, 'genre', locale);
  const banner = game.banner_image || game.cover_image || '';
  const poster = game.cover_image || game.banner_image || '';
  const statusText = getStatusText(game.status, locale);

  const facts = [
    { label: t('genre'), value: genres.join(' / ') },
    { label: t('platforms'), value: (game.platforms || []).join(' / ') },
    { label: t('developer'), value: game.developer || '' },
    { label: t('status'), value: statusText },
  ].filter((f) => f.value);

  const indexItems = [
    { href: '#overview', label: t('overview') },
    ...(hobom ? [{ href: '#experience', label: t('experienceEyebrow') }] : []),
    ...sections.map((s) => ({ href: `#section-${s.id}`, label: getLocalizedField(s, 'title', locale) })),
  ].filter((item) => item.label);

  return (
    <div
      className={hobom ? 'on-hobom font-hobom bg-hb-cream text-hb-ink' : 'bg-paper text-ink'}
    >
      <section
        aria-labelledby="game-title"
        data-testid="game-banner-section"
        className={['relative isolate overflow-hidden', hobom ? 'bg-hb-pink-soft' : 'on-night bg-night text-moon'].join(' ')}
      >
        {banner && (
          <div className="absolute inset-0 -z-10" data-testid="game-banner">
            <img
              alt=""
              src={banner}
              className={['h-full w-full object-cover', hobom ? 'opacity-35' : 'opacity-50'].join(' ')}
            />
          </div>
        )}
        <div
          aria-hidden="true"
          className={[
            'absolute inset-0 -z-10',
            hobom
              ? 'bg-gradient-to-r from-hb-pink-soft via-hb-pink-soft/85 to-hb-pink-soft/20'
              : 'bg-gradient-to-r from-night via-night/80 to-night/20',
          ].join(' ')}
        />
        {hobom && (
          <>
            <span aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-hb-pink/60" />
            <span aria-hidden="true" className="absolute bottom-16 right-[38%] -z-10 hidden h-14 w-14 rounded-full bg-hb-yellow md:block" />
          </>
        )}

        <div className="mx-auto grid min-h-[78svh] max-w-7xl items-end gap-12 px-4 pb-16 pt-40 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-20">
          <div className="lg:col-span-7">
            <Link
              href="/games"
              className={['flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors', hobom ? 'text-hb-ink/70 hover:text-hb-ink' : 'text-moon-2 hover:text-moon'].join(' ')}
            >
              ← {t('backToWorks')}
            </Link>
            <p
              className={[
                'mt-10 flex w-fit px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em]',
                hobom ? 'rounded-full bg-hb-ink text-hb-cream' : 'bg-moon text-night',
              ].join(' ')}
            >
              {statusText}
            </p>
            <h1
              id="game-title"
              className={[
                'mt-6 text-balance leading-[0.98]',
                hobom ? 'font-hobom text-5xl font-bold md:text-7xl' : 'font-display text-6xl font-normal md:text-8xl',
              ].join(' ')}
            >
              {title}
            </h1>
            {series && <p className={['mt-6 text-lg', hobom ? 'text-hb-ink/75' : 'text-moon-2'].join(' ')}>{series}</p>}

            <div className="mt-10 flex flex-wrap gap-4">
              {game.steam_url && (
                <a
                  href={game.steam_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'inline-flex items-center gap-3 px-6 py-3.5 text-sm font-bold tracking-wide transition-colors',
                    hobom ? 'rounded-full bg-hb-ink text-hb-cream hover:bg-hb-pink-deep' : 'bg-moon text-night hover:bg-seal-soft',
                  ].join(' ')}
                >
                  <i className="fa-brands fa-steam text-lg" aria-hidden="true" />
                  {t('steam')}
                </a>
              )}
              {game.official_url && (
                <a
                  href={game.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'inline-flex items-center gap-3 border px-6 py-3.5 text-sm font-bold tracking-wide transition-colors',
                    hobom ? 'rounded-full border-hb-ink hover:bg-hb-ink hover:text-hb-cream' : 'border-moon/60 hover:border-moon hover:bg-moon/10',
                  ].join(' ')}
                >
                  <i className="fa-solid fa-globe text-base" aria-hidden="true" />
                  {t('official')}
                </a>
              )}
              {hobom && (
                <a
                  href="#experience"
                  className="inline-flex items-center gap-3 rounded-full bg-hb-pink px-6 py-3.5 text-sm font-bold text-hb-ink transition-colors hover:bg-hb-yellow"
                >
                  {t('experienceCta')}
                </a>
              )}
            </div>
          </div>

          {poster && (
            <div className="justify-self-start lg:col-span-4 lg:col-start-9 lg:justify-self-end">
              <img
                src={poster}
                alt={title}
                className={[
                  'aspect-[3/4] w-44 object-cover shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] md:w-64',
                  hobom ? 'rounded-[1.75rem]' : '',
                ].join(' ')}
              />
            </div>
          )}
        </div>
      </section>

      {facts.length > 0 && (
        <dl
          aria-label={t('facts')}
          className={['mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8', hobom ? '' : 'border-b border-rule'].join(' ')}
        >
          {facts.map((fact) => (
            <div key={fact.label} className="pr-6">
              <dt className={['text-xs font-bold uppercase tracking-[0.16em]', hobom ? 'text-hb-pink-deep' : 'text-ink-3'].join(' ')}>
                {fact.label}
              </dt>
              <dd className="mt-2 text-base font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-12 lg:px-8">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav aria-label={t('overview')} className="sticky top-32">
            <ol className="space-y-3 border-l border-rule pl-5 text-sm">
              {indexItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="block py-0.5 text-ink-3 transition-colors hover:text-ink">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0 space-y-28 lg:col-span-8 lg:col-start-5">
          <section id="overview" aria-labelledby="overview-heading" className="scroll-mt-32">
            <header className="mb-10">
              <p className="eyebrow !text-ink-3">{t('overview')}</p>
              <h2 id="overview-heading" className="font-display mt-4 text-4xl leading-tight md:text-5xl">{title}</h2>
            </header>
            {description ? (
              <p className="whitespace-pre-line text-base leading-loose text-ink-2 md:text-lg">{description}</p>
            ) : (
              <p className="text-base leading-loose text-ink-3">{t('noSections')}</p>
            )}
          </section>

          {hobom && (
            <section id="experience" className="scroll-mt-32 rounded-[2rem] bg-hb-yellow-soft p-8 md:p-12">
              <HobomExperience />
            </section>
          )}

          {sections.map((section, i) => (
            <div key={section.id} className="scroll-mt-32">
              <SectionRenderer section={section} locale={locale} index={i + 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const games = await getGames();
  return games.map((game) => ({ slug: game.slug }));
}
