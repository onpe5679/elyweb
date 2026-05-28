import Hero from '@/components/sections/Hero';
import VisionSection from '@/components/sections/VisionSection';
import StatsBar from '@/components/sections/StatsBar';
import ProjectsSection from '@/components/sections/ProjectsSection';
import TimelineSection from '@/components/sections/TimelineSection';
import { getGames, getFeaturedGame, getHomeTimelineEvents, getSettings, getLocalizedSettingValue, Game } from '@/lib/supabase';

export const revalidate = 10;

export default async function HomePage({ params }: { params: { locale: string } }) {
  const [games, featuredGame, timelineEvents, siteSettings] = await Promise.all([
    getGames(),
    getFeaturedGame(),
    getHomeTimelineEvents(),
    getSettings([
      'hero_image', 'vision_image', 'hero_title', 'hero_description',
      'vision_title', 'vision_description',
      'stat_year_value', 'stat_year_label',
      'stat_projects_value', 'stat_projects_label',
      'stat_released_value', 'stat_released_label',
      'stat_global_value', 'stat_global_label',
    ]),
  ]);

  const nonFeaturedGames = games.filter((g: Game) => !g.is_featured);
  const heroImage = siteSettings.hero_image?.value_ko || undefined;
  const visionImage = siteSettings.vision_image?.value_ko || undefined;
  const heroTitle = getLocalizedSettingValue(siteSettings.hero_title, params.locale);
  const heroDescription = getLocalizedSettingValue(siteSettings.hero_description, params.locale);
  const sv = (key: string) => getLocalizedSettingValue(siteSettings[key], params.locale) || undefined;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Hero heroImage={heroImage} heroTitle={heroTitle} heroDescription={heroDescription} />
      <VisionSection visionImage={visionImage} visionTitle={sv('vision_title')} visionBody={sv('vision_description')} />
      <StatsBar
        yearValue={sv('stat_year_value')}
        yearLabel={sv('stat_year_label')}
        projectsValue={sv('stat_projects_value')}
        projectsLabel={sv('stat_projects_label')}
        releasedValue={sv('stat_released_value')}
        releasedLabel={sv('stat_released_label')}
        globalValue={sv('stat_global_value')}
        globalLabel={sv('stat_global_label')}
      />
      <ProjectsSection games={nonFeaturedGames} featuredGame={featuredGame} locale={params.locale} />
      <TimelineSection events={timelineEvents} locale={params.locale} />
    </div>
  );
}
