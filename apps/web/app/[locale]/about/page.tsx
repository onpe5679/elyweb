import { getTranslations } from 'next-intl/server';
import { getLocalizedField, getTimelineEvents, getSetting, getSettings, getLocalizedSettingValue, getTeamMembers } from '@/lib/supabase';
import { Link } from '@/i18n/routing';

const DEFAULT_ABOUT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuH9zfscNU583mjOoxQHWwtrrxL_URj8Cn-XiQYYOWO8bL_cwElK-MXAWahlUtmzmPW6cc5MtnoE29qELOumVwb9xKsYn2_Z793_xKUJkd0g3lsf0vjq-bfcVaZksoNjdBUueHpyh4FtQ_O3OVsg0_C82cJ2CWkhZKUtWUay2m47G1RayxCQbbtPMHfj6w8-j9qkNUIa3wpaQNHiPg2Vvw5HAWHGsAYfZ-_5iOcsEeYvxeVJZl7vQ6Q2g02XZhZ_O8lRo2XIF-nd4';

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [t, tPage, timelineEvents, aboutImageSetting, teamMembers, siteSettings] = await Promise.all([
    getTranslations('Vision'),
    getTranslations('AboutPage'),
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

  const stats = [
    { label: tPage('statFounded'), value: '2022' },
    { label: tPage('statProjects'), value: '3+' },
    { label: tPage('statFunding'), value: fundingValue },
    { label: tPage('statReach'), value: tPage('reachValue') },
  ];

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-ink pb-16">
          <p className="eyebrow">{tPage('eyebrow')}</p>
          <h1 className="font-display mt-6 text-6xl leading-none text-ink md:text-8xl">Studio Elysian</h1>
        </header>

        <section
          aria-labelledby="about-vision-heading"
          className="grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:items-center lg:gap-16"
        >
          <figure className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden bg-paper-alt lg:aspect-[4/5]">
              <img alt="Studio Elysian" className="h-full w-full object-cover" src={aboutImage} />
            </div>
          </figure>

          <div className="lg:col-span-5 lg:col-start-8">
            <h2
              id="about-vision-heading"
              className="font-display text-balance text-4xl leading-[1.15] text-ink md:text-6xl"
            >
              {visionTitle}
            </h2>
            <div className="mt-10 space-y-6 text-base leading-loose text-ink-2 md:text-lg">
              {visionParagraphs ? (
                visionParagraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <>
                  <p>{t('p1')}</p>
                  <p>{t('p2')}</p>
                  <p>{t('p3')}</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="about-mission-heading" className="grid gap-6 border-t border-rule pt-14 md:grid-cols-12">
          <h2 id="about-mission-heading" className="eyebrow md:col-span-3">
            {t('missionTitle')}
          </h2>
          <p className="font-display text-2xl leading-relaxed text-ink md:col-span-8 md:col-start-5 md:text-3xl">
            {t('missionBody')}
          </p>
        </section>

        <dl className="mt-24 grid grid-cols-2 border-t border-ink md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-b border-rule py-8 md:border-b-0 md:border-r md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <dt className="eyebrow !text-ink-3">{stat.label}</dt>
              <dd className="font-display mt-4 text-4xl leading-none text-ink md:text-6xl">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {teamMembers.length > 0 && (
          <section aria-labelledby="about-team-heading" className="mt-28 border-t border-ink pt-14">
            <h2 id="about-team-heading" className="font-display text-4xl leading-tight text-ink md:text-5xl">
              {tPage('teamTitle')}
            </h2>
            <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <li key={member.id}>
                  <Link href={`/team/${member.slug}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden bg-paper-alt">
                      {member.profile_image ? (
                        <img
                          src={member.profile_image}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <i className="fa-solid fa-user text-6xl text-ink-3" aria-hidden="true"></i>
                        </div>
                      )}
                    </div>
                    <div className="mt-5 border-t border-rule pt-5">
                      <h3 className="font-display text-2xl leading-snug text-ink transition-colors group-hover:text-seal">
                        {getLocalizedField(member, 'name', locale)}
                      </h3>
                      {(member.role_ko || member.role_en) && (
                        <p className="mt-2 text-sm font-medium text-seal">
                          {getLocalizedField(member, 'role', locale)}
                        </p>
                      )}
                      {(member.bio_ko || member.bio_en) && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-2">
                          {getLocalizedField(member, 'bio', locale)}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="about-history-heading" className="mt-28 border-t border-ink pt-14">
          <h2 id="about-history-heading" className="font-display text-4xl leading-tight text-ink md:text-5xl">
            {tPage('historyTitle')}
          </h2>
          {timelineEvents.length > 0 ? (
            <ol className="mt-14">
              {timelineEvents.map((event) => (
                <li
                  key={event.id}
                  className="grid grid-cols-[6.5rem_1fr] gap-6 border-b border-rule py-7 md:grid-cols-[8rem_1fr] md:py-9"
                >
                  <time className="font-display text-2xl tabular-nums text-seal md:text-3xl">{event.date}</time>
                  <div>
                    <h3 className="font-display text-xl leading-snug text-ink md:text-2xl">
                      {getLocalizedField(event, 'title', locale)}
                    </h3>
                    {event.description && (
                      <p className="mt-3 text-base leading-relaxed text-ink-2">{event.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-14 text-ink-3">{tPage('noHistory')}</p>
          )}
        </section>
      </div>
    </div>
  );
}
