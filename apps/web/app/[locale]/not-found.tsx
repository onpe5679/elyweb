import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Cells from '@/components/ui/Cells';
import Shell from '@/components/shell/Shell';
import CellTitle from '@/components/pages/CellTitle';

/**
 * 브랜드 404. notFound() 를 부르는 모든 페이지(/games/없는-slug, /team/없는-slug …)와
 * 정의되지 않은 주소([...rest])가 여기로 온다. 목차 형식의 메뉴로 다시 길을 찾게 한다.
 */
export default async function NotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const [t, tn] = await Promise.all([getTranslations('NotFound'), getTranslations('Nav')]);

  const menu = [
    { href: '/games', label: tn('works') },
    { href: '/about', label: tn('studio') },
    { href: '/news', label: tn('news') },
    { href: '/habom', label: tn('habom') },
    { href: '/contact', label: tn('contact') },
  ];

  return (
    <Shell locale={locale}>
      <div className="relative isolate overflow-hidden">
        <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-50" />
        <div className="mx-auto grid max-w-page gap-14 px-5 pb-24 pt-14 md:grid-cols-12 md:gap-12 md:px-10 md:pb-32 md:pt-20" data-testid="not-found">
          <div className="md:col-span-7">
            <p className="t-eyebrow">{t('eyebrow')}</p>
            <div aria-hidden className="mt-5">
              <Cells text="404" size="lg" filled />
            </div>
            <h1 aria-label={t('title')} className="mt-10">
              <CellTitle text={t('title')} size="sm" />
            </h1>
            <p className="t-prose mt-8 break-keep !text-[16px] !leading-8">{t('body')}</p>
            <Link href="/" className="btn mt-10">{t('home')}</Link>
          </div>

          <nav aria-label={t('menu')} className="md:col-span-4 md:col-start-9 md:pt-10">
            <p className="t-eyebrow mb-4">{t('menu')}</p>
            <ul className="title-menu border-t border-ink">
              {menu.map((m, i) => (
                <li key={m.href}>
                  <Link href={m.href} className="title-menu__item min-h-[56px] items-center">
                    <span className="font-mono text-[12px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-[22px] font-extrabold">{m.label}</span>
                    <span aria-hidden className="title-menu__dots" />
                    <span aria-hidden className="font-mono text-[13px]">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </Shell>
  );
}
