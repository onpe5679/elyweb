'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import FeaturedGame from '@/components/games/FeaturedGame';
import GameCard from '@/components/games/GameCard';

export default function ProjectsSection() {
  const t = useTranslations('Projects');
  const params = useParams();
  const locale = params.locale as string;

  const games = [
    {
      slug: 'space-empathy',
      tag: t('spaceEmpathy.tag'),
      overlay: t('spaceEmpathy.overlay'),
      series: t('spaceEmpathy.series'),
      title: t('spaceEmpathy.title'),
      desc: t('spaceEmpathy.desc'),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9wLTEAMj-8JrucPk5Ur88qM2wkr0D7LmWA3pqOugBqSwgxs_JMdFKyRDQZtbOXs4BAwzQeD-dXw57d8TA7fRHk5dfRrbpnlhRJOUyPw8gDa1RAJe7NsX4UuhWp_ngpAchZJUP0-JwpLOjmqZQffL_DWgFz2IEyi-BLhNPphWbAMtWjxtRQs0nr1oGG_a7lr5wpxBMP8Na1ABVLLEODq5dUHLsU3FEG7p9nFx5v2lgqJxBiifLN1AUyQ1-v4z652DE3VTY4IVBUHs',
      tagColor: 'bg-primary/90',
    },
    {
      slug: 'festival-not-over',
      tag: t('festival.tag'),
      overlay: t('festival.overlay'),
      series: t('festival.series'),
      title: t('festival.title'),
      desc: t('festival.desc'),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNROh0Z8PhYTXUyJDxtlLPTmmgxzMgjGjKY1hNp4QaCGMbtCgTAos2kOnxhqdqz3yNqJ0eakHI4Es4WQBKgi4H6qsdBlQ4ZXiAg4np4EA_foFXIVc0eJ5DRxzWOb7jSEHdUl60fxxNCNKnWWYvWL2BWok3924lFrUjdUoIaM4Ot8eXbCEd5fafCXhD7F0aFkf1UFLuFmz0oMWa3TWwm-ZLKCBmANif8O1GkFoMa_mWfADFgx-X1YzKX2EYkVwldk42BQBBcPyFMCs',
      tagColor: 'bg-primary/90',
    },
    {
      slug: 'sharehouse',
      tag: t('sharehouse.tag'),
      overlay: t('sharehouse.overlay'),
      series: t('sharehouse.series'),
      title: t('sharehouse.title'),
      desc: t('sharehouse.desc'),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZfqh4yPrE9cgvF1fwUTOa1M5S2XYI586T0LQ-3y0qBZ0vXfEB3ZAENXD8cUaEGeVKT9rSp1_THPFDANvhD0ahAU5LxXMddBhaWTcigCt9wKCW4rFPQB83ZjkpDc0ZAxOuEymtRP48ZzJxdhrCzJMqG1EI1eUNJWf3OCClgQHEuKl_ShO1Rcop_UD7cdPUp5_4--gW1OT1j3-G0RSkaYAH7Rw98aWknssLlSA-sMTwe2NmaNzeaLAbbnLkbzvn_dXksYBAxCIZ3EU',
      tagColor: 'bg-pink-500',
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            {t('label')}
          </h4>
          <h2 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white uppercase tracking-tight">
            {t('title')}
          </h2>
        </div>

        <FeaturedGame />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
