import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { GameCardModel, GameDetailModel } from '@/lib/game-model';
import { yearOf } from '@/lib/game-model';
import { fmtDate } from '@/lib/format';
import ImageCarousel from '@/components/game/ImageCarousel';
import CreditsGrid from '@/components/game/CreditsGrid';
import StoreIcon from '@/components/game/StoreIcon';
import HabomShell from './HabomShell';
import HabomTabs from './HabomTabs';
import Icon from './Icon';
import TrailerButton from './TrailerButton';
import VideoShelf from './VideoShelf';
import CopyLinkButton from './CopyLinkButton';
import DialogueDemo, { DemoLauncher } from './DialogueDemo';
import { DEMO_SCRIPTS } from './demo-script';

type Props = { m: GameDetailModel; locale: string; related: GameCardModel[] };

const STATUSES = ['released', 'coming_soon', 'in_development', 'publishing'] as const;

/** 긴 제목(일본어 등)은 한 단계 작게 */
function titleScale(text: string, sizes: [string, string, string]) {
  const len = Array.from(text.replace(/\s/g, '')).length;
  return len > 14 ? sizes[2] : len > 9 ? sizes[1] : sizes[0];
}

/**
 * 하봄 작품 상세(시안 C 구성).
 * 히어로(키아트 + 흰 카드: 제목·로그라인·PV·미니 체험·스토어) → 소개(시놉시스 + 기본 정보) → 미니 체험
 * → 이미지(가로 캐러셀) → 영상 → 제작진. 회의 피드백대로 연혁·하단 구매 섹션은 두지 않고,
 * 주요 전시는 기본 정보 안에, 스토어 버튼은 히어로에 둔다.
 */
