import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocalizedField, type News } from '@/lib/supabase';
import RichText from './RichText';
import { ArrowLeftIcon } from './Icons';
import { fmtIso } from './text';

/** 소식 상세: 제목(h1) + 표지 도판 + 본문(6:8 오프셋 열) + 목록으로 돌아가기. */
export default async function NewsArticle({ news, locale }: { news: News; locale: string }) {
  const t = await getTranslations('News');
  const title = getLocalizedField(news, 'title', locale);
  const content = getLocalizedField(news, 'content', locale);
  const iso = (news.published_at || news.created_at || '').slice(0, 10);
  const date = fmtIso(iso, locale);

  return (
    <article>
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto max-w-page px-5 pb-12 pt-10 md:px-10 md:pb-16 md:pt-14">
          <Link href="/news" className="link-u inline-flex min-h-[44px] items-center gap-2 text-[14px] font-bold">
            <ArrowLeftIcon />
            {t('detail.back')}
          </Link>
          <div className="mt-8 grid gap-6 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-9">
              {date && (
                <p className="t-eyebrow">
                  <span className="sr-only">{t('detail.published')}: </span>
                  <time dateTime={iso}>{date}</time>
                </p>
              )}
              <h1 className="t-display mt-4 break-keep text-[clamp(30px,4.6vw,60px)]">{title}</h1>
            </div>
          </div>
        </div>
      </header>

      {news.cover_image && (
        <div className="mx-auto max-w-page px-5 pb-14 md:px-10 md:pb-20">
          <div className="plate">
            <div className="aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={news.cover_image} alt="" className="plate__img" />
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-8 px-5 py-14 md:grid-cols-12 md:gap-12 md:px-10 md:py-20">
          <div className="md:col-span-8 md:col-start-3">
            <RichText html={content} />
            <div className="mt-16 border-t border-ink/15 pt-6">
              <Link href="/news" className="btn btn--ghost">
                <ArrowLeftIcon />
                {t('detail.back')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
