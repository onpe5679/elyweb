// 웹 데모 연출표 — 사람이 손으로 정한 값.
//
// 원본 대본(CSV/xlsx)에는 배경·스탠딩·표정 열이 없다. 프롤로그(9000)는 실제 게임 플레이 영상
// (`20 제출자료/260506 인디시드챌린지/…플레이 영상.mp4`, 9000 의 50~103행)을 기준으로 맞췄고, 나머지는 대사 내용을 보고 정했다.
// 키 = 대본 시트의 "데이터 행 순번"(머리글 다음 행이 0). ScriptIndex 는 시트에 따라 중복·누락이 있어 쓰지 않는다.
//
// 지시어(모두 선택, 다음 지시가 나올 때까지 유지):
//   bg:    배경 id (ASSETS.bg, 'black' = 검은 화면)
//   show:  { jihye: 'smile' } — 캐릭터를 세우거나 표정을 바꿈(자리는 CAST.slot, 혼자면 가운데)
//   face:  { jihye: 'worry' } — 서 있는 캐릭터의 표정만 바꿈. 문자열이면 혼자 서 있는 캐릭터의 표정
//   at:    { jihye: 0.62 } — 가로 위치(화면 폭 비율, 캐릭터 중심)를 고정
//   hide:  ['jihye'] 또는 'all'
//   stand: 'jihye/happy' — (1인 장면용 줄임) 모두 내리고 이 캐릭터만 세움. null 이면 모두 내림
//   ecg:   이벤트 CG id, null 이면 내림(ECG 가 떠 있는 동안 스탠딩은 가린다)
//   bgm:   배경음 id(AUDIO.bgm), null 이면 멈춤
//   fx:    'shake' (한 번만)
//   sfx:   효과음 id (한 번만). AUDIO.sfx 에 파일이 있는 것만 소리가 난다.

const G = '02 그래픽/';
const PV = '20 제출자료/250504 PV 리소스 전달용/';
const SND = '12 사운드/';

/** 원본 → 웹용 파일. 경로는 셰어하우스 폴더 기준. build-images.mjs 가 쓰는 것만 변환한다. */
export const ASSETS = {
  bg: {
    // 영상의 낮 거실 원본이 없어서: 저녁 거실(노을빛 제거) + PV 거실(배경X)의 창 마스크 + 낮 하늘 — 임시 합성
    'living-day': { src: G + '01 배경/#1 아파트 거실/소스/#01-거실 (저녁) 조명OFF (배경O).png', recipe: 'day-living' },
    'living-night': { src: PV + '배경 리소스/#1 아파트 거실/소스/#01-거실 (밤) 조명ON (배경X).png', under: PV + '배경 리소스/#1 아파트 거실/소스/#01-밤.png' },
    'home-room': { src: G + '01 배경/#3 주인공 방/#03-주인공방(낮).png' },
    apartment: { src: G + '01 배경/#16-아파트/#16-아파트(새벽).png' },
    // 주인공 방 밤 원본이 없어 톤 보정한 임시본
    'room-night': { src: G + '01 배경/#3 주인공 방/#03-주인공방(낮).png', tone: 'night' },
    'saeun-room-night': { src: PV + '배경 리소스/#10 세은이 방/#10-세은이 방(밤)01.png' },
  },
  ecg: {
    'jihye-cooking': { src: G + '00 ECG/99 IngameResource/지혜_요리_기본_보정.png' },
  },
  title: { src: G + '00 ECG/00 Special/메인화면 CG/메인화면 일러스트하늘X_인쇄용.png' },
  logo: { src: G + '03 etc/Logo/로고.png' },
};

/**
 * 캐릭터: 몸 그림 + 표정 파츠(같은 캔버스). face 가 null 이면 몸 그림의 표정 그대로.
 * scale = 캔버스 높이 / 화면 높이, top = 캔버스 윗변 위치(화면 높이 비율), slot = 여럿일 때 가로 위치.
 * 세 값은 플레이 영상 프레임에 그림을 맞춰 잰 값(지혜는 영상 속 교복 그림이 없어 머리 위치로 맞춤).
 */
