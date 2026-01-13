'use client';

import {useTranslations} from 'next-intl';
import Image from 'next/image';
import {Link} from '@/i18n/routing';

const DEFAULT_VISION_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuH9zfscNU583mjOoxQHWwtrrxL_URj8Cn-XiQYYOWO8bL_cwElK-MXAWahlUtmzmPW6cc5MtnoE29qELOumVwb9xKsYn2_Z793_xKUJkd0g3lsf0vjq-bfcVaZksoNjdBUueHpyh4FtQ_O3OVsg0_C82cJ2CWkhZKUtWUay2m47G1RayxCQbbtPMHfj6w8-j9qkNUIa3wpaQNHiPg2Vvw5HAWHGsAYfZ-_5iOcsEeYvxeVJZl7vQ6Q2g02XZhZ_O8lRo2XIF-nd4';

type VisionSectionProps = {
  visionImage?: string;
};

export default function VisionSection({ visionImage }: VisionSectionProps) {
  const t = useTranslations('Vision');
  const imageSrc = visionImage || DEFAULT_VISION_IMAGE;

  return (
    <section className="py-24 bg-surface-light dark:bg-surface-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px]">
                        <Image 
                            alt="Retro futuristic room" 
                            src={imageSrc}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
                <div>
                    <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">{t('label')}</h4>
                    <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
                        {t('title')}
                    </h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>{t('p1')}</p>
                        <p>{t('p2')}</p>
                        <p>{t('p3')}</p>
                    </div>
                    <div className="mt-8">
                        <Link className="inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors" href="/about">
                            {t('more')} <i className="fa-solid fa-arrow-right ml-2"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
