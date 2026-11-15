// 웹 데모 연출표 — 사람이 손으로 정한 값.
//
// 원본 대본(CSV/xlsx)에는 배경·스탠딩·표정 열이 없어서, 대사 내용과 게임 UI 목업을 보고 여기서 정했다.
// 키 = 대본 시트의 "데이터 행 순번"(머리글 다음 행이 0). ScriptIndex 는 시트에 따라 중복·누락이 있어 쓰지 않는다.
//
// 지시어(모두 선택, 다음 지시가 나올 때까지 유지):
//   bg:    배경 id (ASSETS.bg)
//   stand: 'jihye/smile' 처럼 캐릭터/표정, null 이면 내림
//   face:  지금 서 있는 캐릭터의 표정만 바꿈
//   ecg:   이벤트 CG id, null 이면 내림(ECG 가 떠 있는 동안 스탠딩은 가린다)
//   fx:    'shake' (한 번만)
//   sfx:   효과음 id (한 번만). 지금은 소리를 넣지 않고 데이터에만 남긴다 — docs/sharehouse-demo.md 참고.

/** 원본 → 웹용 파일. build-images.mjs 가 이 표를 보고 쓰는 것만 변환한다. 경로는 `02 그래픽/` 기준. */
export const ASSETS = {
  bg: {
    'living-evening': { src: '01 배경/#1 아파트 거실/소스/#01-거실 (저녁) 조명OFF (배경O).png' },
    // 원본에는 밤 배경이 없어 톤 보정으로 만든 임시본(night 프리셋). 밤 배경이 나오면 src 만 바꾸고 tone 을 지운다.
    'living-night': { src: '01 배경/#1 아파트 거실/소스/#01-거실 (저녁) 조명OFF (배경O).png', tone: 'night-cool' },
    'room-night': { src: '01 배경/#3 주인공 방/#03-주인공방(낮).png', tone: 'night' },
    'saeun-room': { src: '01 배경/#99-세은이 방 추가본/#10-세은이 방 추가(저녁).png', tone: 'dim' },
  },
  ecg: {
    'jihye-cooking': { src: '00 ECG/99 IngameResource/지혜_요리_기본_보정.png' },
  },
  // 스탠딩 = 기본 몸(캔버스 2393×4700) + 표정 파츠(같은 캔버스). face 가 없으면 몸 그림의 표정 그대로.
  stand: {
    jihye: {
      body: '00 SCG/Jihye/지혜_잠옷_흥미_없음.png',
      faces: {
        interest: null,
        happy: '00 SCG/Jihye/Resource/Face/base.png',
        smile: '00 SCG/Jihye/Resource/Face/Smile.png',
        worry: '00 SCG/Jihye/Resource/Face/Fear.png',
        cry: '00 SCG/Jihye/Resource/Face/Panic_B.png',
        grin: '00 SCG/Jihye/Resource/Face/fatigue.png',
        awkward: '00 SCG/Jihye/Resource/Face/사연3.png',
      },
    },
    saeun: {
      body: '00 SCG/Saeun/세은_잠옷_기본_없음.png',
      faces: {
        base: null,
        grin: '00 SCG/Saeun/Resource/Face/Kidding.png',
        startled: '00 SCG/Saeun/Resource/Face/Panic.png',
        tired: '00 SCG/Saeun/Resource/Face/Tired.png',
        pout: '00 SCG/Saeun/Resource/Face/sad.png',
        surprised: '00 SCG/Saeun/Resource/Face/surprised.png',
        teary: '00 SCG/Saeun/Resource/Face/울음.png',
      },
    },
  },
  // 대기 화면(게임 타이틀 화면과 같은 구성)
  title: { src: '00 ECG/00 Special/메인화면 CG/메인화면 일러스트하늘X_인쇄용.png' },
  logo: { src: '03 etc/Logo/로고.png' },
};

/** 화자 → 이름표. 원본 CharacterName(한국어) 값으로 찾는다. color 는 게임 UI(TextNameSaeun.png)에서 뽑은 색 기준. */
export const SPEAKERS = {
  '<PlayerName>': { id: 'player' },
  '류지혜': { id: 'jihye', name: { ko: '류지혜', en: 'Jihye', ja: '日和' }, color: '#F7A35C' },
  '홍세은': { id: 'saeun', name: { ko: '홍세은', en: 'Saeun', ja: '紗夜' }, color: '#7BD4E7' },
  '???': { id: 'unknown', name: { ko: '???', en: '???', ja: '???' }, color: '#C9C2D6' },
};

export const CHAPTERS = [
  {
    id: 'jihye',
    sheet: '1000(수정 완)',
    csv: 'Scenario1000.csv',
    cast: 'jihye',
    stage: {
      0: { bg: 'living-evening' },
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
    csv: 'Scenario3020.csv',
    cast: 'saeun',
    stage: {
      0: { bg: 'room-night' },
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
      43: { bg: 'saeun-room', sfx: 'door' },
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
