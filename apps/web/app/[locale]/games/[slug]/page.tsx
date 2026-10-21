import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGameBySlug, getGameSectionRows, getGames } from '@/lib/supabase';
import { toCard, toDetail } from '@/lib/game-model';
import { hasExperience } from '@/lib/brands';
import { fmtDate } from '@/lib/format';
import { Link } from '@/i18n/routing';
import Shell from '@/components/shell/Shell';
import StatusMarker from '@/components/ui/StatusMarker';
import DetailNav from '@/components/game/DetailNav';
import Gallery from '@/components/game/Gallery';
import VideoCard from '@/components/game/VideoCard';
import RichText from '@/components/game/RichText';
import RememberGame from '@/components/game/RememberGame';
import ExperienceLauncher from '@/components/habom/ExperienceLauncher';

export const revalidate = 10;

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const game = await getGameBySlug(slug);
  if (!game) return {};
  const m = toCard(game, locale);
  return { title: m.title, description: m.desc.replace(/\s+/g, ' ').slice(0, 140), openGraph: { images: m.wide ? [m.wide] : [] } };
}

export async function generateStaticParams() {
  const games = await getGames();
  return games.map((g) => ({ slug: g.slug }));
}

export default async function GameDetailPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const game = await getGameBySlug(slug);
  if (!game) notFound();
  const [t, rows, all] = await Promise.all([getTranslations('Game'), getGameSectionRows(slug), getGames()]);

  const m = toDetail(game, rows, locale);
  const habom = m.brand === 'habom';
  const experience = hasExperience(game);
  const primaryStore = m.stores[0];
  const related = all
    .filter((g) => g.slug !== slug)
    .map((g) => toCard(g, locale))
    .filter((c) => c.brand === m.brand);
  const sameSeries = related.filter((c) => c.series === m.series);
  const relatedList = (sameSeries.length ? sameSeries : related).slice(0, 3);

  const plates = [
    ...(m.keyArt.length > 1 ? m.keyArt.map((src, i) => ({ src, caption: i === 0 ? t('keyart.visual') : t('keyart.poster') })) : []),
    ...m.gallery.flatMap((g) => g.images.map((src) => ({ src, caption: g.title }))),
  ];

  const tabs = [
    { id: 'overview', label: t('tabs.overview'), show: true },
    { id: 'gallery', label: t('tabs.gallery'), show: plates.length > 0 },
    { id: 'video', label: t('tabs.video'), show: m.videos.length > 0 },
    { id: 'credits', label: t('tabs.credits'), show: m.credits.length > 0 },
    { id: 'history', label: t('tabs.history'), show: m.timeline.length > 0 },
    { id: 'related', label: t('tabs.related'), show: relatedList.length > 0 },
  ].filter((x) => x.show);

  const info: { label: string; value: React.ReactNode }[] = [
    { label: t('info.series'), value: m.series },
    { label: t('info.status'), value: <StatusMarker status={m.status} /> },
    { label: t('info.platform'), value: m.platforms.join(', ') },
    { label: t('info.genre'), value: m.genres.join(' · ') },
    { label: t('info.release'), value: m.release ? fmtDate(m.release.date, locale) : '' },
    {
      label: t('info.staff'),
      value: m.keyStaff.length ? (
        <ul className="space-y-1">
          {m.keyStaff.slice(0, 3).map((s) => (
            <li key={s.role + s.name}><span className="text-ink-3">{s.role}</span> {s.name}</li>
          ))}
        </ul>
      ) : '',
    },
  ].filter((r) => r.value);

  return (
    <Shell brand={m.brand} locale={locale}>
      <RememberGame slug={m.slug} title={m.title} />

      {/* 히어로: 큰 작품 비주얼 · 작품명 · 주요 버튼 */}
      <header className="on-dark relative isolate overflow-hidden bg-[#0b0d14] text-white">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.hero || m.tall} alt="" data-testid="game-banner" className="h-full w-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-black/30" />
        </div>
        <div className="mx-auto grid min-h-[min(84svh,820px)] max-w-page items-end gap-10 px-5 pb-12 pt-28 md:px-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-16">
          <div className="min-w-0">
            <nav aria-label={t('breadcrumb')} className="mb-6 font-mono text-[12px] uppercase tracking-[.14em] text-white/70">
              <Link href="/games" className="hover:text-white">{t('breadcrumbWorks')}</Link>
              <span aria-hidden> / </span>
              <span>{m.series}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`marker ${habom ? 'marker--sub' : ''} !bg-white !text-black`} style={habom ? { background: 'rgb(var(--c-sub))', color: 'rgb(59 36 51)' } : undefined}>{m.series}</span>
              <StatusMarker status={m.status} className="!bg-transparent !text-white !shadow-[inset_0_0_0_1px_rgba(255,255,255,.7)]" />
            </div>
            <h1 className="t-display mt-5 whitespace-pre-line text-[clamp(40px,7.4vw,112px)] text-white [text-shadow:0_2px_30px_rgba(0,0,0,.45)]">{m.title}</h1>
            <p className="mt-6 max-w-xl whitespace-pre-line break-keep font-serif text-[clamp(16px,1.4vw,20px)] leading-8 text-white/85">{m.desc}</p>
            <p className="mt-5 font-mono text-[12px] uppercase tracking-[.14em] text-white/70">
              {[m.platforms.join(', '), m.genres.join(' · ')].filter(Boolean).join('   ·   ')}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {primaryStore && (
                <a href={primaryStore.url} target="_blank" rel="noopener noreferrer" className={`btn btn--on-dark ${habom ? '!border-ink' : ''}`}>
                  {t('buy', { name: primaryStore.name })} <span aria-hidden>↗</span>
                </a>
              )}
              {experience && <ExperienceLauncher slug={m.slug} title={m.title} image={m.wide || m.tall} variant="primary" />}
              {m.videos.length > 0 && (
                <a href="#video" className="btn btn--on-dark-ghost">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                  {t('watch')}
                </a>
              )}
              {m.officialUrl && (
                <a href={m.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn--on-dark-ghost">{t('official')} ↗</a>
              )}
            </div>
          </div>
          {m.tall && (
            <div className="hidden lg:block">
              <div className="plate rotate-[1.5deg]">
                <div className="aspect-[3/4] overflow-hidden" style={{ borderRadius: 'calc(var(--radius-card) - 8px)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.tall} alt={m.title} className="plate__img" />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <DetailNav items={tabs.map(({ id, label }) => ({ id, label }))} label={t('tabsLabel')} />

      <div className="mx-auto max-w-page px-5 md:px-10">
        {/* 소개: 시놉시스·특징(글) + 작품 정보(오른쪽 열) */}
        <section id="overview" className="scroll-mt-[calc(var(--header-h)+60px)] grid gap-14 py-16 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {m.story.length === 0 ? (
              <p className="t-prose whitespace-pre-line break-keep">{m.desc}</p>
            ) : (
              m.story.map((s, i) => (
                <div key={s.id} className={i > 0 ? 'mt-16 border-t border-ink/15 pt-12' : ''}>
                  <p className="t-eyebrow">{s.kind === 'synopsis' ? t('synopsis') : t('about')}</p>
                  <h2 className="t-display mt-3 mb-7 text-[clamp(26px,3vw,38px)]">{s.title}</h2>
                  <RichText text={s.body} />
                </div>
              ))
            )}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9" aria-label={t('info.title')}>
            <div className="sticky top-[calc(var(--header-h)+80px)]">
              <h2 className="t-eyebrow mb-4">{t('info.title')}</h2>
              <dl className="border-t border-ink">
                {info.map((r) => (
                  <div key={r.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-4 text-[15px]">
                    <dt className="font-mono text-[12px] uppercase tracking-wider text-ink-3">{r.label}</dt>
                    <dd className="min-w-0 break-keep">{r.value}</dd>
                  </div>
                ))}
              </dl>
              {m.stores.length > 0 && (
                <div className="mt-8 flex flex-col gap-3">
                  {m.stores.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost justify-between">
                      <span>{s.name}</span><span aria-hidden>↗</span>
                    </a>
                  ))}
                </div>
              )}
              {experience && (
                <div className="mt-8 rounded-card bg-paper-2 p-6 ring-2 ring-ink">
                  <p className="font-display text-[22px]">{t('experience.title')}</p>
                  <p className="mt-2 break-keep text-[14px] leading-7 text-ink-2">{t('experience.body')}</p>
                  <div className="mt-5"><ExperienceLauncher slug={m.slug} title={m.title} image={m.wide || m.tall} variant="card" /></div>
                </div>
              )}
            </div>
          </aside>
        </section>

        {plates.length > 0 && (
          <section id="gallery" className="scroll-mt-[calc(var(--header-h)+60px)] border-t border-ink/15 py-16 md:py-24">
            <h2 className="t-display mb-3 text-[clamp(26px,3vw,38px)]">{t('keyart.title')}</h2>
            <p className="mb-10 max-w-xl break-keep font-serif text-[15px] leading-8 text-ink-2">{t('keyart.lead')}</p>
            <Gallery items={plates} title={m.title} />
          </section>
        )}

        {m.videos.length > 0 && (
          <section id="video" className="scroll-mt-[calc(var(--header-h)+60px)] border-t border-ink/15 py-16 md:py-24">
            <h2 className="t-display mb-10 text-[clamp(26px,3vw,38px)]">{t('videos.title')}</h2>
            <div className="grid gap-10 sm:grid-cols-2">
              {m.videos.map((v, i) => (
                <VideoCard key={v.id} id={`v-${v.id}`} title={v.title} youtubeId={v.youtubeId} url={v.url} poster={m.wide || m.tall} large={i === 0 && m.videos.length % 2 === 1} />
              ))}
            </div>
          </section>
        )}

        {m.credits.length > 0 && (
          <section id="credits" className="scroll-mt-[calc(var(--header-h)+60px)] border-t border-ink/15 py-16 md:py-24">
            <h2 className="t-display mb-10 text-[clamp(26px,3vw,38px)]">{t('credits.title')}</h2>
            <div className="gap-x-14 lg:columns-2">
              {m.credits.map((g) => (
                <section key={g.id} className="mb-12 break-inside-avoid">
                  <h3 className="mb-3 font-mono text-[12px] uppercase tracking-[.14em] text-accent-text">{g.title}</h3>
                  <dl className="border-t border-ink">
                    {g.rows.map((r, i) => (
                      <div key={i} className="grid grid-cols-[minmax(7rem,40%)_minmax(0,1fr)] gap-4 border-b border-ink/12 py-2.5 text-[15px]">
                        <dt className="text-ink-3">{r.role}</dt>
                        <dd className="font-medium">{r.name}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </section>
        )}

        {m.timeline.length > 0 && (
          <section id="history" className="scroll-mt-[calc(var(--header-h)+60px)] border-t border-ink/15 py-16 md:py-24">
            <h2 className="t-display mb-10 text-[clamp(26px,3vw,38px)]">{t('history.title')}</h2>
            {m.timeline.map((g) => (
              <ol key={g.id} className="max-w-3xl border-t border-ink">
                {g.items.map((it, i) => (
                  <li key={i} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-6 border-b border-ink/15 py-4">
                    <span className="font-display text-[22px] font-extrabold text-accent-text">{fmtDate(it.date, locale)}</span>
                    <span className="break-keep font-serif text-[17px] leading-8 text-ink-2">{it.text}</span>
                  </li>
                ))}
              </ol>
            ))}
          </section>
        )}

        {relatedList.length > 0 && (
          <section id="related" className="scroll-mt-[calc(var(--header-h)+60px)] border-t border-ink/15 py-16 md:py-24">
            <h2 className="t-display mb-10 text-[clamp(26px,3vw,38px)]">{sameSeries.length ? t('related.series') : t('related.other')}</h2>
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedList.map((c) => (
                <li key={c.slug}>
                  <Link href={`/games/${c.slug}`} className="group block">
                    <div className="plate">
                      <div className="aspect-[16/10] overflow-hidden" style={{ borderRadius: 'calc(var(--radius-card) - 8px)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.wide} alt="" loading="lazy" className="plate__img zoom-img object-[50%_28%]" />
                      </div>
                    </div>
                    <p className="mt-4 font-mono text-[12px] uppercase tracking-wider text-ink-3">{c.series}</p>
                    <p className="t-display mt-1 text-[22px]"><span className="link-u">{c.title}</span></p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Shell>
  );
}
