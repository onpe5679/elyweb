import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocalizedField, type News } from '@/lib/supabase';
import { pad2 } from '@/lib/format';
import XTimeline from '@/components/news/XTimeline';
import SectionHead from './SectionHead';
import { ArrowUpRightIcon, XIcon } from './Icons';
import { fmtIso, stripTags } from './text';

type Props = {
  locale: string;
  items: News[];
  /** 위젯을 쓸 때의 X 계정(@ 없이). 없으면 위젯을 보이지 않는다. */
  handle: string;
  showWidget: boolean;
  showManual: boolean;
  /** 빈 화면에서 이어 줄 X 주소 */
  xUrl?: string;
};

/**
 * 새소식 본문: 수동 게시물 목록 + X 타임라인 + 빈 화면.
 * 위젯만 쓰면 [설명 5 | 위젯 7], 함께 쓰면 [목록 7 | 위젯 5], 목록만 쓰면 전체 폭.
 */
export default async function NewsView({ locale, items, handle, showWidget, showManual, xUrl }: Props) {
  const [t, tp] = await Promise.all([getTranslations('News'), getTranslations('Pages')]);
  const hasPosts = showManual && items.length > 0;
  const isEmpty = !showWidget && !hasPosts;

  const posts = (
    <ol className="border-t border-ink" data-testid="news-list">
      {items.map((item, i) => {
        const title = getLocalizedField(item, 'title', locale);
        const body = stripTags(getLocalizedField(item, 'content', locale));
        const iso = (item.published_at || item.created_at || '').slice(0, 10);
        const date = fmtIso(iso, locale);
        return (
          <li key={item.id} className="border-b border-ink/15">
            <Link
              href={`/news/${item.slug}`}
              className="group grid gap-x-8 gap-y-4 py-8 sm:grid-cols-[7.5rem_minmax(0,1fr)] md:py-10 lg:grid-cols-[7.5rem_minmax(0,1fr)_11rem]"
            >
              <p className="font-mono text-[13px] leading-7 text-accent-text">
                <span aria-hidden className="mr-2 text-ink-3">{pad2(i + 1)}</span>
                {date && <time dateTime={iso}>{date}</time>}
              </p>
              <div className="min-w-0">
                <h3 className="break-keep font-display text-[clamp(22px,2.3vw,30px)] font-extrabold leading-snug underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors group-hover:decoration-accent-text">
                  {title}
                </h3>
                {body && <p className="mt-3 line-clamp-2 break-keep font-serif text-[16px] leading-8 text-ink-2">{body}</p>}
                <p className="mt-4 text-[14px] font-bold text-ink">{t('list.more')} →</p>
              </div>
              {item.cover_image && (
                <div className="plate hidden self-start lg:block">
                  <div className="aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.cover_image} alt="" loading="lazy" className="plate__img zoom-img" />
                  </div>
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  // 소식이 아직 없을 때: 의도된 빈 화면(원고지 모눈 위의 한 장짜리 안내)
  const empty = (
    <div className="relative isolate overflow-hidden border border-ink/60 bg-paper-3" data-testid="news-empty">
      <div aria-hidden className="ruled absolute inset-0 -z-10 opacity-40" />
      <div className="p-8 md:p-12">
        <p className="font-mono text-[12px] uppercase tracking-[.14em] text-ink-3">No.00 / 00</p>
        <h2 className="t-display mt-4 break-keep text-[clamp(26px,3.2vw,40px)]">{t('empty.title')}</h2>
        <p className="mt-4 max-w-md break-keep font-serif text-[16px] leading-8 text-ink-2">{t('empty.body')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/games" className="btn">{t('empty.works')}</Link>
          {xUrl && (
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              <XIcon className="h-4 w-4" />
              {t('empty.x')}
              <ArrowUpRightIcon />
              <span className="sr-only">{tp('external')}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section aria-labelledby={showWidget ? 'feed-title' : 'list-title'} className="border-t border-ink/15">
      <div className="mx-auto grid max-w-page gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
        {isEmpty ? (
          <div className="md:col-span-12">
            <h2 id="list-title" className="sr-only">{t('list.title')}</h2>
            {empty}
          </div>
        ) : (
          <>
            {showManual && (
              <div className={showWidget ? 'md:col-span-7' : 'md:col-span-12'}>
                <div className="mb-8">
                  <p className="t-eyebrow">{t('list.eyebrow')}</p>
                  <h2 id="list-title" className="t-display mt-4 text-[clamp(26px,3.4vw,42px)]">{t('list.title')}</h2>
                </div>
                {hasPosts ? posts : empty}
              </div>
            )}

            {showWidget && (
              <>
                {!showManual && (
                  <SectionHead id="feed-title" eyebrow={t('feed.eyebrow')} title={t('feed.title')} sticky span={5}>
                    <p>{t('feed.body')}</p>
                    <a
                      href={`https://x.com/${handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-u mt-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-[13px] font-bold text-ink"
                    >
                      <span className="sr-only">{t('feed.account')}: </span>@{handle}
                      <ArrowUpRightIcon />
                      <span className="sr-only">{tp('external')}</span>
                    </a>
                  </SectionHead>
                )}
                <div className={showManual ? 'md:sticky md:top-[calc(var(--header-h)+32px)] md:col-span-5 md:self-start' : 'md:col-span-7'}>
                  {showManual && <h2 id="feed-title" className="t-eyebrow mb-4">{t('feed.eyebrow')} · @{handle}</h2>}
                  <XTimeline handle={handle} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
