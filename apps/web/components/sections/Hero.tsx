'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import Image from 'next/image';

type HeroProps = {
  heroImage?: string;
  heroTitle?: string;
  heroDescription?: string;
};

function parseGradientText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return (
        <span 
          key={index} 
          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
        >
          {content}
        </span>
      );
    }
    return part;
  });
}

export default function Hero({ heroImage, heroTitle, heroDescription }: HeroProps) {
  const t = useTranslations('Hero');
  const imageSrc = heroImage || '/uploads/default-hero.jpg';

  return (
    <header className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <Image 
              alt="Abstract anime style gaming room background" 
              src={imageSrc}
              fill
              sizes="100vw"
              className="object-cover opacity-100 dark:opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent opacity-90"></div>
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
            <div className="inline-block mb-4 px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white text-xs font-medium tracking-widest uppercase animate-fade-in-down">
                {t('label')}
            </div>
            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight drop-shadow-lg whitespace-pre-line">
                {heroTitle ? parseGradientText(heroTitle) : (
                  <>{t('title1_prefix')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t('title1_highlight')}</span>{t('title1_suffix')}<br/>{t('title2')}</>
                )}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed whitespace-pre-line">
                {heroDescription || t('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a className="px-8 py-4 rounded-full bg-white text-primary font-bold text-lg hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-1" href="#projects">
                    {t('viewProjects')}
                </a>
                <Link className="px-8 py-4 rounded-full border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-primary transition-all transform hover:-translate-y-1 backdrop-blur-sm" href="/contact">
                    {t('contact')}
                </Link>
            </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/70">
            <i className="fa-solid fa-chevron-down text-2xl"></i>
        </div>
    </header>
  );
}
