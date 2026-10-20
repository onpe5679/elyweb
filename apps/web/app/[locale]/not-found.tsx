import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('Site');
  return (
    <div className="theme-elysian paper-grain manuscript-grid flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center text-ink">
      <p aria-hidden="true" className="flex [--cell-size:4.5rem]">
        {['4', '0', '4'].map((c, i) => (
          <span key={i} className={`ms-cell font-semibold ${i === 1 ? 'ms-cell--accent' : ''}`}>{c}</span>
        ))}
      </p>
      <h1 className="mt-8 font-latin text-3xl italic">Page not found</h1>
      <Link href="/" className="mt-8 inline-flex min-h-[48px] items-center border border-ink px-6 hover:bg-ink hover:text-paper">
        {t('home')}
      </Link>
    </div>
  );
}
