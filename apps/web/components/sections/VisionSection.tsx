'use client';

import {useTranslations} from 'next-intl';
import Image from 'next/image';
import {Link} from '@/i18n/routing';

const DEFAULT_VISION_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuH9zfscNU583mjOoxQHWwtrrxL_URj8Cn-XiQYYOWO8bL_cwElK-MXAWahlUtmzmPW6cc5MtnoE29qELOumVwb9xKsYn2_Z793_xKUJkd0g3lsf0vjq-bfcVaZksoNjdBUueHpyh4FtQ_O3OVsg0_C82cJ2CWkhZKUtWUay2m47G1RayxCQbbtPMHfj6w8-j9qkNUIa3wpaQNHiPg2Vvw5HAWHGsAYfZ-_5iOcsEeYvxeVJZl7vQ6Q2g02XZhZ_O8lRo2XIF-nd4';

type VisionSectionProps = {
  visionImage?: string;
  visionTitle?: string;
  visionBody?: string;
};

export default function VisionSection({visionImage, visionTitle, visionBody}: VisionSectionProps) {
  const t = useTranslations('Vision');
  const imageSrc = visionImage || DEFAULT_VISION_IMAGE;
  const bodyParagraphs = visionBody
    ? visionBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : null;

  return (
    <section id="intro" className="relative overflow-hidden bg-paper py-28 md:py-40">
      <div
        aria-hidden="true"
        className="manuscript-grid pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] opacity-70 [mask-image:linear-gradient(to_left,black,transparent)] lg:block"
      />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
        <div className="lg:col-span-5">
          <p className="eyebrow">{t('label')}</p>
          <h2 className="font-display mt-6 text-balance text-4xl leading-[1.15] text-ink md:text-6xl">
            {visionTitle || t('title')}
          </h2>
          <div className="mt-10 space-y-6 text-base leading-loose text-ink-2 md:text-lg">
            {bodyParagraphs ? (
              bodyParagraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <>
                <p>{t('p1')}</p>
                <p>{t('p2')}</p>
                <p>{t('p3')}</p>
              </>
            )}
          </div>
          <Link
            href="/about"
            className="group mt-12 inline-flex items-center gap-4 border-b border-ink pb-1.5 text-sm font-bold tracking-wide text-ink transition-colors hover:border-seal hover:text-seal"
          >
            {t('more')}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <figure className="min-w-0 lg:col-span-6 lg:col-start-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-paper-alt shadow-[0_30px_60px_-30px_rgba(28,27,24,0.45)]">
            <Image
              alt=""
              src={imageSrc}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 flex justify-between text-xs tracking-wide text-ink-3">
            <span>Studio Elysian</span>
            <span>2022 —</span>
          </figcaption>
        </figure>
      </div>

      <div className="relative mx-auto mt-28 grid max-w-7xl gap-6 border-t border-rule px-4 pt-14 sm:px-6 md:grid-cols-12 lg:px-8">
        <h3 className="eyebrow md:col-span-3">{t('missionTitle')}</h3>
        <p className="font-display text-2xl leading-relaxed text-ink md:col-span-8 md:col-start-5 md:text-3xl">
          {t('missionBody')}
        </p>
      </div>
    </section>
  );
}
