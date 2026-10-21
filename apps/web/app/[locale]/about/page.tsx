import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getLocalizedField,
  getLocalizedSettingValue,
  getSettings,
  getTeamMembers,
  getTimelineEvents,
} from '@/lib/supabase';
import { resolveBrand } from '@/lib/brands';
import { fmtDate, pad2, stripEmoji } from '@/lib/format';
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
  const [t, events, members, s] = await Promise.all([
    getTranslations('About'),
    getTimelineEvents(),
    getTeamMembers(),
    getSettings([
      'about_image', 'hero_image', 'vision_title', 'vision_description',
      'stat_year_value', 'stat_projects_value', 'stat_released_value', 'stat_global_value', 'funding_percentage',
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

  const sv = (key: string, fallback: string) => getLocalizedSettingValue(s[key], locale) || fallback;
  const stats = [
    { label: t('colophon.year'), value: sv('stat_year_value', '2022') },
    { label: t('colophon.projects'), value: sv('stat_projects_value', '3+') },
    { label: t('colophon.released'), value: sv('stat_released_value', '2') },
    { label: t('colophon.global'), value: sv('stat_global_value', 'Global') },
    { label: t('colophon.funding'), value: sv('funding_percentage', '1347%') },
  ];

  // 연혁: 비활성 항목은 숨기고, 연도가 바뀌는 줄에는 굵은 괘선을 긋는다.
  const rows = events
    .filter((e) => e.is_active !== false)
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
            <figcaption className="mt-2 px-1 pb-1 font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">{t('plate')}</figcaption>
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

      {/* Colophon: 숫자 */}
      <section aria-labelledby="colophon-title" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          <SectionHead id="colophon-title" eyebrow={t('colophon.eyebrow')} title={t('colophon.title')} />
          <dl className="border-t border-ink md:col-span-8">
            {stats.map((st) => (
              <div key={st.label} className="flex items-baseline gap-3 border-b border-ink/15 py-5">
                {/* 점선 리더(목차처럼 라벨과 값을 이어 준다) */}
                <dt className="t-eyebrow flex min-w-0 flex-1 items-baseline gap-3 after:mb-1 after:block after:min-w-[1.5rem] after:flex-1 after:border-b after:border-dotted after:border-ink/40 after:content-['']">
                  <span>{st.label}</span>
                </dt>
                <dd className="font-display text-[clamp(28px,3.4vw,46px)] font-extrabold leading-none">{st.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Team */}
      {members.length > 0 && (
        <section aria-labelledby="team-title" className="border-t border-ink/15 bg-paper-2">
          <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
            <SectionHead id="team-title" eyebrow={t('team.eyebrow')} title={t('team.title')} sticky>
              {t('team.lead')}
            </SectionHead>
            <ul className="border-t border-ink md:col-span-8" data-testid="team-list">
              {members.map((m, i) => {
                const name = getLocalizedField(m, 'name', locale);
                const role = getLocalizedField(m, 'role', locale);
                const habom = resolveBrand({ developer: [m.role_ko, m.role_en, m.role_ja].filter(Boolean).join(' ') }) === 'habom';
                return (
                  <li key={m.id} className="border-b border-ink/15">
                    <Link
                      href={`/team/${m.slug}`}
                      className="group grid min-h-[72px] grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 px-1 py-6 transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)_1.5rem] md:gap-x-6 md:px-4"
                    >
                      <span aria-hidden className="font-mono text-[12px] text-ink-3 group-hover:text-paper/70 group-focus-visible:text-paper/70">{pad2(i + 1)}</span>
                      <span className="break-keep font-display text-[clamp(24px,2.6vw,34px)] font-extrabold leading-tight">{name}</span>
                      <span className="col-start-2 flex items-center gap-2 break-keep font-serif text-[16px] leading-7 text-ink-2 group-hover:text-paper/85 group-focus-visible:text-paper/85 md:col-start-auto">
                        {habom && (
                          // 하봄 소속: 하봄 토큰의 핑크를 작은 점으로만 쓴다
                          <span data-brand="habom" className="inline-flex shrink-0">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                          </span>
                        )}
                        {role}
                      </span>
                      <span aria-hidden className="hidden text-right font-mono text-[14px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

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
