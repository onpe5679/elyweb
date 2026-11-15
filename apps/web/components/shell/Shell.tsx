import { getLocalizedSettingValue, getSettings } from '@/lib/supabase';
import type { BrandId } from '@/lib/brands';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import HabomFab from './HabomFab';

type Props = {
  brand?: BrandId;
  locale: string;
  children: React.ReactNode;
  /** 헤더/푸터를 숨기는 전체 화면 페이지용 */
  bare?: boolean;
};

/**
 * 엘리시안 페이지의 바깥 틀(하봄 화면은 components/habom/HabomShell 을 쓴다).
 */
export default async function Shell({ brand = 'elysian', locale, children, bare }: Props) {
  const settings = await getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url', 'logo_image']);
  const logoSrc = settings.logo_image?.value_ko || null;

  return (
    <div data-brand={brand} className="flex min-h-screen flex-col bg-paper text-ink">
      <a href="#main" className="skip-link">{locale === 'ko' ? '본문으로 건너뛰기' : locale === 'ja' ? '本文へ移動' : 'Skip to content'}</a>
      {!bare && <SiteHeader logoSrc={logoSrc} />}
      <main id="main" className="flex-grow">
        {children}
      </main>
      {!bare && (
        <SiteFooter
          brand={brand}
          logoSrc={logoSrc}
          contactEmail={getLocalizedSettingValue(settings.contact_email, locale)}
          twitterUrl={getLocalizedSettingValue(settings.twitter_url, locale)}
          youtubeUrl={getLocalizedSettingValue(settings.youtube_url, locale)}
          instagramUrl={getLocalizedSettingValue(settings.instagram_url, locale)}
        />
      )}
      {!bare && brand === 'elysian' && <HabomFab />}
    </div>
  );
}
