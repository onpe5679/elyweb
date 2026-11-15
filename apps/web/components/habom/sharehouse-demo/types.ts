// public/habom/sharehouse-demo/data/{locale}.json 의 형태(scripts/sharehouse-demo/build-script.mjs 가 만든다)

export type CastId = 'jihye' | 'saeun' | 'yunha';
export type ChapterId = 'prologue' | 'jihye' | 'saeun';

export type DemoStep = {
  /** 원본 시트의 데이터 행 순번 */
  n: number;
  /** <PlayerName> 은 플레이어가 치환한다 */
  text: string;
  /** 없으면 지문(내레이션·속마음) */
  who?: 'player' | CastId | 'unknown' | 'mom';
  /** 배경 id, 'black' = 검은 화면 */
  bg: string;
  /** 서 있는 캐릭터(가로 위치 순) */
  chars?: { id: CastId; face: string; x: number }[];
  ecg?: string;
  /** 이 줄에서 흘러야 하는 BGM(null = 없음) */
  bgm: string | null;
  /** 녹음 대본의 음성 파일명(00_voice_031 등). audio.voice 에 있을 때만 재생 */
  voice?: string;
  fx?: 'shake';
  sfx?: string;
  /** 원본 번역이 없어 임시로 채운 줄 */
  draft?: true;
};

export type DemoChapter = { id: ChapterId; source: string; steps: DemoStep[] };

export type DemoData = {
  version: 2;
  locale: string;
  speakers: Record<string, { name: string; color: string }>;
  chapters: DemoChapter[];
  images: { bg: Record<string, string>; ecg: Record<string, string>; stand: Record<string, string> };
  /** 캐릭터 배치: 캔버스 높이/화면 높이, 윗변 위치, 내보낸 위쪽 비율 */
  cast: Record<CastId, { scale: number; top: number; crop: number }>;
  audio: { titleBgm: string; bgm: Record<string, string>; voice: Record<string, string>; sfx: Record<string, string> };
};
