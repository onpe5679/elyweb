// public/habom/sharehouse-demo/data/{locale}.json 의 형태(scripts/sharehouse-demo/build-script.mjs 가 만든다)

export type DemoStep = {
  /** 원본 시트의 데이터 행 순번 */
  n: number;
  text: string;
  /** 없으면 지문(내레이션·속마음) */
  who?: 'player' | 'jihye' | 'saeun' | 'unknown';
  bg?: string;
  /** 'jihye/smile' 같은 스탠딩 키 */
  stand?: string;
  ecg?: string;
  fx?: 'shake';
  /** 효과음 id — 지금은 재생하지 않는다(SFX 표 참고) */
  sfx?: string;
  /** 원본 번역이 없어 임시로 채운 줄 */
  draft?: true;
};

export type DemoChapter = { id: 'jihye' | 'saeun'; cast: string; source: string; steps: DemoStep[] };

export type DemoData = {
  version: 1;
  locale: string;
  speakers: Record<string, { name: string; color: string }>;
  chapters: DemoChapter[];
  images: { bg: Record<string, string>; ecg: Record<string, string>; stand: Record<string, string> };
};