export const CAST = {
  jihye: {
    // 영상에서는 교복(분홍 가디건) 스탠딩 — 로컬에 없어 잠옷으로 대신함
    body: G + '00 SCG/Jihye/지혜_잠옷_흥미_없음.png',
    scale: 1.8,
    top: 0,
    slot: 0.84,
    faces: {
      interest: null,
      happy: G + '00 SCG/Jihye/Resource/Face/base.png',
      smile: G + '00 SCG/Jihye/Resource/Face/Smile.png',
      worry: G + '00 SCG/Jihye/Resource/Face/Fear.png',
      cry: G + '00 SCG/Jihye/Resource/Face/Panic_B.png',
      grin: G + '00 SCG/Jihye/Resource/Face/fatigue.png',
      awkward: G + '00 SCG/Jihye/Resource/Face/사연3.png',
    },
  },
  saeun: {
    body: G + '00 SCG/Saeun/세은_잠옷_기본_없음.png',
    scale: 1.8,
    top: 0.144,
    slot: 0.19,
    faces: {
      base: null,
      grin: G + '00 SCG/Saeun/Resource/Face/Kidding.png',
      startled: G + '00 SCG/Saeun/Resource/Face/Panic.png',
      tired: G + '00 SCG/Saeun/Resource/Face/Tired.png',
      pout: G + '00 SCG/Saeun/Resource/Face/sad.png',
      surprised: G + '00 SCG/Saeun/Resource/Face/surprised.png',
      teary: G + '00 SCG/Saeun/Resource/Face/울음.png',
    },
  },
  yunha: {
    // 영상의 윤하(흰 셔츠·사원증). Resource/Face 는 새 몸(재킷)용이라 맞지 않아 Base 표정만 쓴다.
    body: G + '00 SCG/Yunha/99 old result/윤하 사복_수정 전.png',
    scale: 1.9,
    top: -0.022,
    slot: 0.5,
    faces: {
      base: null,
      closed: G + '00 SCG/Yunha/Base/Yunha_Base_Thinking.png',
      surprised: G + '00 SCG/Yunha/Base/Yunha_Base_Fear.png',
      stern: G + '00 SCG/Yunha/Base/Yunha_Base_Angry.png',
    },
  },
};

/** 소리. 경로는 셰어하우스 폴더 기준, build-audio.mjs 가 MP3 로 변환한다. */
export const AUDIO = {
  // 영상의 BGM 은 로컬 파일과 일치하는 곡이 없어(SH Soundtrack 002~005 없음) 곡 배정은 임시
  bgm: {
    welcome: SND + 'SH Soundtrack/001.Welcome to our house!.mp3',
    crossed: SND + 'SH Soundtrack/006.You crossed the line.mp3',
    refreshing: SND + 'BGM/외주_뮤스/일상 BGM 1_/Refreshing steps.wav',
    'early-spring': PV + '사운드 리소스/Muse_My_early_spring.mp3',
  },
  titleBgm: 'welcome',
  sfx: {
    touch: SND + 'TouchSFX.mp3',
  },
  // 음성 id(녹음 대본 `비교 본.xlsx` 의 File Name) → 파일. 지금 있는 것은 장예나 성우님 샘플 8개뿐.
  // 샘플은 영상 속 게임 음성과 파형이 달라 정식 녹음본이 아닐 수 있다 — 정식 파일이 오면 이 표만 바꾼다.
  voice: {
    '00_voice_024': SND + '성우 샘플_장예나 성우님/박윤하/쉐어하우스_박윤하_003.wav',
    '00_voice_029': SND + '성우 샘플_장예나 성우님/박윤하/쉐어하우스_박윤하_006.wav',
    '00_voice_031': SND + '성우 샘플_장예나 성우님/류지혜/쉐어하우스_류지혜_008.wav',
    '00_voice_042': SND + '성우 샘플_장예나 성우님/류지혜/쉐어하우스_류지혜_011.wav',
    '00_voice_049': SND + '성우 샘플_장예나 성우님/류지혜/쉐어하우스_류지혜_017.wav',
    '00_voice_051': SND + '성우 샘플_장예나 성우님/홍세은/쉐어하우스_홍세은_002.wav',
    '00_voice_059': SND + '성우 샘플_장예나 성우님/홍세은/쉐어하우스_홍세은_005.wav',
    '00_voice_064': SND + '성우 샘플_장예나 성우님/홍세은/쉐어하우스_홍세은_010.wav',
  },
};

