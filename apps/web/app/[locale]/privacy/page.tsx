import { getSetting, getLocalizedSettingValue } from '@/lib/supabase';

export const revalidate = 10;

export default async function PrivacyPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const setting = await getSetting('privacy_policy');
  const body = getLocalizedSettingValue(setting, locale);

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-10">
          개인정보처리방침
        </h1>
        {body ? (
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {body}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            개인정보처리방침이 아직 등록되지 않았습니다.
          </p>
        )}
      </div>
    </div>
  );
}
