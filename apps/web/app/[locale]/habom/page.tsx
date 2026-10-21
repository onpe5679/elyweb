import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGames, getLocalizedField, getTeamMembers } from '@/lib/supabase';
import { toCard, type GameCardModel } from '@/lib/game-model';
import Shell from '@/components/shell/Shell';
import StatusMarker from '@/components/ui/StatusMarker';
import ExperienceLauncher from '@/components/habom/ExperienceLauncher';
import { BEAT_MAP, ROOMMATES, SPEAKERS, type L10n, type Locale } from '@/components/habom/experience-script';
import '@/components/habom/habom.css';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'Habom' });
  return { title: tm('meta.title'), description: tm('meta.description') };
}

const HABOM_ROLE = /하봄|habom|ハボム/i;

/** 키아트: 세로형(커버)을 먼저, 없으면 가로형 */
const artOf = (c: GameCardModel) => c.tall || c.wide;

/** 섹션 위쪽의 물결 경계. text-* 색 = 앞 섹션의 배경색 */
function Wave({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={`hb-wave ${className}`} viewBox="0 0 1440 48" preserveAspectRatio="none" fill="currentColor">
      <path d="M0 0H1440V24Q1320 48 1200 24T960 24T720 24T480 24T240 24T0 24Z" />
    </svg>
  );
}

