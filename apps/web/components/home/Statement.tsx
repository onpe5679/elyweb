import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

type Props = {
  title: string;
  paragraphs: string[];
  image?: string;
  stats: { value: string; label: string }[];
};

/** 스튜디오 소개 한 장: 선언문 + 판권 형식의 숫자. */
export default async function Statement({ title, paragraphs, image, stats }: Props) {
  const t = await getTranslations('Home');
  return (
    <section aria-labelledby="vision-title" className="border-t border-ink/15 bg-paper-2">
      <div className="mx-auto grid max-w-page gap-14 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
        <div className="md:col-span-5">
          <p className="t-eyebrow">{t('vision.eyebrow')}</p>
          <h2 id="vision-title" className="t-display mt-4 text-[clamp(30px,4.2vw,54px)]">{title}</h2>
          {image && (
            <div className="plate mt-10">
              <div className="aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" loading="lazy" className="plate__img" />
              </div>
              <p className="mt-2 px-1 pb-1 font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">{t('vision.plate')}</p>
            </div>
          )}
        </div>
        <div className="md:col-span-7 md:pt-14">
          <div className="t-prose">
            {paragraphs.map((p, i) => (
              <p key={i} className="break-keep">{p}</p>
            ))}
          </div>
          <dl className="mt-14 grid grid-cols-2 border-t border-ink/20 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-b border-ink/15 py-5 pr-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
                <dd className="font-display text-[34px] font-extrabold leading-none text-ink">{s.value}</dd>
                <dt className="mt-2 font-mono text-[11px] uppercase tracking-[.12em] text-ink-3">{s.label}</dt>
              </div>
            ))}
          </dl>
          <Link href="/about" className="link-u mt-10 inline-block text-[15px] font-bold">{t('vision.more')} →</Link>
        </div>
      </div>
    </section>
  );
}
