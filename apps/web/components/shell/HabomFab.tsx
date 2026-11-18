import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

/**
 * 엘리시안 화면 오른쪽 아래에 늘 떠 있는 하봄 바로가기.
 * 하봄은 시안 C 팔레트(크림·로즈·버터·플럼)를 쓰므로 버튼도 그 색으로 둔다.
 */
export default async function HabomFab() {
  const t = await getTranslations('Common');
  return (
    <Link
      href="/habom"
      data-testid="habom-fab"
      aria-label={t('habomFabLabel')}
      className="habom-fab group inline-flex items-center gap-2 rounded-lg bg-white py-1.5 pl-1.5 pr-3 text-plum shadow-[0_10px_24px_-14px_rgba(74,43,56,.55)] ring-1 ring-plum/15 transition hover:-translate-y-0.5 hover:ring-rose sm:gap-2.5 sm:py-2 sm:pl-2 sm:pr-5"
    >
      <span aria-hidden className="relative inline-block h-7 w-7 shrink-0 sm:h-8 sm:w-8">
        <span className="absolute inset-0 rounded-md bg-petal" />
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-sm bg-butter ring-2 ring-white" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-round-latin text-[13px] font-extrabold tracking-[0.02em] sm:text-[14px]">habom<span className="hidden sm:inline"> studio</span></span>
        <span className="mt-1 hidden font-round text-[11px] text-plum-soft sm:block">{t('habomFabSub')}</span>
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="ml-0.5 hidden text-rose transition-transform group-hover:translate-x-0.5 sm:block">
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </Link>
  );
}
