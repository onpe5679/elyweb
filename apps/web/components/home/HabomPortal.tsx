import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { GameCardModel } from '@/lib/game-model';

/**
 * 엘리시안 → 하봄 관문. 하봄 화면(시안 C)과 같은 팔레트·서체를 써서
 * "엘리시안 아래의 하봄"이 한 화면에서 분리되어 보이게 한다.
 */
export default async function HabomPortal({ game }: { game?: GameCardModel }) {
  const t = await getTranslations('Home');
  return (
    <section aria-labelledby="habom-title" className="border-t border-ink/15">
      <div className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-28">
        <div className="manuscript-grid--habom relative overflow-hidden rounded-[36px] bg-cream px-6 py-12 text-plum ring-1 ring-blush md:px-14 md:py-16">
          <span aria-hidden className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush" />
          <span aria-hidden className="absolute -bottom-28 right-[34%] h-60 w-60 rounded-full bg-butter-soft/80" />
          <div className="relative grid items-center gap-10 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-5">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-plum-soft ring-1 ring-blush">
                <span aria-hidden className="h-2 w-2 rounded-full bg-rose" /> {t('habom.badge')}
              </p>
              <h2 id="habom-title" className="mt-6 font-round text-[3rem] leading-none md:text-[4rem]">{t('habom.title')}</h2>
              <p className="mt-2 font-round-latin text-xl font-extrabold text-rose">habom studio</p>
              <p className="mt-6 max-w-md whitespace-pre-line break-keep text-[17px] leading-8 text-plum-soft">{t('habom.body')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/habom" className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-rose px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(201,65,109,.8)] transition-transform hover:-translate-y-0.5">
                  {t('habom.cta')} <span aria-hidden>→</span>
                </Link>
                {game && (
                  <Link href={`/games/${game.slug}#demo`} className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-butter px-6 text-[15px] font-semibold text-plum transition-transform hover:-translate-y-0.5">
                    {t('habom.play')}
                  </Link>
                )}
              </div>
            </div>
            {game && (
              <Link href={`/games/${game.slug}`} className="group relative md:col-span-7" aria-label={game.title}>
                <span className="block overflow-hidden rounded-[28px] bg-blush shadow-[0_40px_80px_-40px_rgba(74,43,56,.45)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={game.wide} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                </span>
                <span aria-hidden className="absolute -left-3 bottom-8 hidden rounded-[20px] rounded-bl-[6px] bg-white px-5 py-3 font-round text-xl text-plum shadow-lg md:block">
                  {game.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
