import Hero from '@/components/sections/Hero';
import VisionSection from '@/components/sections/VisionSection';
import StatsBar from '@/components/sections/StatsBar';
import ProjectsSection from '@/components/sections/ProjectsSection';
import TimelineSection from '@/components/sections/TimelineSection';
import { getGames, getFeaturedGame, getTimelineEvents, Game } from '@/lib/supabase';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const [games, featuredGame, timelineEvents] = await Promise.all([
    getGames(),
    getFeaturedGame(),
    getTimelineEvents(),
  ]);

  const nonFeaturedGames = games.filter((g: Game) => !g.is_featured);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Hero />
      <VisionSection />
      <StatsBar />
      <ProjectsSection games={nonFeaturedGames} featuredGame={featuredGame} locale={params.locale} />
      <TimelineSection events={timelineEvents} locale={params.locale} />
    </div>
  );
}
