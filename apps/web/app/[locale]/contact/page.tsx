import { getTranslations } from 'next-intl/server';
import { getSettings, getLocalizedSettingValue } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact/ContactForm';

export default async function ContactPage() {
  const t = await getTranslations('Footer');
  const locale = await getLocale();
  
  const settings = await getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url']);
  const contactEmail = getLocalizedSettingValue(settings.contact_email, locale) || 'contact@studioelysian.com';
  const twitterUrl = getLocalizedSettingValue(settings.twitter_url, locale) || 'https://twitter.com/studioelysian';
  const youtubeUrl = getLocalizedSettingValue(settings.youtube_url, locale) || 'https://youtube.com/@studioelysian';
  const instagramUrl = getLocalizedSettingValue(settings.instagram_url, locale) || 'https://instagram.com/studioelysian';

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            Get in Touch
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white">
            {t('contact')}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
            <ContactForm inquiryLabel={t('contactLinks.inquiry')} />
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-envelope text-primary"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                    <div className="text-gray-900 dark:text-white">{contactEmail}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                >
                  <i className="fa-brands fa-twitter text-xl"></i>
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                >
                  <i className="fa-brands fa-youtube text-xl"></i>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                >
                  <i className="fa-brands fa-instagram text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
