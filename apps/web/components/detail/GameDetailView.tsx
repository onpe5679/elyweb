import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Icon from '@/components/ui/Icon';
import { LABELS } from '@/lib/labels';
import type { GameSpec } from '@/lib/game-spec';
import { altTitleClass, titleScale, type WorkSummary } from '@/lib/works';
import TrailerButton from './TrailerButton';
import CopyLinkButton from './CopyLinkButton';
import DetailTabs from './DetailTabs';
import Gallery from './Gallery';
import VideoShelf from './VideoShelf';

type Variant = 'elysian' | 'habom';

type Props = {
  spec: GameSpec;
  locale: string;
  variant: Variant;
  more: WorkSummary[];
  // Habom-only extras (the mini demo launcher and section) are injected by the Habom route.
  heroExtra?: ReactNode;
  demo?: { label: string; node: ReactNode };
};

// One detail layout for every game. The order mirrors a streaming title page: key art, title,
// main actions and logline first; then synopsis + facts, images, videos, credits, history, stores.
export default async function GameDetailView({ spec, locale, variant, more, heroExtra, demo }: Props) {
  const t = await getTranslations('Detail');
  const ts = await getTranslations('Status');
  const habom = variant === 'habom';
  const label = LABELS[spec.label];

  const info = [
    { k: t('infoTitleField'), v: [spec.title, ...spec.otherTitles].join('\n') },
    { k: t('infoSeries'), v: spec.series },
    { k: t('infoGenre'), v: spec.genres.join(' · ') },
    { k: t('infoPlatform'), v: spec.platforms.join(' · ') },
    { k: t('infoDeveloper'), v: spec.developer },
    { k: t('infoStatus'), v: ts(spec.status as 'released') },
    { k: t('infoRelease'), v: spec.releaseDate },
  ].filter((r) => r.v);

  const tabs = [
    { id: 'about', label: t('tabAbout') },
    ...(demo ? [{ id: 'demo', label: demo.label }] : []),
    ...(spec.gallery.length ? [{ id: 'gallery', label: t('tabGallery') }] : []),
    ...(spec.videos.length ? [{ id: 'videos', label: t('tabVideos') }] : []),
    ...(spec.credits.length ? [{ id: 'credits', label: t('tabCredits') }] : []),
    ...(spec.timeline.length ? [{ id: 'history', label: t('tabHistory') }] : []),
    ...(spec.stores.length || spec.platforms.length ? [{ id: 'store', label: t('tabStore') }] : []),
  ];

  const btn = habom
    ? {
        primary: 'inline-flex min-h-[52px] items-center gap-2 rounded-full bg-rose px-6 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(201,65,109,.8)] transition-transform hover:-translate-y-0.5',
        secondary: 'inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white px-6 text-[0.9375rem] font-semibold text-plum ring-1 ring-plum/15 transition-colors hover:ring-rose',
        icon: 'inline-flex min-h-[52px] min-w-[52px] items-center justify-center gap-2 rounded-full bg-white px-4 text-plum ring-1 ring-plum/15 hover:ring-rose',
      }
    : {
        primary: 'inline-flex min-h-[52px] items-center gap-2 bg-on-night px-6 text-[0.9375rem] font-medium text-night transition-colors hover:bg-accent-night',
        secondary: 'inline-flex min-h-[52px] items-center gap-2 border border-on-night/40 px-6 text-[0.9375rem] transition-colors hover:border-on-night',
        icon: 'inline-flex min-h-[52px] min-w-[52px] items-center justify-center gap-2 border border-on-night/40 px-4 transition-colors hover:border-on-night',
      };

  const actions = (
    <div className="mt-9 flex flex-wrap items-center gap-3">
      {spec.trailer && <TrailerButton youtubeId={spec.trailer.youtubeId} title={`${spec.title} — ${spec.trailer.title}`} className={btn.primary} />}
      {heroExtra}
      {spec.steamUrl && (
        <a href={spec.steamUrl} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
          <Icon name="steam" size={18} /> {t('steam')} <Icon name="arrowUpRight" size={14} />
        </a>
      )}
      {spec.officialUrl && (
        <a href={spec.officialUrl} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
          <Icon name="globe" size={18} /> {t('official')} <Icon name="arrowUpRight" size={14} />
        </a>
      )}
      <CopyLinkButton className={btn.icon} />
    </div>
  );

  const breadcrumb = (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-2 text-xs ${habom ? 'font-semibold text-plum-soft' : 'font-mono uppercase tracking-[0.14em] text-on-night-mute'}`}>
        <li><Link href={habom ? '/habom' : '/games'} className="hover:underline">{habom ? label.localName[locale] : t('works')}</Link></li>
        {spec.series && !habom && (<><li aria-hidden="true">/</li><li>{spec.series}</li></>)}
      </ol>
    </nav>
  );

  return (
    <article className={habom ? 'bg-cream text-plum' : ''}>
      {habom ? (
        <section data-testid="game-banner" className="relative overflow-hidden pb-6">
          <span aria-hidden="true" className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blush" />
          <span aria-hidden="true" className="absolute -right-16 top-[38%] h-56 w-56 rounded-full bg-butter-soft" />
          <div className="relative mx-auto max-w-page px-4 pt-24 md:px-10 md:pt-28">
            <div className="overflow-hidden rounded-[28px] bg-blush md:rounded-[36px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spec.banner} alt="" className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[21/9]" style={{ objectPosition: '50% 30%' }} />
            </div>
            <div className="relative -mt-16 grid gap-8 px-2 md:-mt-24 md:px-8 lg:grid-cols-12">
              <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(74,43,56,.35)] md:p-10 lg:col-span-8">
                {breadcrumb}
                <p className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-rose px-3 py-1 font-round-latin font-bold uppercase tracking-[0.12em] text-white">{label.name}</span>
                  <span className="rounded-full bg-butter px-3 py-1 font-semibold text-plum">{ts(spec.status as 'released')}</span>
                </p>
                <h1 className={`mt-5 font-round leading-[1.1] [text-wrap:balance] ${titleScale(spec.title, ['text-[2.5rem] md:text-[4rem]', 'text-[2.25rem] md:text-[3.5rem]', 'text-[2rem] md:text-[3rem]'])}`}>{spec.title}</h1>
                {spec.otherTitles.length > 0 && <p className="mt-2 font-round-latin text-lg font-bold text-plum-soft">{spec.otherTitles.join(' · ')}</p>}
                <p className="mt-5 flex flex-wrap gap-2 text-[0.8125rem]">
                  {spec.genres.map((g) => <span key={g} className="rounded-full bg-cream px-3 py-1 text-plum-soft ring-1 ring-blush">{g}</span>)}
                </p>
                {spec.logline && <p className="mt-6 max-w-2xl whitespace-pre-line text-[1.0625rem] leading-relaxed text-plum-soft">{spec.logline}</p>}
                {actions}
              </div>
              {spec.cover && spec.cover !== spec.banner && (
                <div className="hidden lg:col-span-4 lg:block lg:pt-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={spec.cover} alt="" className="w-full -rotate-2 rounded-[24px] border-[6px] border-white object-cover shadow-[0_24px_50px_-24px_rgba(74,43,56,.5)]" />
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section data-testid="game-banner" className="on-night relative isolate overflow-hidden bg-night text-on-night">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spec.banner} alt="" className="absolute inset-0 -z-10 hidden h-full w-full object-cover opacity-75 lg:block" style={{ objectPosition: '50% 25%' }} />
          <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-night via-night/70 to-night/0 lg:block" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/2 bg-gradient-to-t from-night to-transparent lg:block" />
          <div className="relative lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spec.banner} alt="" className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]" style={{ objectPosition: '50% 25%' }} />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night to-transparent" />
          </div>
          <div className="mx-auto grid max-w-page gap-10 px-5 pb-14 pt-2 md:px-10 lg:min-h-[86svh] lg:grid-cols-12 lg:items-end lg:pb-20 lg:pt-36">
            <div className="lg:col-span-7">
              {breadcrumb}
              <p className="mt-6 inline-flex items-center gap-2 border border-on-night/30 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-on-night-mute">
                <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent-night" /> {label.name}
              </p>
              <h1 className={`mt-5 font-serif font-semibold leading-[1.08] tracking-[-0.02em] [text-wrap:balance] ${titleScale(spec.title, ['text-[2.75rem] md:text-[4.75rem]', 'text-[2.5rem] md:text-[3.75rem]', 'text-[2.125rem] md:text-[3rem]'])}`}>{spec.title}</h1>
              {spec.otherTitles.length > 0 && (
                <p className="mt-3 text-xl text-on-night-mute md:text-2xl">
                  {spec.otherTitles.map((o, i) => (
                    <span key={o}>{i > 0 && <span aria-hidden="true"> · </span>}<span className={altTitleClass(o)}>{o}</span></span>
                  ))}
                </p>
              )}
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] text-on-night-mute">
                <span className="font-mono uppercase tracking-[0.14em] text-accent-night">{ts(spec.status as 'released')}</span>
                {spec.platforms.length > 0 && <><span aria-hidden="true" className="h-3 w-px bg-on-night/30" /><span>{spec.platforms.join(' · ')}</span></>}
                {spec.genres.length > 0 && <><span aria-hidden="true" className="h-3 w-px bg-on-night/30" /><span>{spec.genres.join(' · ')}</span></>}
              </p>
              {spec.logline && <p className="mt-6 max-w-xl whitespace-pre-line font-serif text-[1.0625rem] leading-[1.85] text-on-night/90">{spec.logline}</p>}
              {actions}
            </div>
            {spec.cover && spec.cover !== spec.banner && (
              <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={spec.cover} alt="" className="ml-auto max-h-[34rem] w-auto border border-on-night/15 object-contain shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]" />
              </div>
            )}
          </div>
        </section>
      )}

      <DetailTabs tabs={tabs} label={t('sections')} variant={variant} />

      <div className="mx-auto max-w-page px-5 md:px-10">
        {/* Overview: story + facts */}
        <section id="about" aria-labelledby="about-title" className="scroll-mt-32 py-16 md:py-24">
          <SectionTitle id="about-title" n={1} title={t('tabAbout')} habom={habom} />
          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="space-y-14 lg:col-span-7">
              {(spec.story.length ? spec.story : [{ id: 'logline', title: t('storyFallback'), paragraphs: [spec.logline], images: [] }]).map((block, bi) => (
                <div key={block.id}>
                  {block.title && (
                    <h3 className={habom ? 'font-round text-2xl text-rose' : 'label text-accent'}>{block.title}</h3>
                  )}
                  <div className={`reading mt-4 ${habom ? 'text-[1.0625rem] leading-[1.9] text-plum-soft' : 'font-serif text-[1.0625rem] leading-[1.95] text-ink-soft'}`}>
                    {block.paragraphs.map((p, i) => (
                      <p key={i} className={`whitespace-pre-line ${bi === 0 && i === 0 ? (habom ? 'text-[1.1875rem] text-plum' : 'text-[1.25rem] leading-[1.8] text-ink') : ''}`}>{p}</p>
                    ))}
                  </div>
                  {block.images.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {block.images.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={src} src={src} alt="" loading="lazy" className={`w-full object-cover ${habom ? 'rounded-[18px]' : ''}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className={`lg:sticky lg:top-36 ${habom ? 'rounded-[24px] bg-white p-6 ring-1 ring-blush' : 'border-t-2 border-ink pt-5'}`}>
                <h3 className={habom ? 'font-round text-xl' : 'label text-ink-mute'}>{t('infoTitle')}</h3>
                <dl className="mt-4 text-[0.9375rem]">
                  {info.map((r) => (
                    <div key={r.k} className={`grid grid-cols-[6.5rem_1fr] gap-3 py-3 ${habom ? 'border-b border-blush last:border-0' : 'border-b border-ink/15'}`}>
                      <dt className={habom ? 'text-[0.8125rem] font-semibold text-plum-soft' : 'label pt-1 text-ink-mute'}>{r.k}</dt>
                      <dd className="whitespace-pre-line">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </section>

        {demo && (
          <section id="demo" aria-labelledby="demo-title" className="scroll-mt-32 pb-16 md:pb-24">
            {demo.node}
          </section>
        )}

        {spec.gallery.length > 0 && (
          <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-32 pb-16 md:pb-24">
            <SectionTitle id="gallery-title" n={tabs.findIndex((x) => x.id === 'gallery') + 1} title={t('galleryTitle')} habom={habom} note={spec.galleryIsKeyArt ? t('galleryKeyArt') : undefined} />
            <div className="mt-10">
              <Gallery images={spec.gallery} title={spec.title} variant={variant} />
            </div>
          </section>
        )}

        {spec.videos.length > 0 && (
          <section id="videos" aria-labelledby="videos-title" className="scroll-mt-32 pb-16 md:pb-24">
            <SectionTitle id="videos-title" n={tabs.findIndex((x) => x.id === 'videos') + 1} title={t('videosTitle')} habom={habom} />
            <div className="mt-10">
              <VideoShelf videos={spec.videos} variant={variant} />
            </div>
          </section>
        )}

        {spec.credits.length > 0 && (
          <section id="credits" aria-labelledby="credits-title" className="scroll-mt-32 pb-16 md:pb-24">
            <SectionTitle id="credits-title" n={tabs.findIndex((x) => x.id === 'credits') + 1} title={t('creditsTitle')} habom={habom} />
            <div className="mt-10 grid gap-x-12 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
              {spec.credits.map((g) => (
                <div key={g.id} className={habom ? 'rounded-[24px] bg-white p-6 ring-1 ring-blush' : ''}>
                  <h3 className={habom ? 'font-round text-lg text-rose' : 'border-b border-ink pb-3 font-serif text-lg font-semibold'}>{g.title}</h3>
                  <dl className="mt-3 text-[0.9375rem]">
                    {g.rows.map((r, i) => (
                      <div key={i} className="leader py-1.5">
                        <dt className={habom ? 'shrink-0 text-plum-soft' : 'shrink-0 text-ink-mute'}>{r.role}</dt>
                        <dd className="text-right font-medium">{r.name}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        {spec.timeline.length > 0 && (
          <section id="history" aria-labelledby="history-title" className="scroll-mt-32 pb-16 md:pb-24">
            <SectionTitle id="history-title" n={tabs.findIndex((x) => x.id === 'history') + 1} title={t('historyTitle')} habom={habom} />
            <ol data-testid="project-timeline" className={`mt-10 ${habom ? 'space-y-3' : 'border-t border-ink/15'}`}>
              {spec.timeline.map((row, i) => (
                <li key={i} className={habom ? 'flex flex-col gap-1 rounded-[18px] bg-white px-5 py-4 ring-1 ring-blush sm:flex-row sm:items-center sm:gap-6' : 'grid gap-1 border-b border-ink/15 py-5 sm:grid-cols-[12rem_1fr] sm:gap-6'}>
                  <span className={habom ? 'font-round-latin text-sm font-bold text-rose sm:w-36' : 'font-latin text-2xl font-semibold text-accent'}>{row.date}</span>
                  <span className={habom ? 'text-[1rem]' : 'font-serif text-[1.0625rem]'}>{row.text}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(spec.stores.length > 0 || spec.platforms.length > 0) && (
          <section id="store" aria-labelledby="store-title" className="scroll-mt-32 pb-16 md:pb-24">
            <SectionTitle id="store-title" n={tabs.findIndex((x) => x.id === 'store') + 1} title={t('storeTitle')} habom={habom} />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {spec.stores.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex min-h-[96px] items-center justify-between gap-6 p-6 transition-colors ${habom ? 'rounded-[24px] bg-white ring-1 ring-blush hover:ring-rose' : 'border border-ink hover:bg-ink hover:text-paper'}`}
                >
                  <span className="flex items-center gap-4">
                    <Icon name={s.kind === 'steam' ? 'steam' : 'globe'} size={28} />
                    <span>
                      <span className={`block text-lg ${habom ? 'font-round' : 'font-serif font-semibold'}`}>{s.label}</span>
                      <span className="block text-[0.8125rem] opacity-70">{t('storeVisit')}</span>
                    </span>
                  </span>
                  <Icon name="arrowUpRight" size={20} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
              {spec.platforms.length > 0 && (
                <div className={`flex min-h-[96px] flex-col justify-center p-6 ${habom ? 'rounded-[24px] bg-butter-soft' : 'bg-paper-deep'}`}>
                  <span className={habom ? 'text-[0.8125rem] font-semibold text-plum-soft' : 'label text-ink-mute'}>{t('storePlatforms')}</span>
                  <span className={`mt-2 text-lg ${habom ? 'font-round' : 'font-serif'}`}>{spec.platforms.join(' · ')}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {more.length > 0 && (
          <section aria-labelledby="more-title" className={`pb-24 md:pb-32 ${habom ? '' : 'border-t border-ink pt-12'}`}>
            <h2 id="more-title" className={habom ? 'font-round text-3xl' : 'font-serif text-2xl font-semibold md:text-3xl'}>{t('moreTitle')}</h2>
            <ul className="no-scrollbar -mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
              {more.map((w) => (
                <li key={w.slug} className="w-[66%] shrink-0 snap-start md:w-auto">
                  <Link href={w.href} className="group block">
                    <span className={`block overflow-hidden bg-night ${habom ? 'rounded-[20px]' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.banner} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    </span>
                    <span className={`mt-3 block ${habom ? 'font-round text-lg' : 'font-serif text-lg font-semibold'}`}>{w.title}</span>
                    <span className="block text-[0.8125rem] opacity-70">{w.series || ts(w.status as 'released')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

function SectionTitle({ id, n, title, habom, note }: { id: string; n: number; title: string; habom: boolean; note?: string }) {
  if (habom) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-butter font-round-latin text-sm font-bold">{n}</span>
        <h2 id={id} className="font-round text-[2rem] leading-none md:text-[2.5rem]">{title}</h2>
        {note && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-plum-soft ring-1 ring-blush">{note}</span>}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-ink pt-5">
      <span aria-hidden="true" className="font-mono text-xs text-accent">{String(n).padStart(2, '0')}</span>
      <h2 id={id} className="font-serif text-[1.75rem] font-semibold md:text-[2.25rem]">{title}</h2>
      {note && <span className="label ml-auto text-ink-mute">{note}</span>}
    </div>
  );
}
