import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocalizedField, getLocalizedSettingValue, getPressKits, getSettings } from '@/lib/supabase';
import { pad2 } from '@/lib/format';
import Shell from '@/components/shell/Shell';
import PageHeader from '@/components/pages/PageHeader';
import SectionHead from '@/components/pages/SectionHead';
import { ArrowUpRightIcon } from '@/components/pages/Icons';
import { safeUrl } from '@/components/pages/text';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'Press' });
  return { title: tm('metaTitle') };
}

export default async function PressPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, tp, kits, s] = await Promise.all([
    getTranslations('Press'),
    getTranslations('Pages'),
    getPressKits(),
    getSettings(['contact_email']),
  ]);
  const email = getLocalizedSettingValue(s.contact_email, locale);

  return (
    <Shell locale={locale}>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />

      <section aria-labelledby="kits-title" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          <SectionHead id="kits-title" eyebrow={t('list.eyebrow')} title={t('list.title')} sticky>
            <p>{t('list.contact')}</p>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] font-bold">
              <Link href="/contact" className="link-u inline-flex min-h-[44px] items-center">{t('empty.cta')} →</Link>
              {email && (
                <a href={`mailto:${email}`} className="link-u inline-flex min-h-[44px] items-center break-all font-mono text-[13px]">{email}</a>
              )}
            </p>
          </SectionHead>

          <div className="md:col-span-8">
            {kits.length === 0 ? (
              <div className="relative isolate overflow-hidden border border-ink/60 bg-paper-3" data-testid="press-empty">
                <div aria-hidden className="ruled absolute inset-0 -z-10 opacity-40" />
                <div className="p-8 md:p-12">
                  <p className="font-mono text-[12px] uppercase tracking-[.14em] text-ink-3">No.00 / 00</p>
                  <h3 className="t-display mt-4 break-keep text-[clamp(24px,3vw,36px)]">{t('empty.title')}</h3>
                  <p className="mt-4 max-w-md break-keep font-serif text-[16px] leading-8 text-ink-2">{t('empty.body')}</p>
                  <Link href="/contact" className="btn mt-8">{t('empty.cta')}</Link>
                </div>
              </div>
            ) : (
              <ol className="border-t border-ink" data-testid="press-list">
                {kits.map((kit, i) => {
                  const title = getLocalizedField(kit, 'title', locale);
                  const desc = getLocalizedField(kit, 'description', locale) || t('list.fallbackDesc');
                  const url = safeUrl(kit.file_url);
                  return (
                    <li key={kit.id} className="grid items-start gap-x-8 gap-y-5 border-b border-ink/15 py-8 sm:grid-cols-[3.5rem_minmax(0,1fr)] md:py-10 lg:grid-cols-[3.5rem_minmax(0,1fr)_auto]">
                      <p aria-hidden className="font-mono text-[13px] leading-7 text-ink-3">No.{pad2(i + 1)}</p>
                      <div className="min-w-0">
                        <h3 className="break-keep font-display text-[clamp(22px,2.3vw,30px)] font-extrabold leading-snug">{title}</h3>
                        <p className="mt-2 break-keep font-serif text-[16px] leading-8 text-ink-2">{desc}</p>
                      </div>
                      <div className="sm:col-start-2 lg:col-start-auto">
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost" data-testid="press-open">
                            {t('list.open')}
                            <ArrowUpRightIcon />
                            <span className="sr-only">: {title} ({tp('external')})</span>
                          </a>
                        ) : (
                          <span className="marker marker--outline">{t('list.pending')}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