export default async function HabomGameDetail({ m, locale, related }: Props) {
  const [t, ts, th] = await Promise.all([getTranslations('HabomGame'), getTranslations('Status'), getTranslations('Habom')]);
  const status = (STATUSES as readonly string[]).includes(m.status) ? ts(m.status as (typeof STATUSES)[number]) : m.status;
  const script = DEMO_SCRIPTS[m.slug]?.[locale] || DEMO_SCRIPTS[m.slug]?.ko;
  const steam = m.stores.find((s) => s.kind === 'steam');
  const trailer = m.videos[0];
  const banner = m.hero || m.wide || m.tall;
  const cover = m.tall && m.tall !== banner ? m.tall : '';

  // 구역 순서 = 탭 순서. 번호는 제목이 있는 구역에만 차례로 붙인다(이미지 캐러셀은 제목 없이).
  const sections = [
    { id: 'about', label: t('tabAbout'), numbered: true, show: true },
    { id: 'demo', label: t('tabDemo'), numbered: true, show: !!script },
    { id: 'gallery', label: t('tabGallery'), numbered: false, show: m.images.length > 0 },
    { id: 'videos', label: t('tabVideos'), numbered: true, show: m.videos.length > 0 },
    { id: 'credits', label: t('tabCredits'), numbered: true, show: m.credits.length > 0 },
  ].filter((s) => s.show);
  let counter = 0;
  const num: Record<string, number> = {};
  sections.forEach((s) => {
    if (s.numbered) num[s.id] = ++counter;
  });

  const info: { k: string; v: React.ReactNode }[] = [
    { k: t('infoSeries'), v: m.series },
    { k: t('infoGenre'), v: m.genres.join(' · ') },
    { k: t('infoPlatform'), v: m.platforms.join(' · ') },
    { k: t('infoStatus'), v: status },
    { k: t('infoRelease'), v: m.release ? fmtDate(m.release.date, locale) : '' },
    {
      k: t('infoExhibitions'),
      v: m.exhibitions.length ? (
        <ul className="space-y-1.5" data-testid="game-exhibitions">
          {m.exhibitions.map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 font-round-latin text-[0.8125rem] font-bold leading-6 text-rose">{yearOf(e.date) ?? e.date}</span>
              <span>{e.text}</span>
            </li>
          ))}
        </ul>
      ) : null,
    },
  ].filter((r) => r.v);

  const btn = {
    primary:
      'inline-flex min-h-[52px] items-center gap-2 rounded-full bg-rose px-6 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(201,65,109,.8)] transition-transform hover:-translate-y-0.5',
    demo: 'inline-flex min-h-[52px] items-center gap-2 rounded-full bg-butter px-6 text-[0.9375rem] font-semibold text-plum transition-transform hover:-translate-y-0.5',
    store:
      'inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-plum px-5 text-[0.9375rem] font-semibold text-cream transition-colors hover:bg-rose',
    ghost: 'inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 text-[0.9375rem] font-semibold text-plum ring-1 ring-plum/15 transition-colors hover:ring-rose',
    icon: 'inline-flex min-h-[52px] min-w-[52px] items-center justify-center gap-2 rounded-full bg-white px-4 text-plum ring-1 ring-plum/15 hover:ring-rose',
  };

  return (
    <HabomShell locale={locale}>
      <article className="bg-cream text-plum">
        {/* 히어로 */}
        <section data-testid="game-banner" className="relative overflow-hidden pb-6">
          <span aria-hidden="true" className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-blush" />
          <span aria-hidden="true" className="absolute -right-16 top-[38%] h-56 w-56 rounded-full bg-butter-soft" />
          <div className="relative mx-auto max-w-page px-4 pt-6 md:px-10 md:pt-8">
            <div className="overflow-hidden rounded-[28px] bg-blush md:rounded-[36px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner} alt="" className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[21/9]" style={{ objectPosition: '50% 30%' }} />
            </div>
            <div className="relative -mt-16 grid gap-8 px-2 md:-mt-24 md:px-8 lg:grid-cols-12">
              <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(74,43,56,.35)] md:p-10 lg:col-span-8">
                <nav aria-label={t('breadcrumb')}>
                  <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-plum-soft">
                    <li><Link href="/habom" className="hover:text-rose hover:underline">{th('name')}</Link></li>
                    <li aria-hidden="true">/</li>
                    <li><Link href="/habom#works" className="hover:text-rose hover:underline">{th('navWorks')}</Link></li>
                  </ol>
                </nav>
                <p className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Link href="/habom" className="rounded-full bg-rose px-3 py-1 font-round-latin font-bold uppercase tracking-[0.12em] text-white hover:bg-plum">
                    habom studio
                  </Link>
                  <span className="rounded-full bg-butter px-3 py-1 font-semibold text-plum">{status}</span>
                </p>
                <h1 className={`mt-5 whitespace-pre-line font-round leading-[1.1] [text-wrap:balance] ${titleScale(m.title, ['text-[2.5rem] md:text-[4rem]', 'text-[2.25rem] md:text-[3.5rem]', 'text-[2rem] md:text-[3rem]'])}`}>
                  {m.title}
                </h1>
                {m.genres.length > 0 && (
                  <p className="mt-5 flex flex-wrap gap-2 text-[0.8125rem]">
                    {m.genres.map((g) => <span key={g} className="rounded-full bg-cream px-3 py-1 text-plum-soft ring-1 ring-blush">{g}</span>)}
                  </p>
                )}
                {m.desc && <p className="mt-6 max-w-2xl whitespace-pre-line text-[1.0625rem] leading-relaxed text-plum-soft">{m.desc}</p>}

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  {trailer && <TrailerButton youtubeId={trailer.youtubeId} title={`${m.title} — ${trailer.title}`} className={btn.primary} />}
                  {script && <DemoLauncher className={btn.demo} />}
                  <CopyLinkButton className={btn.icon} />
                </div>

                {(m.stores.length > 0 || m.officialUrl) && (
                  <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-blush pt-6" data-testid="game-stores">
                    <span className="mr-1 text-[0.8125rem] font-semibold text-plum-soft">{t('storeLabel')}</span>
                    {m.stores.map((s) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className={btn.store} aria-label={t('storeOpen', { name: s.name })}>
                        <StoreIcon kind={s.kind} size={20} /> {s.name} <Icon name="arrowUpRight" size={14} />
                      </a>
                    ))}
                    {m.officialUrl && (
                      <a href={m.officialUrl} target="_blank" rel="noopener noreferrer" className={btn.ghost}>
                        <Icon name="globe" size={18} /> {t('official')} <Icon name="arrowUpRight" size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
              {cover && (
                <div className="hidden lg:col-span-4 lg:block lg:pt-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt="" className="w-full -rotate-2 rounded-[24px] border-[6px] border-white object-cover shadow-[0_24px_50px_-24px_rgba(74,43,56,.5)]" />
                </div>
              )}
            </div>
          </div>
        </section>

        <HabomTabs tabs={sections.map(({ id, label }) => ({ id, label }))} label={t('sections')} />

        <div className="mx-auto max-w-page px-5 md:px-10">
          {/* 소개: 이야기 + 기본 정보 */}
          <section id="about" aria-labelledby="about-title" className="scroll-mt-32 py-16 md:py-24">
            <SectionTitle id="about-title" n={num.about} title={t('tabAbout')} />
            <div className="mt-10 grid gap-12 lg:grid-cols-12">
              <div className="space-y-14 lg:col-span-7">
                {(m.story.length ? m.story : [{ id: 'logline', title: '', body: m.desc, kind: 'text' as const }]).map((block, bi) => (
                  <div key={block.id}>
                    {block.title && <h3 className="font-round text-2xl text-rose">{block.title}</h3>}
                    <StoryText text={block.body} lead={bi === 0} />
                  </div>
                ))}
              </div>
              <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="info-title">
                <div className="rounded-[24px] bg-white p-6 ring-1 ring-blush lg:sticky lg:top-36">
                  <h3 id="info-title" className="font-round text-xl">{t('infoTitle')}</h3>
                  <dl className="mt-4 text-[0.9375rem]">
                    {info.map((r) => (
                      <div key={r.k} className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-blush py-3 last:border-0">
                        <dt className="text-[0.8125rem] font-semibold text-plum-soft">{r.k}</dt>
                        <dd className="min-w-0 whitespace-pre-line break-keep">{r.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
            </div>
          </section>

          {script && (
            <section id="demo" aria-labelledby="demo-title" className="scroll-mt-32 pb-16 md:pb-24">
              <DialogueDemo script={script} background={banner} steamUrl={steam?.url} title={m.title} n={num.demo} />
            </section>
          )}

          {m.images.length > 0 && (
            <section id="gallery" aria-label={t('tabGallery')} className="scroll-mt-32 pb-16 md:pb-24">
              <ImageCarousel images={m.images} title={m.title} variant="habom" />
            </section>
          )}

          {m.videos.length > 0 && (
            <section id="videos" aria-labelledby="videos-title" className="scroll-mt-32 pb-16 md:pb-24">
              <SectionTitle id="videos-title" n={num.videos} title={t('videosTitle')} />
              <div className="mt-10">
                <VideoShelf videos={m.videos} />
              </div>
            </section>
          )}

          {m.credits.length > 0 && (
            <section id="credits" aria-labelledby="credits-title" className="scroll-mt-32 pb-16 md:pb-24">
              <SectionTitle id="credits-title" n={num.credits} title={t('creditsTitle')} />
              <div className="mt-10">
                <CreditsGrid groups={m.credits} variant="habom" />
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="more-title" className="pb-24 md:pb-32">
              <h2 id="more-title" className="font-round text-3xl">{t('moreTitle')}</h2>
              <ul className="no-scrollbar -mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
                {related.map((w) => (
                  <li key={w.slug} className="w-[66%] shrink-0 snap-start md:w-auto">
                    <Link href={`/games/${w.slug}`} className="group block">
                      <span className="block overflow-hidden rounded-[20px] bg-blush">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={w.wide || w.hero} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      </span>
                      <span className="mt-3 block font-round text-lg">{w.title}</span>
                      <span className="block text-[0.8125rem] opacity-70">{w.year ?? ts((STATUSES as readonly string[]).includes(w.status) ? (w.status as (typeof STATUSES)[number]) : 'coming_soon')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-blush py-10">
            <Link href="/habom#works" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 font-semibold ring-1 ring-plum/15 hover:ring-rose">
              <Icon name="arrowLeft" size={16} /> {t('backToHabom')}
            </Link>
            <Link href="/games" className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-plum-soft hover:text-rose">
              {t('allWorks')} <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </article>
    </HabomShell>
  );
}

function SectionTitle({ id, n, title }: { id: string; n?: number; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {n !== undefined && (
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-butter font-round-latin text-sm font-bold">{n}</span>
      )}
      <h2 id={id} className="font-round text-[2rem] leading-none md:text-[2.5rem]">{title}</h2>
    </div>
  );
}

/**
 * 어드민의 긴 글 → 문단. 빈 줄로 문단을 나누고, "[소제목]" 으로 시작하는 문단은 소제목 + 본문으로 그린다.
 * lead 이면 첫 문단을 조금 크게.
 */
function StoryText({ text, lead }: { text: string; lead: boolean }) {
  const paras = text.split(/\n\s*\n/).map((p) => p.replace(/​/g, '').trim()).filter(Boolean);
  return (
    <div className="mt-4 space-y-5 text-[1.0625rem] leading-[1.9] text-plum-soft">
      {paras.map((p, i) => {
        const m = p.match(/^\[([^\]\n]{1,60})\]\s*\n?([\s\S]*)$/);
        const body = m ? m[2].trim() : p;
        return (
          <div key={i}>
            {m && <h4 className="mb-1 font-semibold text-plum">{m[1]}</h4>}
            {body && <p className={`whitespace-pre-line break-keep ${lead && i === 0 && !m ? 'text-[1.1875rem] text-plum' : ''}`}>{body}</p>}
          </div>
        );
      })}
    </div>
  );
}
