import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/elysian/PageHeader';
import WorksCatalog from '@/components/works/WorksCatalog';
import { LABELS } from '@/lib/labels';
import { getGames } from '@/lib/supabase';
import { toWorkSummary } from '@/lib/works';

export const revalidate = 10;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Works');
  return { title: t('title') };
}

export default async function GamesPage({ params: { locale } }: { params: { locale: string } }) {
  const [t, ts, games] = await Promise.all([getTranslations('Works'), getTranslations('Site'), getGames()]);
  const works = games.map((g) => toWorkSummary(g, locale));

  return (
    <>
      <PageHeader kicker={ts('studioName')} title={t('title')} latin={t('latin')} />
      <div className="mx-auto max-w-page px-5 pb-28 pt-10 md:px-10">
        <WorksCatalog
          works={works}
          labelNames={{ elysian: LABELS.elysian.localName[locale] || LABELS.elysian.name, habom: LABELS.habom.localName[locale] || LABELS.habom.name }}
        />
      </div>
    </>
  );
}
