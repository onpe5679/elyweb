import { getGames, getLocalizedSettingValue, getSettings } from '@/lib/supabase';
import { hasExperience, type BrandId } from '@/lib/brands';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

type Props = {
  brand?: BrandId;
  locale: string;
  children: React.ReactNode;
  /** 헤더/푸터를 숨기는 전체 화면 페이지용 */
  bare?: boolean;
};

/**
 * 모든 페이지의 바깥 틀. brand 에 따라 색·서체·모서리 토큰이 바뀐다(globals.css 의 [data-brand]).
 */
export default async function Shell({ brand = 'elysian', locale, children, bare }: Props) {
  const [settings, games] = await Promise.all([
    getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url', 'logo_image']),
    brand === 'habom' ? getGames() : Promise.resolve([]),
  ]);
  const logoSrc = settings.logo_image?.value_ko || null;
  const exp = games.find((g) => hasExperience(g));
  const experienceHref = exp ? `/games/${exp.slug}?play=1` : undefined;

  return (
    <div data-brand={brand} className="flex min-h-screen flex-col bg-paper text-ink">
      <a href="#main" className="skip-link">{locale === 'ko' ? '본문으로 건너뛰기' : locale === 'ja' ? '本文へ移動' : 'Skip to content'}</a>
      {!bare && <SiteHeader brand={brand} logoSrc={logoSrc} experienceHref={experienceHref} />}
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
    </div>
  );
}
