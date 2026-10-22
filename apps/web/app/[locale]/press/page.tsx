import { getPressKits, getLocalizedField, PressKit } from '@/lib/supabase';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function PressPage() {
  const locale = await getLocale();
  const t = await getTranslations('PressPage');
  const pressKits = await getPressKits();

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-ink pb-16">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 className="font-display mt-6 text-6xl leading-none text-ink md:text-8xl">{t('title')}</h1>
        </header>

        <section aria-labelledby="press-kits-heading" className="mt-20 grid gap-12 md:grid-cols-12">
          <h2 id="press-kits-heading" className="font-display text-3xl leading-tight text-ink md:col-span-4 md:text-4xl">
            {t('listTitle')}
          </h2>

          <div className="md:col-span-7 md:col-start-6">
            {pressKits.length === 0 ? (
              <div className="border-t border-ink py-16 text-center">
                <i className="fa-solid fa-folder-open text-4xl text-ink-3" aria-hidden="true"></i>
                <p className="mt-6 text-ink-3">{t('empty')}</p>
              </div>
            ) : (
              <ul className="border-t border-ink">
                {pressKits.map((kit: PressKit) => {
                  const available = !!kit.file_url;
                  return (
                    <li key={kit.id} className="border-b border-rule">
                      <a
                        href={kit.file_url || '#'}
                        target={kit.file_url ? '_blank' : undefined}
                        rel={kit.file_url ? 'noopener noreferrer' : undefined}
                        aria-disabled={available ? undefined : true}
                        className={[
                          'group flex items-center justify-between gap-6 py-8 transition-colors',
                          available ? '' : 'cursor-not-allowed opacity-60',
                        ].join(' ')}
                      >
                        <div className="min-w-0">
                          {!available && <p className="eyebrow mb-3 !text-ink-3">{t('preparing')}</p>}
                          <h3 className="font-display text-2xl leading-snug text-ink transition-colors group-hover:text-seal">
                            {getLocalizedField(kit, 'title', locale)}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink-2">
                            {getLocalizedField(kit, 'description', locale) || t('fallbackDescription')}
                          </p>
                        </div>
                        <span className="flex h-12 w-12 flex-none items-center justify-center border border-ink text-ink transition-colors group-hover:bg-ink group-hover:text-paper">
                          <i className={`fa-solid ${available ? 'fa-download' : 'fa-clock'}`} aria-hidden="true"></i>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
