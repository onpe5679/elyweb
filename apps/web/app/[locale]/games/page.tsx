import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGames } from '@/lib/supabase';
import { toCard } from '@/lib/game-model';
import Shell from '@/components/shell/Shell';
import Cells from '@/components/ui/Cells';
import WorksList from '@/components/works/WorksList';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Works' });
  return { title: t('title') };
}

export default async function GamesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Works');
  const games = await getGames();
  const items = games.map((g) => toCard(g, locale));

  return (
    <Shell locale={locale}>
      <div className="relative overflow-hidden">
        <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-50" />
        <div className="mx-auto max-w-page px-5 pb-24 pt-14 md:px-10 md:pt-20">
          <p className="t-eyebrow">{t('eyebrow')}</p>
          <h1 className="mt-5">
            <Cells text={t('title')} size="md" />
          </h1>
          <p className="t-prose mt-8 break-keep !text-[17px]">{t('lead')}</p>
          <div className="mt-14">
            <WorksList items={items} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
