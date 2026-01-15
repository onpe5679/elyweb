'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

interface FooterProps {
  settings: {
    contactEmail: string;
    twitterUrl: string;
    youtubeUrl: string;
    instagramUrl: string;
  };
}

export default function Footer({ settings }: FooterProps) {
  const t = useTranslations('Footer');
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                        <span className="font-display font-bold text-xl tracking-wider uppercase">
                            Studio Elysian
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm whitespace-pre-line">
                        {t('desc')}
                    </p>
                    <div className="flex space-x-4 mt-6">
                        <a className="text-gray-400 hover:text-white transition-colors" href={settings.twitterUrl} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter text-xl"></i></a>
                        <a className="text-gray-400 hover:text-white transition-colors" href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube text-xl"></i></a>
                        <a className="text-gray-400 hover:text-white transition-colors" href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram text-xl"></i></a>
                        <a className="text-gray-400 hover:text-white transition-colors" href={`mailto:${settings.contactEmail}`}><i className="fa-solid fa-envelope text-xl"></i></a>
                    </div>
                </div>
                <div>
                    <h5 className="text-lg font-bold mb-4 text-white">{t('quickLinks')}</h5>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link className="hover:text-primary transition-colors" href="/about">{t('links.about')}</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/games">{t('links.projects')}</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/news">{t('links.news')}</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/careers">{t('links.careers')}</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="text-lg font-bold mb-4 text-white">{t('contact')}</h5>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link className="hover:text-primary transition-colors" href="/contact">{t('contactLinks.inquiry')}</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/faq">{t('contactLinks.faq')}</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/partnership">{t('contactLinks.partnership')}</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>{t('rights')}</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <a className="hover:text-white transition-colors" href="#">{t('privacy')}</a>
                    <a className="hover:text-white transition-colors" href="#">{t('terms')}</a>
                </div>
            </div>
        </div>
    </footer>
  );
}
