import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLocalizedSettingValue, getSetting } from '@/lib/supabase';
// 스냅샷 환경(DB 없음)에서 쓰는 방침 원문. 법적 문구이므로 그대로 보여 준다.
import snapshotPolicy from '@/lib/snapshot/privacy.json';
import Shell from '@/components/shell/Shell';
import PageHeader from '@/components/pages/PageHeader';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'Privacy' });
  return { title: tm('metaTitle') };
}

type Section = { n: string; heading: string; chunks: string[] };
type Parsed = { title: string; intro: string; sections: Section[] };

const HEADING = /^(\d{1,2})\.\s+(.+)$/;
const HANGUL = /[가-힣]/;

/**
 * 방침 원문(첫 줄 = 제목, "1. …" 번호 제목, "- " 항목)을 화면용 구조로 나눈다.
 * 문구는 한 글자도 바꾸지 않고 줄 단위로만 묶는다. 번호 제목을 찾지 못하면 sections 가 비어 원문 전체를 그대로 보여 준다.
 */
function parsePolicy(text: string): Parsed {
  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  let title = '';
  if (lines.length > 1 && lines[0].trim().length <= 40 && !HEADING.test(lines[0].trim())) {
    title = lines.shift()!.trim();
  }
  const sections: Section[] = [];
  const intro: string[] = [];
  let current: Section | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (!current) return;
    const body = buffer.join('\n').trim();
    current.chunks = body ? body.split(/\n\s*\n/) : [];
    buffer = [];
  };
  for (const line of lines) {
    const m = line.trim().match(HEADING);
    if (m) {
      flush();
      current = { n: m[1], heading: m[2], chunks: [] };
      sections.push(current);
    } else if (current) {
      buffer.push(line);
    } else {
      intro.push(line);
    }
  }
  flush();
  return { title, intro: intro.join('\n').trim(), sections };
}

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, setting] = await Promise.all([getTranslations('Privacy'), getSetting('privacy_policy')]);

  const snap = snapshotPolicy as Record<string, string>;
  const body = getLocalizedSettingValue(setting, locale) || snap[locale] || snap.ko || '';
  const parsed = body ? parsePolicy(body) : null;

  // 방침 원문이 한국어뿐이면(en/ja 에 번역본이 없을 때) 한국어 본문임을 표시하고 안내 문구를 붙인다.
  const koOnly = !!body && locale !== 'ko' && HANGUL.test(body);
  const title = koOnly || !parsed?.title ? t('title') : parsed.title;
  // 한국어 원문을 en/ja 페이지에 그대로 보일 때도 단어 단위 줄바꿈을 유지한다(전역 break-keep 은 한국어 페이지에서만 keep-all).
  const kw = koOnly ? '[word-break:keep-all]' : 'break-keep';

  return (
    <Shell locale={locale}>
      <PageHeader eyebrow={t('eyebrow')} title={title} />

      <section aria-label={t('title')} className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          {!parsed ? (
            <p className="font-serif text-[16px] text-ink-2 md:col-span-8">{t('empty')}</p>
          ) : (
            <>
              {parsed.sections.length > 1 && (
                <nav aria-label={t('toc')} className="md:col-span-4 md:sticky md:top-[calc(var(--header-h)+32px)] md:self-start">
                  <p className="t-eyebrow">{t('toc')}</p>
                  <ol className="mt-4 grid border-t border-ink sm:grid-cols-2 md:grid-cols-1">
                    {parsed.sections.map((s) => (
                      <li key={s.n} className="border-b border-ink/15">
                        <a
                          href={`#policy-${s.n}`}
                          lang={koOnly ? 'ko' : undefined}
                          className="group flex min-h-[44px] items-baseline gap-3 py-2.5 text-[14px] text-ink-2 transition-colors hover:text-ink"
                        >
                          <span className="font-mono text-[12px] text-ink-3">{s.n.padStart(2, '0')}</span>
                          <span className={`${kw} group-hover:underline group-hover:decoration-accent-text group-hover:underline-offset-4`}>{s.heading}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className={parsed.sections.length > 1 ? 'md:col-span-8' : 'md:col-span-8 md:col-start-3'} lang={koOnly ? 'ko' : undefined} data-testid="policy-body">
                {koOnly && (
                  <p lang={locale} className="mb-10 border-l-2 border-ink pl-4 font-mono text-[12px] leading-6 text-ink-2">
                    {t('koOnly')}
                  </p>
                )}

                {parsed.sections.length === 0 ? (
                  <p className={`max-w-[38em] whitespace-pre-line ${kw} font-serif text-[17px] leading-[2] text-ink-2`}>{body}</p>
                ) : (
                  <div className="max-w-[40em]">
                    {parsed.intro && <p className={`mb-12 whitespace-pre-line ${kw} font-serif text-[17px] leading-[2] text-ink`}>{parsed.intro}</p>}
                    {parsed.sections.map((s, i) => {
                      const last = i === parsed.sections.length - 1;
                      return (
                        <section key={s.n} id={`policy-${s.n}`} aria-labelledby={`policy-${s.n}-h`} className="scroll-mt-[calc(var(--header-h)+24px)] border-t border-ink/15 py-8 first:border-t-0 first:pt-0">
                          <h2 id={`policy-${s.n}-h`} className="flex items-baseline gap-3 font-display text-[clamp(20px,2vw,26px)] font-extrabold leading-snug">
                            <span className="font-mono text-[13px] font-normal text-accent-text">{s.n.padStart(2, '0')}</span>
                            <span className={kw}>{s.heading}</span>
                          </h2>
                          <div className="mt-4 space-y-4">
                            {s.chunks.map((c, k) => {
                              // 마지막 절 뒤에 붙은 한 줄(시행일 등)은 판권 줄처럼 따로 둔다.
                              const tail = last && k === s.chunks.length - 1 && k > 0 && !c.trim().startsWith('-');
                              return (
                                <p
                                  key={k}
                                  className={`whitespace-pre-line ${kw} font-serif text-[16px] leading-[2] text-ink-2 md:text-[17px] ${
                                    tail ? 'mt-10 border-t border-ink pt-5 font-mono !text-[13px] !leading-7 text-ink' : ''
                                  }`}
                                >
                                  {c}
                                </p>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
