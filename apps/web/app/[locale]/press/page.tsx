import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getGames,
  getAllGameSectionRows,
  getLocalizedField,
  getLocalizedSettingValue,
  getPressKits,
  getSettings,
  type PressKit,
} from '@/lib/supabase';
import { toCard, toDetail } from '@/lib/game-model';
import Shell from '@/components/shell/Shell';
import PageHeader from '@/components/pages/PageHeader';
import { ArrowUpRightIcon } from '@/components/pages/Icons';
import { safeUrl } from '@/components/pages/text';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'Press' });
  return { title: tm('metaTitle') };
}

/**
 * 프레스: 스튜디오 공통 자료(작품을 비워 둔 프레스 자료) + 작품별 자료.
 * 작품별 줄에는 버튼만 둔다 — 그 작품에 연결된 프레스 자료(버튼 이름 = 자료 제목, 예: EN / KR, 정렬 순서대로)
 * + 마지막에 STORE PAGE(Steam 주소 또는 스토어 섹션의 첫 링크).
 * FHD 화면에서 스튜디오 자료와 작품별 자료가 한 화면에 들어오도록 여백을 줄였다.
 */
export default async function PressPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, tp, kits, games, s, sections] = await Promise.all([
    getTranslations('Press'),
    getTranslations('Pages'),
    getPressKits(),
    getGames(),
    getSettings(['contact_email']),
    getAllGameSectionRows(),
  ]);
  const email = getLocalizedSettingValue(s.contact_email, locale);
  const gameIds = new Set(games.map((g) => g.id));
  const studioKits = kits.filter((k) => !k.game_id || !gameIds.has(k.game_id));
  const byGame = games.map((g) => {
    const card = toCard(g, locale);
    const store = toDetail(
      g,
      sections.filter((r) => r.game_id === g.id),
      locale,
    ).stores[0];
    const links = kits
      .filter((k) => k.game_id === g.id)
      .map((k) => ({
        id: k.id,
        label: getLocalizedField(k, 'title', locale),
        url: safeUrl(k.file_url),
      }))
      .filter((k): k is { id: string; label: string; url: string } => !!k.url);
    if (store) links.push({ id: 'store', label: t('games.store'), url: store.url });
    return { game: g, card, links };
  });
  const listed = byGame.filter((x) => x.links.length > 0);

  const StudioKit = ({ kit }: { kit: PressKit }) => {
    const title = getLocalizedField(kit, 'title', locale);
    const desc = getLocalizedField(kit, 'description', locale) || t('list.fallbackDesc');
    const url = safeUrl(kit.file_url);
    return (
      <li className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-ink/15 py-5">
        <div className="min-w-0 flex-1">
          <h3 className="break-keep font-display text-[clamp(19px,1.8vw,24px)] font-extrabold leading-snug">{title}</h3>
          <p className="mt-1 break-keep font-serif text-[15px] leading-7 text-ink-2">{desc}</p>
        </div>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost" data-testid="press-open">
            {t('list.open')}
            <ArrowUpRightIcon />
            <span className="sr-only">
              : {title} ({tp('external')})
            </span>
          </a>
        ) : (
          <span className="marker marker--outline">{t('list.pending')}</span>
        )}
      </li>
    );
  };

  return (
    <Shell locale={locale}>
      <PageHeader compact eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />

      {/* 스튜디오 공통 자료 */}
      <section aria-labelledby="kits-title" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-6 px-5 py-10 md:grid-cols-12 md:gap-12 md:px-10 md:py-12">
          <div className="md:col-span-4">
            <p className="t-eyebrow">{t('list.eyebrow')}</p>
            <h2 id="kits-title" className="t-display mt-3 text-[clamp(24px,2.6vw,34px)]">
              {t('list.title')}
            </h2>
            <p className="mt-3 break-keep font-serif text-[15px] leading-7 text-ink-2">{t('list.contact')}</p>
            {email && (
              <a href={`mailto:${email}`} className="link-u mt-2 inline-flex min-h-[40px] items-center break-all font-mono text-[13px] font-bold">
                {email}
              </a>
            )}
          </div>
          <div className="md:col-span-8">
            {studioKits.length === 0 ? (
              <div className="border border-ink/40 bg-paper-3 p-6 md:p-8" data-testid="press-empty">
                <h3 className="t-display break-keep text-[clamp(20px,2.2vw,26px)]">{t('empty.title')}</h3>
                <p className="mt-2 max-w-md break-keep font-serif text-[15px] leading-7 text-ink-2">{t('empty.body')}</p>
              </div>
            ) : (
              <ul className="border-t border-ink" data-testid="press-list">
                {studioKits.map((kit) => (
                  <StudioKit key={kit.id} kit={kit} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 작품별 자료: 작품마다 버튼만(EN / KR / STORE PAGE) */}
      {listed.length > 0 && (
        <section aria-labelledby="games-press-title" className="border-t border-ink/15 bg-paper-2">
          <div className="mx-auto grid max-w-page gap-6 px-5 py-10 md:grid-cols-12 md:gap-12 md:px-10 md:py-12">
            <div className="md:col-span-4">
              <p className="t-eyebrow">{t('games.eyebrow')}</p>
              <h2 id="games-press-title" className="t-display mt-3 text-[clamp(24px,2.6vw,34px)]">
                {t('games.title')}
              </h2>
              <p className="mt-3 break-keep font-serif text-[15px] leading-7 text-ink-2">{t('games.lead')}</p>
            </div>
            <ul className="border-t border-ink md:col-span-8" data-testid="press-games">
              {listed.map(({ game, card, links }) => (
                <li
                  key={game.id}
                  id={`press-${game.slug}`}
                  className="flex scroll-mt-[calc(var(--header-h)+24px)] flex-wrap items-center gap-x-6 gap-y-3 border-b border-ink/15 py-4"
                >
                  <Link href={`/games/${game.slug}`} className="group flex min-w-0 flex-[1_1_15rem] items-center gap-4" aria-label={card.title}>
                    <span className="hidden h-12 w-[4.5rem] shrink-0 overflow-hidden border border-ink/20 bg-paper-3 sm:block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {card.wide && <img src={card.wide} alt="" loading="lazy" className="h-full w-full object-cover object-[50%_28%]" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block break-keep font-display text-[clamp(17px,1.6vw,21px)] font-extrabold leading-snug group-hover:underline">
                        {card.title}
                      </span>
                      <span className="block font-mono text-[11px] uppercase tracking-[.12em] text-ink-3">{card.series}</span>
                    </span>
                  </Link>
                  <span className="flex flex-wrap gap-2" data-testid="press-game-links">
                    {links.map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--ghost !min-h-[40px] !px-4 !text-[13px] font-mono uppercase tracking-[.08em]"
                      >
                        {l.label} <ArrowUpRightIcon />
                        <span className="sr-only">
                          : {card.title} ({tp('external')})
                        </span>
                      </a>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Shell>
  );
}
