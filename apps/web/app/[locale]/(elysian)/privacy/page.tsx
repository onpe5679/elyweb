import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/elysian/PageHeader';
import { getLocalizedSettingValue, getSetting } from '@/lib/supabase';

export const revalidate = 10;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Privacy');
  return { title: t('title') };
}

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  const [t, ts, setting] = await Promise.all([getTranslations('Privacy'), getTranslations('Site'), getSetting('privacy_policy')]);
  const body = getLocalizedSettingValue(setting, locale);
  // The policy is only published in Korean; mark the language so it is read correctly.
  const bodyLang = setting?.[`value_${locale}` as 'value_ko'] ? locale : 'ko';

  return (
    <>
      <PageHeader kicker={ts('studioName')} title={t('title')} />
      <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        {body ? (
          <div lang={bodyLang} className="whitespace-pre-line text-[0.9375rem] leading-[1.9] text-ink-soft">{body}</div>
        ) : (
          <p className="text-ink-soft">{t('empty')}</p>
        )}
      </div>
    </>
  );
}
