import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { GameCardModel } from '@/lib/game-model';
import { HabomWordmark } from '@/components/shell/Logo';

/**
 * 엘리시안 → 하봄 관문. 이 구역만 하봄 토큰([data-brand="habom"])을 입어
 * 두 브랜드의 분위기가 한 화면에서 분리되어 보인다.
 */
export default async function HabomPortal({ game }: { game?: GameCardModel }) {
  const t = await getTranslations('Home');
  return (
    <section aria-labelledby="habom-title" className="border-t border-ink/15">
      <div className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-28">
        <div data-brand="habom" className="relative overflow-hidden rounded-[40px] bg-paper-2 px-6 py-12 ring-2 ring-ink md:px-14 md:py-16">
          <span aria-hidden className="blob bob left-[-60px] top-[-60px] h-56 w-56 bg-sub opacity-70 [--r:0deg]" />
          <span aria-hidden className="blob bob bottom-[-80px] right-[28%] h-64 w-64 bg-accent opacity-40 [--d:1.2s]" />
          <div className="relative grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <span className="sticker text-[15px] [--r:-3deg]">{t('habom.badge')}</span>
              <h2 id="habom-title" className="mt-6"><HabomWordmark className="!text-[44px] md:!text-[60px]" /></h2>
              <p className="mt-6 max-w-md break-keep text-[17px] leading-8 text-ink-2">{t('habom.body')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/habom" className="btn btn--accent">{t('habom.cta')}</Link>
                {game && <Link href={`/games/${game.slug}?play=1`} className="btn btn--ghost">{t('habom.play')}</Link>}
              </div>
            </div>
            {game && (
              <Link href={`/games/${game.slug}`} className="group md:col-span-6" aria-label={game.title}>
                <div className="plate rotate-[1.6deg] transition-transform duration-500 group-hover:rotate-0">
                  <div className="aspect-[16/10] overflow-hidden rounded-[22px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={game.wide} alt="" loading="lazy" className="plate__img zoom-img" />
                  </div>
                </div>
                <p className="mt-6 text-center font-display text-[22px]">{game.title}</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
