import Hero from '@/components/sections/Hero';
import VisionSection from '@/components/sections/VisionSection';
import StatsBar from '@/components/sections/StatsBar';
import ProjectsSection from '@/components/sections/ProjectsSection';
import TimelineSection from '@/components/sections/TimelineSection';
import { getGames, getFeaturedGame, getTimelineEvents, getSettings, Game } from '@/lib/supabase';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const [games, featuredGame, timelineEvents, siteImages] = await Promise.all([
    getGames(),
    getFeaturedGame(),
    getTimelineEvents(),
    getSettings(['hero_image', 'vision_image']),
  ]);

  const nonFeaturedGames = games.filter((g: Game) => !g.is_featured);
  const heroImage = siteImages.hero_image?.value_ko || undefined;
  const visionImage = siteImages.vision_image?.value_ko || undefined;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Hero heroImage={heroImage} />
      <VisionSection visionImage={visionImage} />
      <StatsBar />
      <ProjectsSection games={nonFeaturedGames} featuredGame={featuredGame} locale={params.locale} />
      <TimelineSection events={timelineEvents} locale={params.locale} />
    </div>
  );
}
