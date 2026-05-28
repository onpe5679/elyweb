'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

interface FooterProps {
  settings: {
    contactEmail: string;
    twitterUrl: string;
    youtubeUrl: string;
    instagramUrl: string;
    logoImage?: string | null;
    logoIcon?: string;
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
                        {(settings.logoImage || settings.logoIcon) ? (
                            <img src={settings.logoImage || settings.logoIcon} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                <i className="fa-solid fa-gamepad"></i>
                            </div>
                        )}
                        <span className="font-display font-bold text-xl tracking-wider uppercase">
                            Studio Elysian
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm whitespace-pre-line">
                        {t('desc')}
                    </p>
                    <div className="flex space-x-4 mt-6">
                        {settings.twitterUrl && (
                            <a className="text-gray-400 hover:text-white transition-colors" href={settings.twitterUrl} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter text-xl"></i></a>
                        )}
                        {settings.youtubeUrl && (
                            <a className="text-gray-400 hover:text-white transition-colors" href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube text-xl"></i></a>
                        )}
                        {settings.instagramUrl && (
                            <a className="text-gray-400 hover:text-white transition-colors" href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram text-xl"></i></a>
                        )}
                        {settings.contactEmail && (
                            <a className="text-gray-400 hover:text-white transition-colors" href={`mailto:${settings.contactEmail}`}><i className="fa-solid fa-envelope text-xl"></i></a>
                        )}
                    </div>
                </div>
                <div>
                    <h5 className="text-lg font-bold mb-4 text-white">{t('quickLinks')}</h5>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link className="hover:text-primary transition-colors" href="/about">{t('links.about')}</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/games">{t('links.projects')}</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/news">{t('links.news')}</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="text-lg font-bold mb-4 text-white">{t('contact')}</h5>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link className="hover:text-primary transition-colors" href="/contact">{t('contactLinks.inquiry')}</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-xs text-gray-500 leading-relaxed">
                <div className="mb-4 space-y-1">
                    <p>상호(법인명) : 주식회사 스튜디오엘리시안 | 사업자 등록번호 : 373-81-03729 | 대표자 : 우현제</p>
                    <p>주소 : 경기도 성남시 분당구 대왕판교로645번길 12, 6층 27호(삼평동, 경기창조경제혁신센터)</p>
                    <p>연락처 : 010-5344-0783 | 이메일 : stdelysian@gmail.com</p>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>{t('rights')}</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link className="hover:text-white transition-colors" href="/privacy">{t('privacy')}</Link>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
}
