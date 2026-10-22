import { getTranslations } from 'next-intl/server';
import { getSetting, getLocalizedSettingValue } from '@/lib/supabase';

export const revalidate = 10;

export default async function PrivacyPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('PrivacyPage');
  const tFooter = await getTranslations('Footer');
  const setting = await getSetting('privacy_policy');
  const body = getLocalizedSettingValue(setting, locale);

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-ink pb-12">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 className="font-display mt-6 text-4xl leading-none text-ink md:text-6xl">{tFooter('privacy')}</h1>
        </header>

        {body ? (
          <div className="mt-14 whitespace-pre-line text-base leading-loose text-ink-2 md:text-lg">{body}</div>
        ) : (
          <p className="mt-14 text-ink-3">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
