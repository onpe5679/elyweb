import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getLocalizedField,
  getLocalizedSettingValue,
  getSettings,
  getTimelineEvents,
} from '@/lib/supabase';
import { fmtDate, newestFirst, stripEmoji } from '@/lib/format';
import Shell from '@/components/shell/Shell';
import PageHeader from '@/components/pages/PageHeader';
import SectionHead from '@/components/pages/SectionHead';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'About' });
  return { title: tm('metaTitle') };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  // 팀원 소개(보류)와 "숫자로 보는 스튜디오"(2026-11 회의에서 삭제)는 이 화면에 두지 않는다. 숫자는 메인 비전에만 남는다.
  const [t, events, s] = await Promise.all([
    getTranslations('About'),
    getTimelineEvents(),
    getSettings([
      'about_image', 'hero_image', 'vision_title', 'vision_description',
    ]),
  ]);

  const image = s.about_image?.value_ko || s.hero_image?.value_ko || '';
  const visionTitle = getLocalizedSettingValue(s.vision_title, locale) || t('vision.title');
  const visionBody = getLocalizedSettingValue(s.vision_description, locale);
  const paragraphs = visionBody
    ? visionBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [t('vision.p1'), t('vision.p2'), t('vision.p3')];

  // 미션 문장: 첫 문장은 크게, 나머지는 한 단계 낮춰 읽히게 나눈다.
  const mission = t('mission.body');
  const [missionLead, ...missionRest] = mission.split(/(?<=[.。!?])\s*/).filter(Boolean);

  // 연혁: 최신순. 비활성 항목은 숨기고, 연도가 바뀌는 줄에는 굵은 괘선을 긋는다.
  const rows = newestFirst(events.filter((e) => e.is_active !== false))
    .map((e, i, all) => {
      const raw = e.date || '';
      const year = raw.match(/^(\d{4})/)?.[1] ?? '';
      const prevYear = i > 0 ? (all[i - 1].date || '').match(/^(\d{4})/)?.[1] ?? '' : '';
      return {
        id: e.id,
        date: fmtDate(raw, locale),
        numeric: !!year,
        yearStart: i > 0 && year !== prevYear,
        title: stripEmoji(getLocalizedField(e, 'title', locale)),
        description: e.description?.trim() || '',
      };
    });

  return (
    <Shell locale={locale}>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />

      {image && (
        <div className="mx-auto max-w-page px-5 pb-16 md:px-10 md:pb-24">
          <figure className="plate">
            <div className="aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="plate__img object-[50%_38%]" />
            </div>
          </figure>
        </div>
      )}

      {/* Vision */}
      <section aria-labelledby="vision-title" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          <SectionHead id="vision-title" eyebrow={t('vision.eyebrow')} title={visionTitle} sticky span={5} />
          <div className="md:col-span-7 md:pt-14">
            <div className="t-prose">
              {paragraphs.map((p, i) => (
                <p key={i} className="break-keep">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section aria-labelledby="mission-title" className="border-t border-ink/15 bg-ink text-paper">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          <SectionHead id="mission-title" eyebrow={t('mission.eyebrow')} title={t('mission.title')} inverse />
          <p className="break-keep font-display text-[clamp(22px,2.9vw,40px)] font-extrabold leading-[1.55] md:col-span-8">
            {missionLead}
            {missionRest.length > 0 && <span className="mt-4 block text-[.72em] font-bold leading-[1.7] opacity-75">{missionRest.join(' ')}</span>}
          </p>
        </div>
      </section>

      {/* History */}
      <section id="history" aria-labelledby="history-title" className="scroll-mt-[var(--header-h)] border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          <SectionHead id="history-title" eyebrow={t('history.eyebrow')} title={t('history.title')} sticky>
            {t('history.lead')}
          </SectionHead>
          <div className="md:col-span-8">
            {rows.length === 0 ? (
              <p className="border-t border-ink py-8 font-serif text-[16px] text-ink-2">{t('history.empty')}</p>
            ) : (
              <table className="w-full border-collapse border-t border-ink text-left" data-testid="history-table">
                <caption className="sr-only">{t('history.caption')}</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">{t('history.date')}</th>
                    <th scope="col">{t('history.event')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={`border-b border-ink/15 ${r.yearStart ? '[&>*]:border-t [&>*]:border-ink/60' : ''}`}>
                      <th scope="row" className="w-[6.75rem] py-5 pr-4 align-baseline font-mono text-[13px] font-medium text-accent-text md:w-44">
                        {r.numeric ? r.date : <span className="marker marker--accent whitespace-nowrap">{r.date}</span>}
                      </th>
                      <td className="py-5 align-baseline">
                        <span className="block break-keep font-serif text-[17px] leading-8 text-ink md:text-[18px]">{r.title}</span>
                        {r.description && <span className="mt-1 block break-keep text-[15px] leading-7 text-ink-3">{r.description}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
