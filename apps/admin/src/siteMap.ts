/**
 * 새 웹사이트(리디자인: 엘리시안 = 시안 D, 하봄 = 시안 C)에서 어드민 데이터가 "어디에" 보이는지 한곳에 모은 표.
 * 대시보드·설정·섹션 편집 화면이 모두 이 표를 읽어 설명을 보여 준다.
 */

export type SettingInfo = {
  /** 화면에 보이는 위치 */
  where: string;
  /** 입력 요령 */
  hint?: string;
  /** 새 사이트에서 더 이상 쓰지 않는 키 */
  unused?: boolean;
  group: 'brand' | 'studio' | 'contact' | 'news' | 'legal' | 'legacy';
};

export const SETTING_GROUPS: Record<SettingInfo['group'], string> = {
  brand: '브랜드',
  studio: '메인 · 스튜디오 소개',
  contact: '문의 · SNS',
  news: '새 소식',
  legal: '약관',
  legacy: '사용 안 함(이전 디자인)',
};

export const SETTINGS: Record<string, SettingInfo> = {
  logo_image: { group: 'brand', where: '헤더·푸터의 STUDIO ELYSIAN 로고(마크)', hint: '투명 PNG/WebP. 잉크색으로 칠해져 보입니다.' },
  favicon: { group: 'brand', where: '브라우저 탭 아이콘' },
  hero_image: { group: 'studio', where: '메인 "무궁한 이야기의 지평선" 이미지, 스튜디오 소개 상단(소개 이미지가 없을 때)' },
  about_image: { group: 'studio', where: '스튜디오 소개 맨 위 큰 이미지' },
  vision_title: { group: 'studio', where: '메인·스튜디오 소개의 비전 제목' },
  vision_description: { group: 'studio', where: '메인·스튜디오 소개의 비전 본문', hint: '빈 줄로 문단을 나눕니다.' },
  stat_year_value: { group: 'studio', where: '메인·스튜디오 소개 숫자: 설립 연도' },
  stat_projects_value: { group: 'studio', where: '메인·스튜디오 소개 숫자: 진행 프로젝트' },
  stat_released_value: { group: 'studio', where: '메인·스튜디오 소개 숫자: 출시 프로젝트' },
  stat_global_value: { group: 'studio', where: '메인·스튜디오 소개 숫자: 스팀 출시' },
  funding_percentage: { group: 'studio', where: '스튜디오 소개 "숫자로 보는 스튜디오": 펀딩 달성률' },
  contact_email: {
    group: 'contact',
    where: '문의 페이지(대표 메일), 푸터, 프레스 페이지',
    hint: '문의 페이지는 입력 폼 없이 이 메일 하나만 보여 줍니다. 회의에서 contact@studioelysian.co 로 바꾸기로 함(메일함 개설 후 변경).',
  },
  twitter_url: { group: 'contact', where: '푸터·문의 페이지 SNS (X)' },
  youtube_url: { group: 'contact', where: '푸터·문의 페이지 SNS (YouTube)' },
  instagram_url: { group: 'contact', where: '푸터·문의 페이지 SNS (Instagram)' },
  news_display_mode: { group: 'news', where: '새 소식 페이지 표시 방식(직접 작성 글 / X 위젯 / 둘 다)' },
  news_widget_x_handle: { group: 'news', where: '새 소식 페이지의 X 타임라인 계정', hint: '@ 없이 계정명만' },
  privacy_policy: { group: 'legal', where: '개인정보처리방침 페이지 본문' },
  logo_mark_dark: { group: 'legacy', where: '이전 디자인의 밤 테마 로고', unused: true },
  vision_image: { group: 'legacy', where: '이전 디자인의 비전 이미지', unused: true },
  logo_icon: { group: 'legacy', where: '이전 디자인의 아이콘', unused: true },
};

export const settingInfo = (key: string): SettingInfo =>
  SETTINGS[key] ?? { group: 'legacy', where: '새 사이트에서 읽지 않는 키', unused: true };

/** 게임 상세 섹션 종류 → 새 사이트 표시 위치 */
export const SECTION_TYPES: { id: string; name: string; where: string; hint: string }[] = [
  {
    id: 'text',
    name: '글 (소개)',
    where: '게임 상세 "소개" — 시놉시스·게임 특징',
    hint: '제목에 "시놉시스"가 들어가면 시놉시스로 표시. 빈 줄 = 문단, [소제목] 으로 시작하면 소제목.',
  },
  {
    id: 'gallery',
    name: '이미지 (캐러셀)',
    where: '게임 상세 "이미지" 가로 캐러셀(제목·캡션 없음)',
    hint: '키 비주얼(배너)·포스터(커버) 뒤에 이어 붙습니다. 컷신·스크린샷을 올리세요.',
  },
  { id: 'video', name: '영상', where: '게임 상세 "영상"', hint: 'YouTube 주소 하나당 섹션 하나. 섹션 제목이 카드 이름(PV, OP 등).' },
  {
    id: 'credits',
    name: '제작진 (크레딧 카드)',
    where: '게임 상세 "제작진" 카드',
    hint: '섹션 하나 = 카드 하나(제작진 / 성우 / OST 등). 짧은 카드는 자동으로 빈자리에 채워집니다.',
  },
  {
    id: 'timeline',
    name: '연혁 (출시일·주요 전시 계산용)',
    where: '섹션으로는 표시되지 않음 → 작품 정보의 "출시"와 "주요 전시"',
    hint: '"출시"가 들어간 항목은 출시일(Steam 우선), "전시·선정·수상·쇼케이스·Expo·BIC·지스타"가 들어간 항목은 주요 전시(최신순 5개)로 쓰입니다.',
  },
  {
    id: 'store',
    name: '스토어 (상단 버튼)',
    where: '게임 상세 맨 위 스토어 버튼(로고 포함)',
    hint: 'Steam URL(작품 기본 정보)은 자동으로 맨 앞에 붙습니다. 아이콘을 고르면 해당 로고로 표시(Steam / STOVE / itch.io, 그 외는 지구본).',
  },
  { id: 'custom', name: '자유 (글 + 이미지)', where: '게임 상세 "소개"(글) + "이미지"(사진)', hint: '' },
];

export const sectionTypeChoices = SECTION_TYPES.map(({ id, name }) => ({ id, name }));
export const sectionTypeInfo = (id?: string) => SECTION_TYPES.find((s) => s.id === id);

/** 작품 소속: 시리즈 문구에 하봄이 들어가면 하봄 화면(시안 C)으로 그린다(web/lib/brands.ts 와 같은 규칙). */
export const isHabomSeries = (series?: string | null) => /하봄|habom|ハボム/i.test(series || '');

export const WEB_URL: string = (import.meta as any).env?.VITE_WEB_API_URL || 'http://localhost:3000';
