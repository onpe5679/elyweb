import { getPressKits, getLocalizedField, getSettings, getLocalizedSettingValue, PressKit } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';

export default async function PressPage() {
  const locale = await getLocale();
  const pressKits = await getPressKits();
  const settings = await getSettings(['press_email']);
  const pressEmail = getLocalizedSettingValue(settings.press_email, locale) || 'press@studioelysian.com';

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            Media Resources
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white">
            Press Kit
          </h1>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            About Studio Elysian
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Studio Elysian is a Korean game development studio founded in 2022, specializing in 
            story-driven visual novels that combine video, comics, illustrations, and music. 
            Our team brings together talented individuals from various creative fields to deliver 
            immersive narrative experiences.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Founded</div>
              <div className="font-bold text-gray-900 dark:text-white">2022</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Location</div>
              <div className="font-bold text-gray-900 dark:text-white">South Korea</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Genre</div>
              <div className="font-bold text-gray-900 dark:text-white">Visual Novels</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Contact</div>
              <div className="font-bold text-gray-900 dark:text-white">{pressEmail}</div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Download Press Kits
        </h2>

        {pressKits.length === 0 ? (
          <div className="bg-white dark:bg-surface-dark rounded-xl p-8 text-center border border-gray-100 dark:border-gray-800">
            <i className="fa-solid fa-folder-open text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">
              No press kits available yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pressKits.map((kit: PressKit) => (
              <a
                key={kit.id}
                href={kit.file_url || '#'}
                target={kit.file_url ? '_blank' : undefined}
                rel={kit.file_url ? 'noopener noreferrer' : undefined}
                className={`block bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors ${
                  !kit.file_url ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {getLocalizedField(kit, 'title', locale)}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {getLocalizedField(kit, 'description', locale) || 'Download press materials'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${kit.file_url ? 'fa-download' : 'fa-clock'} text-primary`}></i>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
