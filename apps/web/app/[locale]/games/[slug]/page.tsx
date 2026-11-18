import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGameBySlug, getGameSectionRows, getGames } from '@/lib/supabase';
import { toCard, toDetail } from '@/lib/game-model';
import { fmtDate, yearLabel } from '@/lib/format';
import { Link } from '@/i18n/routing';
import Shell from '@/components/shell/Shell';
import StatusMarker from '@/components/ui/StatusMarker';
import DetailNav from '@/components/game/DetailNav';
import ImageCarousel from '@/components/game/ImageCarousel';
import CreditsGrid from '@/components/game/CreditsGrid';
import StoreIcon from '@/components/game/StoreIcon';
import VideoCard from '@/components/game/VideoCard';
import RichText from '@/components/game/RichText';
import HabomGameDetail from '@/components/habom/HabomGameDetail';
import { SocialIcon } from '@/components/pages/Icons';
import { handleOf } from '@/components/pages/text';

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
  const related = all
    .filter((g) => g.slug !== slug)
    .map((g) => toCard(g, locale))
    .filter((c) => c.brand === m.brand);

  // 하봄 작품은 하봄 화면(시안 C)으로 그린다.
  if (m.brand === 'habom') return <HabomGameDetail m={m} locale={locale} related={related} />;

  const sameSeries = related.filter((c) => c.series === m.series);
  const relatedList = (sameSeries.length ? sameSeries : related).slice(0, 3);

  const tabs = [
    { id: 'overview', label: t('tabs.overview'), show: true },
    { id: 'gallery', label: t('tabs.gallery'), show: m.images.length > 0 },
    { id: 'video', label: t('tabs.video'), show: m.videos.length > 0 },
    { id: 'credits', label: t('tabs.credits'), show: m.credits.length > 0 },
    { id: 'related', label: t('tabs.related'), show: relatedList.length > 0 },
  ].filter((x) => x.show);

  const info: { label: string; value: React.ReactNode }[] = [
    { label: t('info.series'), value: m.series },
    { label: t('info.status'), value: <StatusMarker status={m.status} /> },
    { label: t('info.platform'), value: m.platforms.join(', ') },
    { label: t('info.genre'), value: m.genres.join(' · ') },
    { label: t('info.release'), value: m.release ? fmtDate(m.release.date, locale) : yearLabel(m.year, t('comingSoon')) },
    {
      label: t('info.exhibitions'),
      value: m.exhibitions.length ? (
        <ul className="space-y-1.5" data-testid="exhibitions">
          {m.exhibitions.map((e, i) => (
            <li key={i} className="grid grid-cols-[3.2rem_minmax(0,1fr)] gap-2">
              <span className="font-mono text-[12px] leading-6 text-ink-3">{e.date.match(/\d{4}/)?.[0] ?? e.date}</span>
              <span className="break-keep">{e.text}</span>
            </li>
          ))}
        </ul>
      ) : '',
    },
  ].filter((r) => r.value);

  return (
    <Shell locale={locale}>
      {/* 히어로: 큰 작품 비주얼 · 작품명 · 스토어 */}
      <header className="on-dark relative isolate overflow-hidden bg-[#0b0d14] text-white">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.hero || m.tall} alt="" data-testid="game-banner" className="h-full w-full object-cover object-[50%_30%]" />
          {/* 목록 썸네일이 배너와 다르면, 목록에서 본 그림이 배너로 겹쳐 바뀐다(게임 속 O.L. 연출과 같은 방식). */}
          {m.wide && m.hero && m.wide !== m.hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.wide} alt="" aria-hidden data-testid="game-banner-ol" className="hero-ol absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-black/30" />
        </div>
        <div className="mx-auto grid min-h-[min(84svh,820px)] max-w-page items-end gap-10 px-5 pb-12 pt-28 md:px-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-16">
          <div className="min-w-0">
            <nav aria-label={t('breadcrumb')} className="mb-6 font-mono text-[12px] uppercase tracking-[.14em] text-white/70">
              <Link href="/games" className="inline-block py-2 hover:text-white">{t('breadcrumbWorks')}</Link>
              <span aria-hidden> / </span>
              <span>{m.series}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2">
              <span className="marker !bg-white !text-black">{m.series}</span>
              <StatusMarker status={m.status} className="!bg-transparent !text-white !shadow-[inset_0_0_0_1px_rgba(255,255,255,.7)]" />
              <span className="ml-1 font-mono text-[12px] tracking-[.14em] text-white/75">{yearLabel(m.year, t('comingSoon'))}</span>
            </div>
            <h1 className="t-display mt-5 whitespace-pre-line text-[clamp(40px,7.4vw,112px)] text-white [text-shadow:0_2px_30px_rgba(0,0,0,.45)]">{m.title}</h1>
            <p className="mt-6 max-w-xl whitespace-pre-line break-keep font-serif text-[clamp(16px,1.4vw,20px)] leading-8 text-white/85">{m.desc}</p>
            <p className="mt-5 font-mono text-[12px] uppercase tracking-[.14em] text-white/70">
              {[m.platforms.join(', '), m.genres.join(' · ')].filter(Boolean).join('   ·   ')}
            </p>
            <div className="mt-9 flex flex-wrap gap-3" aria-label={t('stores')} data-testid="hero-stores">
              {m.stores.map((s, i) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn ${i === 0 ? 'btn--on-dark' : 'btn--on-dark-ghost'}`}
                >
                  <StoreIcon kind={s.kind} size={18} />
                  {t('buy', { name: s.name })} <span aria-hidden>↗</span>
                </a>
              ))}
              {m.sns.map((x) => (
                <a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" className="btn btn--on-dark-ghost" data-testid="hero-sns">
                  <SocialIcon id={x.kind} className="h-[18px] w-[18px]" />
                  {handleOf(x.url)} <span aria-hidden>↗</span>
                </a>
              ))}
              {m.officialUrl && (
                <a href={m.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn--on-dark-ghost">
                  <StoreIcon kind="web" size={18} /> {t('official')} <span aria-hidden>↗</span>
                </a>
              )}
              {m.videos.length > 0 && (
                <a href="#video" className="btn btn--on-dark-ghost">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                  {t('watch')}
                </a>
              )}
            </div>
          </div>
          {m.tall && (
            <div className="hidden lg:block">
              {/* 포스터는 자르지 않고 원본 비율 그대로(전체 포스터가 보이게) */}
              <div className="plate">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.tall} alt={m.title} data-testid="game-poster" className="block h-auto max-h-[64svh] w-full object-contain" />
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
                  <h2 className="t-display mb-7 text-[clamp(26px,3vw,38px)]">{s.title}</h2>
                  <RichText text={s.body} />
                </div>
              ))
            )}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9" aria-label={t('info.title')}>
            <div className="sticky top-[calc(var(--header-h)+80px)]">
              <h2 className="t-eyebrow mb-4">{t('info.title')}</h2>
              <dl className="border-t border-ink" data-testid="game-info">
                {info.map((r) => (
                  <div key={r.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-4 text-[15px]">
                    <dt className="font-mono text-[12px] uppercase tracking-wider text-ink-3">{r.label}</dt>
                    <dd className="min-w-0 break-keep">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </section>

        {m.images.length > 0 && (
          <section id="gallery" aria-label={t('imagesLabel')} className="scroll-mt-[calc(var(--header-h)+60px)] border-t border-ink/15 py-16 md:py-20">
            <ImageCarousel images={m.images} title={m.title} />
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
            <CreditsGrid groups={m.credits} />
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
                      <div className="aspect-[16/10] overflow-hidden">
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
