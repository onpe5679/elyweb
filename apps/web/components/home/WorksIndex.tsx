import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { GameCardModel } from '@/lib/game-model';
import StatusMarker from '@/components/ui/StatusMarker';
import { pad2 } from '@/lib/format';

/** 홈의 작품 섹션: 이번 호(대표 작품) + 나머지 도판 색인. */
export default async function WorksIndex({ featured, others }: { featured?: GameCardModel; others: GameCardModel[] }) {
  const t = await getTranslations('Home');
  return (
    <section id="works" aria-labelledby="works-title" className="scroll-mt-24 border-t border-ink/15">
      <div className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-28">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow">{t('works.eyebrow')}</p>
            <h2 id="works-title" className="t-display mt-3 text-[clamp(30px,4.4vw,56px)]">{t('works.title')}</h2>
          </div>
          <Link href="/games" className="link-u text-[15px] font-bold">{t('works.all')} →</Link>
        </div>

        {featured && (
          <article className="group grid items-center gap-10 md:grid-cols-12 md:gap-14">
            <Link href={`/games/${featured.slug}`} className="md:col-span-5" aria-label={featured.title}>
              <div className="plate mx-auto max-w-[460px] rotate-[-1.2deg] transition-transform duration-700 ease-page group-hover:rotate-0">
                <div className="aspect-[4/5] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.tall} alt={featured.title} loading="lazy" className="plate__img zoom-img" />
                </div>
              </div>
            </Link>
            <div className="md:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="marker">{featured.series}</span>
                <StatusMarker status={featured.status} />
                <span className="t-eyebrow">{t('works.featured')}</span>
              </div>
              <h3 className="t-display mt-5 text-[clamp(34px,5.4vw,72px)]">
                <Link href={`/games/${featured.slug}`} className="link-u">{featured.title}</Link>
              </h3>
              <p className="t-prose mt-6 whitespace-pre-line break-keep">{featured.desc}</p>
              {featured.genres.length > 0 && (
                <p className="mt-6 font-mono text-[12px] uppercase tracking-[.14em] text-ink-3">{featured.genres.join(' · ')}</p>
              )}
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={`/games/${featured.slug}`} className="btn">{t('works.open')}</Link>
                <Link href="/games" className="btn btn--ghost">{t('works.all')}</Link>
              </div>
            </div>
          </article>
        )}

        {others.length > 0 && (
          <ul className="mt-24 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((g, i) => (
              <li key={g.slug} className={i % 2 === 1 ? 'lg:translate-y-12' : ''}>
                <Link href={`/games/${g.slug}`} className="group block" data-testid="home-work">
                  <div className="plate">
                    <div className="aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.wide} alt={g.title} loading="lazy" className="plate__img zoom-img object-[50%_28%]" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="font-mono text-[12px] text-ink-3">No.{pad2(i + 2)}</span>
                    <StatusMarker status={g.status} />
                  </div>
                  <h3 className="t-display mt-3 text-[26px]"><span className="link-u">{g.title}</span></h3>
                  <p className="mt-1 font-mono text-[12px] uppercase tracking-[.12em] text-ink-3">{g.series}</p>
                  <p className="mt-3 line-clamp-3 whitespace-pre-line break-keep font-serif text-[15px] leading-7 text-ink-2">{g.desc}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
