// 서버·클라이언트 공용 상수(가벼운 모듈). 하봄 홈에서도 "미니 체험" 링크를 보일지 여기서 판단한다.

/** 웹 데모가 있는 작품 slug */
export const WEB_DEMO_SLUGS: ReadonlySet<string> = new Set(['sharehouse']);

export const DEMO_BASE = '/habom/sharehouse-demo';
export const DEMO_TITLE_IMAGE = `${DEMO_BASE}/img/title.webp`;
export const DEMO_LOGO_IMAGE = `${DEMO_BASE}/img/logo.webp`;
export const demoDataUrl = (locale: string) => `${DEMO_BASE}/data/${['ko', 'en', 'ja'].includes(locale) ? locale : 'en'}.json`;

/**
 * 효과음 id → 파일 경로. 권리 확인 전이라 비워 둔다.
 * 파일을 public/habom/sharehouse-demo/sfx/ 에 넣고 여기에 적으면 플레이어가 재생한다.
 */
export const SFX: Record<string, string> = {};