/** 녹음 대본: 장 코드(00 튜토리얼, 01 지혜1 …)와 줄별 음성 파일명 */
export const VOICE_SCRIPT = {
  file: '01 기획/02 시나리오/00 메인 시나리오/250622 오디오 CSV용/비교 본.xlsx',
  sheet: 'Scripts',
};

/** 화자 → 이름표. 원본 CharacterName(한국어) 값으로 찾는다. color = 플레이 영상의 이름표 색. */
export const SPEAKERS = {
  '<PlayerName>': { id: 'player' },
  '류지혜': { id: 'jihye', name: { ko: '류지혜', en: 'Jihye', ja: '日和' }, color: '#ECB363' },
  '홍세은': { id: 'saeun', name: { ko: '홍세은', en: 'Saeun', ja: '紗夜' }, color: '#7AD3E5' },
  '박윤하': { id: 'yunha', name: { ko: '박윤하', en: 'Yunha', ja: '静香' }, color: '#B67AE5' },
  '엄마': { id: 'mom', name: { ko: '엄마', en: 'Mom', ja: 'お母さん' }, color: '#191919' },
  '???': { id: 'unknown', name: { ko: '???', en: '???', ja: '???' }, color: '#191919' },
};

export const CHAPTERS = [
  {
    id: 'prologue',
    sheet: '9000(수정 완)',
    ja: 'sheet',
    voiceCode: '00',
    stage: {
      0: { bg: 'black', bgm: 'crossed' },
      11: { bg: 'home-room', bgm: 'refreshing' },
      20: { fx: 'shake', sfx: 'door' },
      43: { bg: 'apartment' },
      45: { bgm: null },
      47: { sfx: 'knock' },
      50: { bg: 'black', sfx: 'doorlock' },
      51: { bg: 'living-day', bgm: 'welcome' },
      52: { show: { jihye: 'smile' }, at: { jihye: 0.745 } },
      53: { face: { jihye: 'worry' }, at: { jihye: 0.62 } },
      54: { face: { jihye: 'smile' } },
      56: { face: { jihye: 'worry' } },
      61: { face: { jihye: 'cry' }, fx: 'shake' },
      63: { hide: ['jihye'], fx: 'shake', sfx: 'door' },
      71: { show: { yunha: 'base' } },
      82: { face: { yunha: 'closed' } },
      84: { face: { yunha: 'base' } },
      87: { face: { yunha: 'closed' } },
      89: { face: { yunha: 'base' } },
      92: { show: { saeun: 'base' } },
      98: { sfx: 'door' },
      99: { show: { jihye: 'happy' } },
      102: { face: { jihye: 'interest' } },
      112: { face: { yunha: 'stern' } },
      116: { face: { yunha: 'base' } },
      119: { hide: ['yunha'], sfx: 'doorlock' },
      123: { face: { saeun: 'tired' } },
      124: { face: { jihye: 'happy' } },
      126: { face: { jihye: 'smile' } },
      134: { face: { jihye: 'interest' } },
      137: { face: { saeun: 'base' } },
      138: { face: { jihye: 'awkward' } },
      139: { face: { jihye: 'worry' } },
      141: { face: { jihye: 'cry' }, fx: 'shake' },
      142: { fx: 'shake', sfx: 'crash' },
      146: { face: { saeun: 'tired' } },
      147: { face: { jihye: 'happy' } },
      148: { face: { saeun: 'base' } },
      149: { face: { jihye: 'awkward' } },
      150: { face: { jihye: 'smile' } },
      151: { fx: 'shake', sfx: 'crash' },
      152: { face: { jihye: 'cry' } },
      153: { face: { saeun: 'tired' } },
      154: { face: { jihye: 'awkward' } },
      155: { hide: ['jihye'], sfx: 'doorlock' },
      156: { at: { saeun: 0.5 } },
      178: { face: { saeun: 'tired' } },
      183: { face: { saeun: 'base' } },
      184: { face: { saeun: 'tired' } },
      188: { face: { saeun: 'base' } },
      191: { face: { saeun: 'grin' } },
      195: { face: { saeun: 'base' } },
      196: { face: { saeun: 'pout' } },
      200: { face: { saeun: 'tired' } },
      202: { face: { saeun: 'base' } },
      205: { face: { saeun: 'tired' } },
      206: { face: { saeun: 'base' } },
      210: { hide: 'all' },
    },
  },
  {
    id: 'jihye',
    sheet: '1000(수정 완)',
    ja: 'csv',
    csv: 'Scenario1000.csv',
    voiceCode: '01',
    stage: {
      0: { bg: 'living-day', bgm: 'refreshing' },
      9: { sfx: 'doorlock' },
      11: { stand: 'jihye/happy' },
      12: { face: 'interest' },
      16: { face: 'smile' },
      20: { face: 'awkward' },
      25: { face: 'worry' },
      26: { face: 'cry' },
      27: { face: 'worry' },
      28: { face: 'smile' },
      29: { face: 'interest' },
      33: { face: 'happy' },
      34: { face: 'smile' },
      37: { face: 'interest' },
      39: { face: 'smile' },
      41: { face: 'happy' },
      42: { face: 'worry' },
      43: { fx: 'shake', sfx: 'splat' },
      46: { face: 'awkward' },
      48: { face: 'interest' },
      50: { face: 'happy' },
      51: { face: 'interest' },
      52: { face: 'worry' },
      53: { fx: 'shake', sfx: 'crash' },
      57: { face: 'smile' },
      61: { face: 'happy' },
      // 63·64 는 빈 행(게임에서 ECG 전환 자리). 65~79 를 요리 CG 위에서 보여 준다.
      63: { ecg: 'jihye-cooking', stand: null },
      80: { ecg: null },
      82: { stand: 'jihye/smile' },
      87: { face: 'interest' },
      88: { face: 'smile' },
      92: { face: 'interest' },
      96: { face: 'smile' },
      97: { face: 'happy' },
      98: { face: 'grin' },
      99: { face: 'smile' },
      104: { face: 'interest' },
      106: { face: 'smile' },
      111: { face: 'grin' },
      114: { face: 'smile' },
      115: { face: 'happy' },
      119: { face: 'worry' },
      120: { face: 'awkward' },
      122: { face: 'smile' },
      124: { face: 'interest' },
      125: { face: 'smile' },
      127: { face: 'happy' },
      128: { face: 'grin' },
      129: { face: 'happy' },
      130: { face: 'interest' },
      133: { face: 'happy' },
      134: { sfx: 'phone' },
      135: { face: 'interest' },
      136: { face: 'happy' },
      138: { face: 'interest' },
      141: { face: 'worry' },
      143: { face: 'cry', fx: 'shake' },
      144: { face: 'awkward' },
      145: { face: 'smile' },
      148: { stand: null },
    },
  },
  {
    id: 'saeun',
    sheet: '3020(수정 완)',
    ja: 'csv',
    csv: 'Scenario3020.csv',
    voiceCode: '09',
    stage: {
      0: { bg: 'room-night', bgm: 'early-spring' },
      10: { bg: 'living-night', sfx: 'door' },
      12: { stand: 'saeun/surprised' },
      14: { face: 'base' },
      19: { face: 'grin' },
      26: { face: 'surprised' },
      28: { face: 'pout' },
      30: { face: 'tired' },
      32: { face: 'base' },
      34: { face: 'tired' },
      36: { face: 'base' },
      37: { bg: 'room-night', stand: null },
      43: { bg: 'saeun-room-night', sfx: 'door' },
      44: { stand: 'saeun/tired' },
      45: { face: 'base' },
      47: { face: 'tired' },
      48: { face: 'base' },
      55: { face: 'tired' },
      59: { face: 'base' },
      60: { face: 'grin' },
      64: { face: 'startled' },
      66: { face: 'surprised' },
      69: { face: 'tired' },
      70: { face: 'base' },
      73: { face: 'tired' },
      75: { face: 'pout' },
      77: { face: 'base' },
      78: { face: 'tired' },
      79: { face: 'base' },
      80: { face: 'pout' },
      81: { face: 'tired' },
      86: { face: 'base' },
      92: { face: 'grin' },
      94: { face: 'base' },
      97: { face: 'tired' },
      98: { face: 'base' },
      100: { face: 'startled' },
      101: { face: 'tired' },
      103: { face: 'base' },
      106: { face: 'pout' },
      111: { face: 'base' },
      113: { face: 'tired' },
      115: { face: 'startled', fx: 'shake' },
      117: { face: 'tired' },
      119: { face: 'base' },
      123: { face: 'startled' },
      125: { sfx: 'typing' },
      127: { face: 'base' },
      132: { face: 'tired' },
      133: { face: 'base' },
      137: { face: 'grin' },
      139: { face: 'base' },
      148: { face: 'tired' },
      153: { face: 'base' },
      159: { face: 'pout' },
      161: { face: 'base' },
      163: { face: 'tired' },
    },
    // 3020 일본어 열은 구판 대본 기준으로 번역돼 한국어와 줄이 어긋나 있다(Scenario3020.csv 의 Text_Jp).
    // 수정본 한국어 행 순번 → CSV 일본어 행 순번. 문자열이면 그 값을 그대로 쓴다.
    jaMap: buildJaMap3020(),
  },
];

