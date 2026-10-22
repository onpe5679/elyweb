import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getGames, getLocalizedField, getStatusText } from '@/lib/supabase';
import { isHobomGame } from '@/lib/studios';
import GameCard from '@/components/games/GameCard';

export default async function HobomPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('Hobom');
  const games = (await getGames()).filter(isHobomGame);

  const items = games.map((game) => ({
    slug: game.slug,
    series: getLocalizedField(game, 'series', locale),
    title: getLocalizedField(game, 'title', locale),
    desc: getLocalizedField(game, 'description', locale),
    image: game.thumbnail_image || game.cover_image || '',
    statusText: getStatusText(game.status, locale),
    hobom: true,
  }));

  return (
    <div className="on-hobom font-hobom min-h-screen bg-hb-cream text-hb-ink">
      <section className="relative isolate overflow-hidden px-4 pb-24 pt-40 sm:px-6 lg:px-8 md:pb-32">
        <span aria-hidden="true" className="absolute -right-32 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-hb-pink" />
        <span aria-hidden="true" className="absolute right-[18%] top-[46%] -z-10 h-20 w-20 rounded-full bg-hb-yellow" />
        <span aria-hidden="true" className="absolute left-[-6rem] top-[60%] -z-10 h-56 w-56 rounded-full bg-hb-pink-soft" />

        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-hb-ink/70 transition-colors hover:text-hb-ink"
          >
            ← {t('backToElysian')}
          </Link>
          <p className="mt-12 text-sm font-bold tracking-wide text-hb-pink-deep">{t('eyebrow')}</p>
          <h1 className="mt-4 text-7xl font-bold leading-none md:text-9xl">{t('title')}</h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-hb-ink/80">{t('lead')}</p>
        </div>
      </section>

      <section aria-labelledby="hobom-works" className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
        <div className="mb-14 flex items-center gap-4">
          <h2 id="hobom-works" className="text-3xl font-bold md:text-4xl">{t('worksTitle')}</h2>
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-hb-yellow" />
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {items.map((game, index) => (
              <GameCard key={game.slug} game={game} variant="hobom" offset={index % 3 === 1} />
            ))}
          </div>
        ) : (
          <p className="rounded-[2rem] bg-hb-pink-soft p-10 text-lg">{t('empty')}</p>
        )}
      </section>
    </div>
  );
}
