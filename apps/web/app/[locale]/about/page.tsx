import { getTranslations } from 'next-intl/server';
import { getLocalizedField, getTimelineEvents, getSetting, getSettings, getLocalizedSettingValue, getTeamMembers } from '@/lib/supabase';
import Link from 'next/link';

const DEFAULT_ABOUT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuH9zfscNU583mjOoxQHWwtrrxL_URj8Cn-XiQYYOWO8bL_cwElK-MXAWahlUtmzmPW6cc5MtnoE29qELOumVwb9xKsYn2_Z793_xKUJkd0g3lsf0vjq-bfcVaZksoNjdBUueHpyh4FtQ_O3OVsg0_C82cJ2CWkhZKUtWUay2m47G1RayxCQbbtPMHfj6w8-j9qkNUIa3wpaQNHiPg2Vvw5HAWHGsAYfZ-_5iOcsEeYvxeVJZl7vQ6Q2g02XZhZ_O8lRo2XIF-nd4';

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [t, tCommon, timelineEvents, aboutImageSetting, teamMembers, siteSettings] = await Promise.all([
    getTranslations('Vision'),
    getTranslations('Common'),
    getTimelineEvents(),
    getSetting('about_image'),
    getTeamMembers(),
    getSettings(['vision_title', 'vision_description', 'funding_percentage']),
  ]);

  const aboutImage = aboutImageSetting?.value_ko || DEFAULT_ABOUT_IMAGE;
  const visionTitle = getLocalizedSettingValue(siteSettings.vision_title, locale) || t('title');
  const visionBody = getLocalizedSettingValue(siteSettings.vision_description, locale);
  const visionParagraphs = visionBody
    ? visionBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : null;
  const fundingValue = getLocalizedSettingValue(siteSettings.funding_percentage, locale) || '1347%';

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            About Us
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white">
            Studio Elysian
          </h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-12">
            <img
              alt="Studio Elysian"
              className="w-full h-64 md:h-96 object-cover"
              src={aboutImage}
            />
          </div>

          <h2 className="text-primary">{visionTitle}</h2>
          {visionParagraphs ? (
            visionParagraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <>
              <p>{t('p1')}</p>
              <p>{t('p2')}</p>
              <p>{t('p3')}</p>
            </>
          )}

          <h2 className="text-primary mt-12">Our Mission</h2>
          <p>
            We believe in the power of stories. Through our visual novels and interactive experiences,
            we aim to create emotional connections that transcend language and cultural barriers.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12 not-prose">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">2022</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Founded</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">3+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Projects</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">{fundingValue}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Funding</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">Global</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Reach</div>
            </div>
          </div>

          {/* Team Section */}
          {teamMembers.length > 0 && (
            <div className="mt-16 not-prose">
              <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                Our Team
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/${locale}/team/${member.slug}`}
                    className="group bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {member.profile_image ? (
                        <img
                          src={member.profile_image}
                          alt={getLocalizedField(member, 'name', locale)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-user text-6xl text-gray-300 dark:text-gray-600"></i>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {getLocalizedField(member, 'name', locale)}
                      </h3>
                      {(member.role_ko || member.role_en) && (
                        <p className="text-sm text-primary font-medium mt-1">
                          {getLocalizedField(member, 'role', locale)}
                        </p>
                      )}
                      {(member.bio_ko || member.bio_en) && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {getLocalizedField(member, 'bio', locale)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* History Section */}
          <div className="mt-16 not-prose">
            <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
              History
            </h2>
            <div className="relative border-l-2 border-primary/20 ml-3 space-y-12 pb-12">
              {timelineEvents.length > 0 ? (
                timelineEvents.map((event) => (
                  <div key={event.id} className="relative pl-8">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background-light dark:border-background-dark"></span>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                      <span className="font-bold text-primary font-display text-xl">{event.date}</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {getLocalizedField(event, 'title', locale)}
                      </h3>
                    </div>
                    {event.description && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="pl-8 text-gray-500 italic">
                  No history events available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
