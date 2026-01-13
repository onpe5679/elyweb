import { useTranslations } from 'next-intl';
import Hero from '@/components/sections/Hero';
import VisionSection from '@/components/sections/VisionSection';
import StatsBar from '@/components/sections/StatsBar';
import ProjectsSection from '@/components/sections/ProjectsSection';
import TimelineSection from '@/components/sections/TimelineSection';

export default function HomePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <Hero />
      <VisionSection />
      <StatsBar />
      <ProjectsSection />
      <TimelineSection />
    </div>
  );
}
