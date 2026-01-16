import Hero from '@/components/sections/Hero';
import VisionSection from '@/components/sections/VisionSection';
import StatsBar from '@/components/sections/StatsBar';
import ProjectsSection from '@/components/sections/ProjectsSection';
import TimelineSection from '@/components/sections/TimelineSection';
import { getGames, getFeaturedGame, getTimelineEvents, getSettings, getLocalizedSettingValue, Game } from '@/lib/supabase';

export const revalidate = 10;

export default async function HomePage({ params }: { params: { locale: string } }) {
  const [games, featuredGame, timelineEvents, siteSettings] = await Promise.all([
    getGames(),
    getFeaturedGame(),
    getTimelineEvents(),
    getSettings(['hero_image', 'vision_image', 'hero_title', 'hero_description']),
  ]);

  const nonFeaturedGames = games.filter((g: Game) => !g.is_featured);
  const heroImage = siteSettings.hero_image?.value_ko || undefined;
  const visionImage = siteSettings.vision_image?.value_ko || undefined;
  const heroTitle = getLocalizedSettingValue(siteSettings.hero_title, params.locale);
  const heroDescription = getLocalizedSettingValue(siteSettings.hero_description, params.locale);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Hero heroImage={heroImage} heroTitle={heroTitle} heroDescription={heroDescription} />
      <VisionSection visionImage={visionImage} />
      <StatsBar />
      <ProjectsSection games={nonFeaturedGames} featuredGame={featuredGame} locale={params.locale} />
      <TimelineSection events={timelineEvents} locale={params.locale} />
    </div>
  );
}