export default async function HabomPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const lc: Locale = locale === 'en' || locale === 'ja' ? locale : 'ko';
  const tx = (l: L10n) => l[lc] || l.ko;

  const t = await getTranslations('Habom');
  const [games, team] = await Promise.all([getGames(), getTeamMembers()]);

  const cards = games.map((g) => toCard(g, locale)).filter((c) => c.brand === 'habom');
  const hero = cards[0];
  const lead = team.find((m) => HABOM_ROLE.test([m.role_ko, m.role_en, m.role_ja].filter(Boolean).join(' ')));
  const leadName = lead ? getLocalizedField(lead, 'name', locale) : '';
  const leadRole = lead ? getLocalizedField(lead, 'role', locale) : '';

  // 체험 미리보기(장식): 대본의 첫 선택 장면을 그대로 보여 준다
  const meet = BEAT_MAP.meet;
  const previewLine = meet.lines[meet.lines.length - 1];
  const previewOptions = meet.next.type === 'choice' ? meet.next.choice.options.slice(0, 2) : [];
  const previewSpeaker = SPEAKERS[previewLine.speaker].name;

  return (
    <Shell brand="habom" locale={locale}>
      {/* (a) 히어로 ------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <span aria-hidden className="blob bob left-[-120px] top-[-140px] -z-10 h-72 w-72 bg-sub opacity-70 [--r:0deg]" />
        <span aria-hidden className="blob bob bottom-[70px] right-[-90px] -z-10 h-72 w-72 bg-accent opacity-40 [--d:1.2s]" />
        <span aria-hidden className="blob bob bottom-[22%] left-[38%] -z-10 hidden h-20 w-20 bg-accent opacity-50 [--d:.6s] lg:block" />

        <div className="mx-auto grid max-w-page items-center gap-14 px-5 pb-24 pt-10 md:px-10 md:pb-32 md:pt-14 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-5">
            <span className="sticker text-[15px] [--r:-3deg]">{t('hero.badge')}</span>
            <h1 id="habom-hero-title" className="mt-7">
              <span className="sr-only">{t('hero.wordmarkLabel')}</span>
              <span aria-hidden className="hb-mark">
                <span>하</span>
                <span className="hb-mark__ring">
                  <span>봄</span>
                </span>
              </span>
            </h1>
            <p className="kr-keep mt-5 max-w-sm font-mono text-[11px] leading-5 text-ink-3">{t('hero.wordmarkNote')}</p>
            <p className="kr-keep mt-7 max-w-lg text-balance whitespace-pre-line font-display text-[clamp(22px,2.2vw,30px)] leading-snug">{t('hero.tagline')}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              {hero && <ExperienceLauncher slug={hero.slug} title={hero.title} image={artOf(hero)} variant="primary" />}
              {hero && (
                <Link href={`/games/${hero.slug}`} className="btn btn--ghost" data-testid="habom-hero-game">
                  {t('hero.ctaGame')}
                </Link>
              )}
            </div>
            <Link href="/" className="link-u mt-6 inline-flex min-h-[44px] items-center gap-2 text-[15px] font-bold" data-testid="habom-back-elysian">
              <span aria-hidden>←</span>
              {t('hero.toElysian')}
            </Link>
          </div>

          <div className="relative min-w-0 lg:col-span-7">
            {hero ? (
              <Link href={`/games/${hero.slug}`} aria-label={hero.title} className="group block">
                <div className="plate !rounded-[44px] !p-3 rotate-[1.2deg] transition-transform duration-500 ease-page group-hover:rotate-0 md:!p-4">
                  <div className="relative aspect-[16/11] overflow-hidden rounded-[32px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={artOf(hero)} alt={hero.title} className="zoom-img h-full w-full object-cover object-[50%_30%]" />
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
                  <StatusMarker status={hero.status} />
                  <p className="font-display text-[clamp(22px,2.4vw,30px)]">{hero.title}</p>
                </div>
              </Link>
            ) : (
              <div className="plate !rounded-[44px] grid aspect-[16/11] place-items-center text-center text-ink-2">{t('works.empty')}</div>
            )}
            <span aria-hidden className="sticker bob absolute -right-1 -top-5 text-[14px] [--r:5deg] md:right-2">
              {t('hero.artSticker')}
            </span>
            <span aria-hidden className="sticker bob absolute -left-2 top-[34%] hidden text-[15px] [--d:.8s] [--r:-7deg] sm:inline-block">
              {t('hero.stickerA')}
            </span>
            <span aria-hidden className="sticker bob absolute -right-3 top-[58%] hidden text-[15px] [--d:1.6s] [--r:6deg] sm:inline-block">
              {t('hero.stickerB')}
            </span>
            <span aria-hidden className="sticker bob absolute -left-1 bottom-[22%] hidden text-[15px] [--d:2.2s] [--r:-4deg] md:inline-block">
              {t('hero.stickerC')}
            </span>
          </div>
        </div>
      </section>

      {/* (b) 작품 -------------------------------------------------------- */}
      <section id="works" aria-labelledby="habom-works-title" className="relative scroll-mt-20 bg-paper-2">
        <Wave className="text-paper" />
        <div className="mx-auto max-w-page px-5 pb-24 pt-24 md:px-10 md:pb-32 md:pt-32">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="t-eyebrow">{t('works.eyebrow')}</p>
              <h2 id="habom-works-title" className="t-display mt-3 text-[clamp(32px,4.6vw,60px)]">
                {t('works.title')}
              </h2>
              <p className="kr-keep mt-4 max-w-xl text-[16px] leading-8 text-ink-2">{t('works.lead')}</p>
            </div>
            <span className="marker marker--sub !text-[14px]">{t('works.count', { count: cards.length })}</span>
          </div>

          {cards.length === 0 ? (
            <p className="plate !rounded-[32px] p-10 text-center text-ink-2">{t('works.empty')}</p>
          ) : (
            <ul className={cards.length === 1 ? 'grid gap-10' : 'grid gap-10 md:grid-cols-2'}>
              {cards.map((c) => {
                const solo = cards.length === 1;
                return (
                  <li key={c.slug}>
                    <article data-testid="habom-game-card" className={`hb-card group p-3 md:p-4 ${solo ? 'lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-5' : 'h-full'}`}>
                      <Link href={`/games/${c.slug}`} aria-label={c.title} className={`block ${solo ? 'lg:col-span-7' : ''}`}>
                        <div className="relative aspect-[16/10] overflow-hidden rounded-[30px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={artOf(c)} alt="" loading="lazy" className="zoom-img h-full w-full object-cover object-[50%_30%]" />
                        </div>
                      </Link>
                      <div className={`px-2 pb-3 pt-6 md:px-4 ${solo ? 'lg:col-span-5 lg:py-6 lg:pr-8' : ''}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          {c.series && <span className="marker marker--sub">{c.series}</span>}
                          <StatusMarker status={c.status} />
                          <span className="marker marker--accent">{t('works.playable')}</span>
                        </div>
                        <h3 className="t-display kr-keep mt-4 text-[clamp(28px,3.4vw,46px)]">
                          <Link href={`/games/${c.slug}`} className="link-u">
                            {c.title}
                          </Link>
                        </h3>
                        {c.desc && <p className="kr-keep mt-4 line-clamp-4 whitespace-pre-line font-serif text-[16px] leading-8 text-ink-2">{c.desc}</p>}
                        {c.genres.length > 0 && (
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {c.genres.map((g) => (
                              <li key={g} className="rounded-full px-3 py-1 text-[13px] font-bold leading-5 text-ink-2 ring-2 ring-ink/30">
                                {g}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-7 flex flex-wrap gap-3">
                          <Link href={`/games/${c.slug}`} className="btn btn--ghost">
                            {t('works.open')}
                          </Link>
                          <ExperienceLauncher slug={c.slug} title={c.title} image={artOf(c)} variant="primary" label={t('works.play')} />
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* (c) 대사·선택지 체험 --------------------------------------------- */}
      {hero && (
        <section id="experience" aria-labelledby="habom-exp-title" className="relative scroll-mt-20 overflow-hidden bg-paper">
          <Wave className="text-paper-2" />
          <span aria-hidden className="blob bob right-[-90px] top-[18%] hidden h-64 w-64 bg-sub opacity-60 lg:block" />
          <div className="relative mx-auto grid max-w-page items-center gap-14 px-5 pb-24 pt-24 md:px-10 md:pb-32 md:pt-32 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-6">
              <p className="t-eyebrow">{t('experience.eyebrow')}</p>
              <h2 id="habom-exp-title" className="t-display kr-keep mt-3 whitespace-pre-line text-[clamp(32px,4.6vw,60px)]">
                {t('experience.title')}
              </h2>
              <p className="kr-keep mt-5 max-w-xl text-[16px] leading-8 text-ink-2">{t('experience.body')}</p>

              <ol className="mt-8 grid max-w-xl gap-4">
                {([1, 2, 3] as const).map((n) => (
                  <li key={n} className="flex gap-4">
                    <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-display text-[18px] text-accent-ink ring-2 ring-ink">
                      {n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-[20px] leading-snug">{t(`experience.step${n}Title`)}</h3>
                      <p className="kr-keep mt-1 text-[15px] leading-7 text-ink-2">{t(`experience.step${n}Body`)}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-9 max-w-xl">
                <h3 className="t-eyebrow !text-[12px]">{t('experience.roommates')}</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  {ROOMMATES.map((r) => (
                    <li key={r.id} className="rounded-[22px] bg-paper-3 px-4 py-3 ring-2 ring-ink/25">
                      <p className="font-display text-[19px] leading-tight">{tx(r.name)}</p>
                      <p className="kr-keep mt-1 text-[13px] leading-5 text-ink-2">{tx(r.trait)}</p>
                    </li>
                  ))}
                </ul>
                <p className="kr-keep mt-2 text-[12.5px] leading-5 text-ink-3">{t('experience.roommatesNote')}</p>
              </div>

              <div className="mt-9 max-w-xl rounded-[26px] bg-paper-3 px-5 py-4 ring-2 ring-ink/50" data-testid="habom-draft-notice">
                <p className="flex flex-wrap items-center gap-2 font-display text-[18px] leading-snug">
                  <span className="marker marker--sub !text-[12px]">{t('experience.noticeTag')}</span>
                  {t('experience.noticeTitle')}
                </p>
                <p className="kr-keep mt-2 text-[14.5px] leading-7 text-ink-2">{t('experience.noticeBody')}</p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <ExperienceLauncher slug={hero.slug} title={hero.title} image={artOf(hero)} variant="primary" />
                <p className="kr-keep text-[13px] text-ink-3">{t('experience.only')}</p>
              </div>
              <p className="mt-4 hidden font-mono text-[11.5px] tracking-wide text-ink-3 md:block">{t('experience.keys')}</p>
            </div>

            {/* 장식용 예시 화면(눌러 볼 수 있는 것은 왼쪽의 버튼) */}
            <div className="relative min-w-0 lg:col-span-6">
              <div aria-hidden className="hb-preview pointer-events-none relative isolate flex min-h-[460px] flex-col justify-end gap-3 p-4 sm:min-h-[520px] sm:p-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artOf(hero)} alt="" loading="lazy" className="exp-art -z-20" />
                <div className="exp-dim absolute inset-0 -z-10" />
                <span className="sticker absolute left-4 top-4 text-[14px] [--r:-3deg] sm:left-6 sm:top-6">{t('experience.previewLabel')}</span>
                {previewOptions.map((o, i) => (
                  <div key={o.id} className="exp-choice kr-keep" style={{ ['--i' as string]: i, animation: 'none' }}>
                    <span className="exp-key">{i + 1}</span>
                    <span>{tx(o.label)}</span>
                  </div>
                ))}
                <div className="exp-box mt-7 px-5 pb-4 pt-7 sm:px-7">
                  {previewSpeaker && <span className="exp-tag">{tx(previewSpeaker)}</span>}
                  <p className="exp-text kr-keep !min-h-0">{tx(previewLine.text)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* (d) 스튜디오 · 엘리시안으로 돌아가기 --------------------------------- */}
      <section aria-labelledby="habom-studio-title" className="relative scroll-mt-20 bg-paper-2">
        <Wave className="text-paper" />
        <div className="mx-auto max-w-page px-5 pb-24 pt-24 md:px-10 md:pb-28 md:pt-32">
          <div className="relative overflow-hidden rounded-[44px] bg-paper-3 px-6 py-12 ring-2 ring-ink md:px-14 md:py-16">
            <span aria-hidden className="blob bob right-[-60px] top-[-80px] h-52 w-52 bg-sub opacity-70 [--r:0deg]" />
            <span aria-hidden className="blob bob bottom-[-80px] right-[22%] h-60 w-60 bg-accent opacity-35 [--d:1.4s]" />
            <div className={`relative grid items-center gap-10 ${lead ? 'md:grid-cols-12' : ''}`}>
              <div className={`min-w-0 ${lead ? 'md:col-span-7' : ''}`}>
                <p className="t-eyebrow">{t('studio.eyebrow')}</p>
                <h2 id="habom-studio-title" className="t-display mt-3 text-[clamp(30px,4vw,52px)]">
                  {t('studio.title')}
                </h2>
                <p className="kr-keep mt-5 max-w-xl text-[16px] leading-8 text-ink-2">{t('studio.body')}</p>
                <p className="kr-keep mt-3 max-w-xl text-[14.5px] leading-7 text-ink-3">{t('studio.elysianNote')}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link href="/" className="btn btn--accent" data-testid="habom-to-elysian">
                    <span aria-hidden>←</span>
                    {t('studio.toElysian')}
                  </Link>
                  <Link href="/about" className="link-u inline-flex min-h-[44px] items-center text-[15px] font-bold">
                    {t('studio.toAbout')}
                  </Link>
                  <Link href="/contact" className="link-u inline-flex min-h-[44px] items-center text-[15px] font-bold">
                    {t('studio.toContact')}
                  </Link>
                </div>
              </div>

              {lead && (
                <div className="min-w-0 md:col-span-5">
                  <p className="t-eyebrow mb-3">{t('studio.teamEyebrow')}</p>
                  <div className="flex items-center gap-5 rounded-[32px] bg-paper-2 p-5 ring-2 ring-ink/30" data-testid="habom-team-lead">
                    {lead.profile_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={lead.profile_image} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-ink" />
                    ) : (
                      <span aria-hidden className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-accent font-display text-[34px] text-accent-ink ring-2 ring-ink">
                        {Array.from(leadName)[0]}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-display text-[26px] leading-tight">{leadName}</p>
                      <p className="kr-keep mt-1 text-[14.5px] leading-6 text-ink-2">{leadRole}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
