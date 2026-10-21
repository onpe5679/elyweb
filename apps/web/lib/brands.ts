import type { Game } from './supabase';

/**
 * 브랜드(산하 스튜디오) 레지스트리.
 * 새 스튜디오를 추가하려면 이 배열에 항목을 더하고, globals.css 에 [data-brand="<id>"] 토큰과
 * messages 의 Brand.<id> 문구를 추가한다. 작품의 소속은 DB 의 series/developer 문구로 판별한다
 * (DB 변경 없이 동작; 나중에 games.brand 컬럼을 두면 resolveBrand 한 곳만 바꾸면 된다).
 */
export type BrandId = 'elysian' | 'habom';

export type Brand = {
  id: BrandId;
  /** 로케일 접두사를 뺀 브랜드 홈 경로 */
  href: string;
  /** series_* / developer 필드에서 이 브랜드를 알아보는 패턴 */
  match?: RegExp;
};

export const BRANDS: Record<BrandId, Brand> = {
  elysian: { id: 'elysian', href: '/' },
  habom: { id: 'habom', href: '/habom', match: /하봄|habom|ハボム/i },
};

type BrandSource = Partial<
  Pick<Game, 'slug' | 'series_ko' | 'series_en' | 'series_ja'>
> & { developer?: string };

export function resolveBrand(game: BrandSource): BrandId {
  const hay = [game.series_ko, game.series_en, game.series_ja, game.developer].filter(Boolean).join(' ');
  for (const brand of Object.values(BRANDS)) {
    if (brand.match && brand.match.test(hay)) return brand.id;
  }
  return 'elysian';
}

/** 대사·선택지 체험은 하봄 소속 게임에만 연다. */
export function hasExperience(game: BrandSource): boolean {
  return resolveBrand(game) === 'habom';
}

export const SITE_URL_DEFAULT_LOGO = '/snapshot/company_settings/2de92d57-7a42-40f6-a99e-783411918a3c.webp';
