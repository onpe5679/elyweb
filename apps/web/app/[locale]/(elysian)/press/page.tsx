import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import PageHeader from '@/components/elysian/PageHeader';
import Icon from '@/components/ui/Icon';
import { getLocalizedField, getPressKits, type PressKit } from '@/lib/supabase';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Press' });
  return { title: t('title') };
}

// Placeholder URLs (e.g. example.com) are treated as "in preparation" rather than linked.
function isRealUrl(url?: string) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return !/(^|\.)example\.(com|org|net)$/.test(host);
  } catch {
    return false;
  }
}

export default async function PressPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, ts, kits] = await Promise.all([getTranslations('Press'), getTranslations('Site'), getPressKits()]);

  return (
    <>
      <PageHeader kicker={ts('studioName')} title={t('title')} latin={t('latin')} lead={t('lead')} />
      <div className="mx-auto max-w-page px-5 py-16 md:px-10 md:py-24">
        {kits.length === 0 ? (
          <p className="border border-ink/20 p-10 text-center text-ink-soft">{t('empty')}</p>
        ) : (
          <ol className="border-t border-ink">
            {kits.map((kit: PressKit, i) => {
              const available = isRealUrl(kit.file_url);
              const body = (
                <>
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="block font-serif text-xl font-semibold md:text-2xl">{getLocalizedField(kit, 'title', locale)}</span>
                    <span className="mt-1 block text-[0.9375rem] text-ink-soft">{getLocalizedField(kit, 'description', locale)}</span>
                  </span>
                  <span className={`flex items-center gap-2 justify-self-start text-[0.875rem] md:justify-self-end ${available ? '' : 'text-ink-mute'}`}>
                    {available ? (<><span className="link-underline">{t('download')}</span><Icon name="arrowUpRight" size={16} /></>) : (<span className="label">{t('preparing')}</span>)}
                  </span>
                </>
              );
              const cls = 'grid items-center gap-4 py-7 md:grid-cols-[3rem_1fr_auto] md:gap-8';
              return (
                <li key={kit.id} className="border-b border-ink/20">
                  {available ? (
                    <a href={kit.file_url} target="_blank" rel="noopener noreferrer" className={`group ${cls}`}>{body}</a>
                  ) : (
                    <div className={cls} aria-disabled="true">{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-12 text-[0.9375rem] text-ink-soft">
          <Link href="/contact" className="link-underline inline-flex items-center gap-2">{t('contact')} <Icon name="arrowRight" size={14} /></Link>
        </p>
      </div>
    </>
  );
}