/** 원본 일본어가 없는 줄의 임시 번역(검수 필요). 화면에는 표시하지 않고 데이터에 draft 로 남긴다. */
export const JA_DRAFT = {
  saeun: {
    111: '韓国史なんて、冗談抜きで試験の1か月前からでも間に合います。',
    157: '何してるんですか。聞いてます？',
    158: 'うん⋯⋯でも、なんでこんなに教えてくれるの？',
    159: '別に大した理由じゃないですけど⋯⋯私、やりたいことができたとき、方向を教えてくれる人がいなかったんです。',
    160: 'お兄ちゃんがそんなにバカなのも分かります。何も知らないし、教えてくれる人もいなかったんでしょうね。',
    161: 'それでも、挑戦してること自体がすごいんですよ。途方に暮れてるはずなのに。',
    162: '褒められてるのかけなされてるのか分からなくて、こみ上げかけた気持ちが引っ込んだ。',
    163: 'とにかく、集中して聞いてください。二度は言いませんから。',
    164: 'そうして、紗夜と一緒に勉強に励んだ。',
  },
};

function buildJaMap3020() {
  const m = {};
  const run = (from, to, offset) => {
    for (let n = from; n <= to; n++) m[n] = n + offset;
  };
  run(0, 10, 0);
  run(12, 40, -1);
  m[43] = 'キィッ'; // 원본은 "きゃ"(오기)
  run(44, 46, -3);
  run(47, 76, -2); // CSV 44행 "(画面切り替え)" 은 수정본에 없음
  Object.assign(m, { 77: 78, 78: 77, 79: 75, 80: 76, 81: 79 }); // 수정본에서 줄 순서가 바뀐 구간
  run(82, 110, -1);
  // 111: 원본 없음 → JA_DRAFT
  run(112, 117, -2);
  m[118] = '⋯⋯'; // 수정본에서 대사가 "⋯" 로 바뀜
  run(119, 149, -2);
  m[125] = '（カタカタ）'; // 원본은 "ガチャ" 반복(오역)
  run(150, 152, -1);
  m[153] = 153;
  m[154] = 154;
  m[155] = 156;
  m[156] = 157;
  return m;
}
