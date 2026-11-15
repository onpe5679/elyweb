import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

/**
 * 작품 목록 맨 아래: 하봄 전용 웹사이트로 가는 안내.
 * 작품 정보는 엘리시안에서 모두 보여 주고, 하봄이 더 궁금한 사람만 하봄 화면으로 넘어가게 한다.
 */
export default async function HabomSiteBanner() {
  const t = await getTranslations('Works');
  return (
    <aside aria-labelledby="habom-site-title" className="mt-6 border-t border-ink/20 pt-16 md:pt-20">
      <div className="manuscript-grid--habom relative overflow-hidden rounded-[32px] bg-cream px-6 py-10 text-plum ring-1 ring-blush md:px-12 md:py-12">
        <span aria-hidden className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blush" />
        <span aria-hidden className="absolute -bottom-20 right-[22%] h-40 w-40 rounded-full bg-butter-soft" />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <span aria-hidden className="relative inline-block h-14 w-14 shrink-0">
              <span className="absolute inset-0 rounded-full bg-petal" />
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-butter ring-[3px] ring-cream" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-plum-soft">{t('habom.badge')}</p>
              <h2 id="habom-site-title" className="mt-1 font-round text-[2rem] leading-tight md:text-[2.5rem]">{t('habom.title')}</h2>
              <p className="mt-3 max-w-xl whitespace-pre-line break-keep text-[16px] leading-7 text-plum-soft">{t('habom.body')}</p>
            </div>
          </div>
          <Link
            href="/habom"
            data-testid="habom-site-link"
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-rose px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(201,65,109,.8)] transition-transform hover:-translate-y-0.5"
          >
            {t('habom.cta')} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
