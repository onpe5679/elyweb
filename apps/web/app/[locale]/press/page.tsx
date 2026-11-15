import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getGames, getLocalizedField, getLocalizedSettingValue, getPressKits, getSettings, type PressKit } from '@/lib/supabase';
import { toCard } from '@/lib/game-model';
import Shell from '@/components/shell/Shell';
import PageHeader from '@/components/pages/PageHeader';
import SectionHead from '@/components/pages/SectionHead';
import StatusMarker from '@/components/ui/StatusMarker';
import { ArrowUpRightIcon } from '@/components/pages/Icons';
import { safeUrl } from '@/components/pages/text';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'Press' });
  return { title: tm('metaTitle') };
}

/**
 * 프레스: 스튜디오 공통 자료(작품이 지정되지 않은 프레스 키트) + 작품별 자료.
 * 작품별 자료는 어드민의 press_kits.game_id 로 묶이고, 키 비주얼·포스터·스토어 페이지는 작품 정보에서 바로 꺼내 쓴다.
 */
export default async function PressPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, tp, kits, games, s] = await Promise.all([
    getTranslations('Press'),
    getTranslations('Pages'),
    getPressKits(),
    getGames(),
    getSettings(['contact_email']),
  ]);
  const email = getLocalizedSettingValue(s.contact_email, locale);
  const gameIds = new Set(games.map((g) => g.id));
  const studioKits = kits.filter((k) => !k.game_id || !gameIds.has(k.game_id));
  const byGame = games.map((g) => ({ game: g, card: toCard(g, locale), kits: kits.filter((k) => k.game_id === g.id) }));

  const KitRow = ({ kit }: { kit: PressKit }) => {
    const title = getLocalizedField(kit, 'title', locale);
    const desc = getLocalizedField(kit, 'description', locale) || t('list.fallbackDesc');
    const url = safeUrl(kit.file_url);
    return (
      <li className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-ink/15 py-6">
        <div className="min-w-0 flex-1">
          <h3 className="break-keep font-display text-[clamp(20px,2vw,26px)] font-extrabold leading-snug">{title}</h3>
          <p className="mt-1 break-keep font-serif text-[15px] leading-7 text-ink-2">{desc}</p>
        </div>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost" data-testid="press-open">
            {t('list.open')}
            <ArrowUpRightIcon />
            <span className="sr-only">: {title} ({tp('external')})</span>
          </a>
        ) : (
          <span className="marker marker--outline">{t('list.pending')}</span>
        )}
      </li>
    );
  };

  return (
    <Shell locale={locale}>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />

      {/* 스튜디오 공통 자료 */}
      <section aria-labelledby="kits-title" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          <SectionHead id="kits-title" eyebrow={t('list.eyebrow')} title={t('list.title')} sticky>
            <p>{t('list.contact')}</p>
            {email && (
              <p className="mt-4">
                <a href={`mailto:${email}`} className="link-u inline-flex min-h-[44px] items-center break-all font-mono text-[13px] font-bold">{email}</a>
              </p>
            )}
          </SectionHead>

          <div className="md:col-span-8">
            {studioKits.length === 0 ? (
              <div className="border border-ink/40 bg-paper-3 p-8 md:p-10" data-testid="press-empty">
                <h3 className="t-display break-keep text-[clamp(22px,2.6vw,30px)]">{t('empty.title')}</h3>
                <p className="mt-3 max-w-md break-keep font-serif text-[16px] leading-8 text-ink-2">{t('empty.body')}</p>
              </div>
            ) : (
              <ul className="border-t border-ink" data-testid="press-list">
                {studioKits.map((kit) => <KitRow key={kit.id} kit={kit} />)}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 작품별 자료 */}
      <section aria-labelledby="games-press-title" className="border-t border-ink/15 bg-paper-2">
        <div className="mx-auto max-w-page px-5 py-16 md:px-10 md:py-24">
          <div className="grid gap-6 md:grid-cols-12 md:gap-12">
            <SectionHead id="games-press-title" eyebrow={t('games.eyebrow')} title={t('games.title')}>
              <p>{t('games.lead')}</p>
            </SectionHead>
          </div>

          <ul className="mt-12 border-t border-ink" data-testid="press-games">
            {byGame.map(({ game, card, kits: gameKits }) => {
              const assets = [
                card.hero && { label: t('games.keyVisual'), url: card.hero },
                card.tall && card.tall !== card.hero && { label: t('games.poster'), url: card.tall },
                game.steam_url && { label: t('games.store'), url: game.steam_url },
              ].filter(Boolean) as { label: string; url: string }[];
              return (
                <li key={game.id} id={`press-${game.slug}`} className="grid scroll-mt-[calc(var(--header-h)+24px)] gap-8 border-b border-ink/15 py-10 md:grid-cols-12 md:gap-12 md:py-12">
                  <div className="md:col-span-4">
                    <Link href={`/games/${game.slug}`} className="group block" aria-label={card.title}>
                      <div className="plate">
                        <div className="aspect-[16/10] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={card.wide} alt="" loading="lazy" className="plate__img zoom-img object-[50%_28%]" />
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="min-w-0 md:col-span-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="marker">{card.series}</span>
                      <StatusMarker status={card.status} />
                    </div>
                    <h3 className="t-display mt-4 text-[clamp(24px,2.8vw,36px)]">
                      <Link href={`/games/${game.slug}`} className="link-u">{card.title}</Link>
                    </h3>
                    {assets.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-3">
                        {assets.map((a) => (
                          <li key={a.url}>
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost !min-h-[42px] !text-[14px]">
                              {a.label} <ArrowUpRightIcon />
                              <span className="sr-only">({tp('external')})</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    {gameKits.length > 0 ? (
                      <ul className="mt-6 border-t border-ink/40">
                        {gameKits.map((kit) => <KitRow key={kit.id} kit={kit} />)}
                      </ul>
                    ) : (
                      <p className="mt-5 break-keep font-serif text-[15px] leading-7 text-ink-3">{t('games.none')}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </Shell>
  );
}
