/**
 * 하봄 대사·선택지 체험 — 시안용 예시 대본 (DRAFT SAMPLE)
 * ---------------------------------------------------------------------------
 * ! 이 파일의 대사·장면·엔딩은 시안을 위해 새로 쓴 예시이며 공식 게임 내용이 아닙니다.
 * ! 공식 시놉시스에 있는 사실만 사용했습니다:
 *     - 주인공은 서울의 셰어하우스로 이사 온 20대 무직 백수
 *     - 룸메이트 3명: 류지혜(활기차고 당찬), 박윤하(어른스럽지만 반전 매력), 홍세은(귀여우면서도 새침)
 * 실제 대본·캐릭터·분량·사운드가 제공되면 이 파일의 데이터만 교체하면 됩니다.
 *
 * 구조: 장면(Beat)의 그래프. 각 Beat 는 대사(lines)를 순서대로 보여 준 뒤 `next` 로 이어진다.
 *   - goto          : 다른 Beat 로
 *   - choice        : 선택지를 보여 주고, 고른 선택지의 `to` 로
 *   - resolveEnding : 지금까지의 선택(친밀도 합계)으로 엔딩 Beat 를 정한다
 *   - summary       : 엔딩 요약 카드
 * 모든 갈래는 `step` 0~7 을 한 번씩 지나므로 step 으로 진행률을 계산할 수 있다.
 */

export type Locale = 'ko' | 'en' | 'ja';
export type L10n = Record<Locale, string>;

export type Who = 'jihye' | 'yunha' | 'saeun';
export type SpeakerId = 'narrator' | 'me' | Who;
export type EndingId = 'jihye' | 'yunha' | 'saeun' | 'together';

export type ScriptLine = { speaker: SpeakerId; text: L10n };

export type ScriptOption = {
  id: string;
  label: L10n;
  /** 이 선택지로 가까워지는 룸메이트(친밀도 +1) */
  points: Who;
  to: string;
};

export type ScriptChoice = { id: string; prompt: L10n; options: ScriptOption[] };

export type Next =
  | { type: 'goto'; to: string }
  | { type: 'choice'; choice: ScriptChoice }
  | { type: 'resolveEnding' }
  | { type: 'summary' };

export type Beat = {
  id: string;
  /** 진행률 계산용 단계(0 ~ TOTAL_STEPS-1). 어느 갈래든 단계마다 Beat 가 하나씩 있다. */
  step: number;
  lines: ScriptLine[];
  next: Next;
  /** 엔딩 Beat 이면 어떤 엔딩인지 */
  ending?: EndingId;
};

export type Ending = { id: EndingId; title: L10n; summary: L10n; beat: string };

const L = (ko: string, en: string, ja: string): L10n => ({ ko, en, ja });
const line = (speaker: SpeakerId, ko: string, en: string, ja: string): ScriptLine => ({ speaker, text: L(ko, en, ja) });

/* -------------------------------------------------------------------------- */
/* 등장인물                                                                     */
/* -------------------------------------------------------------------------- */

export const SPEAKERS: Record<SpeakerId, { name?: L10n }> = {
  narrator: {},
  me: { name: L('나', 'Me', '私') },
  jihye: { name: L('류지혜', 'Ryu Jihye', 'リュ・ジヘ') },
  yunha: { name: L('박윤하', 'Park Yunha', 'パク・ユンハ') },
  saeun: { name: L('홍세은', 'Hong Saeun', 'ホン・セウン') },
};

/** 공식 시놉시스에 소개된 룸메이트 3명(이름 + 한 줄 성격). 화면 곳곳에서 같이 쓴다. */
export const ROOMMATES: { id: Who; name: L10n; trait: L10n }[] = [
  {
    id: 'jihye',
    name: SPEAKERS.jihye.name!,
    trait: L('활기차고 당찬 성격', 'Lively and spirited', '活発で気丈な性格'),
  },
  {
    id: 'yunha',
    name: SPEAKERS.yunha.name!,
    trait: L('어른스럽지만 반전 매력이 있는', 'Mature, with a surprising charm', '大人っぽいけれど意外な魅力がある'),
  },
  {
    id: 'saeun',
    name: SPEAKERS.saeun.name!,
    trait: L('귀여우면서도 새침한', 'Cute, but a little prickly', 'かわいいけれど、ちょっとツンとした'),
  },
];

/* -------------------------------------------------------------------------- */
/* 장면                                                                         */
/* -------------------------------------------------------------------------- */

export const START = 'arrive';
export const TOTAL_STEPS = 8;
export const TOTAL_CHOICES = 3;

const BEATS: Beat[] = [
  /* 0 · 도착 ------------------------------------------------------------- */
  {
    id: 'arrive',
    step: 0,
    lines: [
      line(
        'narrator',
        '서울의 어느 골목 끝. 캐리어 하나를 끌고 도착한 곳은 낡았지만 따뜻해 보이는 셰어하우스다.',
        "The far end of an alley in Seoul. Suitcase in tow, I've arrived at a share house that looks worn, but warm.",
        'ソウルの路地の突き当たり。キャリーケース一つを引いてたどり着いたのは、古びているけれど温かそうなシェアハウスだった。'
      ),
      line(
        'me',
        '열심히 사는 사람들만 있으니 보고 배워 오라고 했지……. 일단 초인종부터.',
        'They said everyone here works hard, and I should watch and learn... Doorbell first, I guess.',
        '頑張ってる人ばかりだから見習ってこい、って言われたっけ……。まずはチャイムから。'
      ),
      line(
        'narrator',
        '딩동. 문이 열리기도 전에 안쪽에서 우다다 달려오는 발소리가 들린다.',
        'Ding-dong. Before the door even opens, I hear footsteps come pounding down the hall.',
        'ピンポン。ドアが開くより先に、中からドタドタと駆けてくる足音が聞こえる。'
      ),
    ],
    next: { type: 'goto', to: 'meet' },
  },

  /* 1 · 첫 만남 → 선택 1 -------------------------------------------------- */
  {
    id: 'meet',
    step: 1,
    lines: [
      line(
        'jihye',
        '어서 와요! 오늘 들어온다던 새 룸메이트 맞죠? 얼마나 기다렸다고요!',
        "Welcome! You're the new housemate moving in today, right? We've been waiting forever!",
        'いらっしゃい！ 今日入居する新しいルームメイトだよね？ ずっと待ってたんだから！'
      ),
      line(
        'yunha',
        '지혜 씨, 현관에서 그렇게 몰아붙이면 놀라시잖아요. ……들어오세요. 짐은 거기 두시면 돼요.',
        "Jihye, you'll startle them rushing at the door like that. ...Come in. You can leave your bags right there.",
        'ジヘさん、玄関でそんなに詰め寄ったら驚かせちゃいますよ。……どうぞ上がってください。荷物はそこに置いて大丈夫です。'
      ),
      line(
        'saeun',
        '……사람이 한 명 늘었네. 일단 인사는 할게. 안녕.',
        '...One more person. Fine, I guess I should say hello. Hi.',
        '……一人増えたんだ。……一応、あいさつはしておく。こんにちは。'
      ),
      line(
        'narrator',
        "거실 한가운데 상 위에 피자와 치킨이 차려져 있고, 벽에는 'Welcome!!' 현수막이 걸려 있다.",
        "A pizza-and-chicken spread sits on the table in the middle of the living room, and a 'Welcome!!' banner hangs on the wall.",
        'リビングの真ん中のテーブルにはピザとチキンが並び、壁には「Welcome!!」の横断幕が掛かっている。'
      ),
      line(
        'jihye',
        '자, 일단 앉아요! 자기소개부터 해 볼까요?',
        'Come on, sit down! Why don’t we start with introductions?',
        'さあ、とりあえず座って！ まずは自己紹介からいこう！'
      ),
    ],
    next: {
      type: 'choice',
      choice: {
        id: 'c1',
        prompt: L('어떻게 자기소개를 할까?', 'How do I introduce myself?', 'どう自己紹介する？'),
        options: [
          {
            id: 'c1_honest',
            points: 'yunha',
            to: 'c1_honest',
            label: L(
              '솔직하게 말한다 — "요즘은… 무직 백수입니다."',
              'Be honest — "Lately, I\'m... unemployed."',
              '正直に話す —「最近は……無職です。」'
            ),
          },
          {
            id: 'c1_energy',
            points: 'jihye',
            to: 'c1_energy',
            label: L(
              '기세 좋게 외친다 — "오늘부터 이 집 분위기 메이커입니다!"',
              'Say it with gusto — "As of today, I\'m this house\'s mood maker!"',
              '勢いよく叫ぶ —「今日からこの家のムードメーカーです！」'
            ),
          },
          {
            id: 'c1_quiet',
            points: 'saeun',
            to: 'c1_quiet',
            label: L(
              '작게 인사하며 편의점 과자 봉지를 내민다',
              'Greet quietly and hold out a bag of convenience-store snacks',
              '小さくあいさつして、コンビニのお菓子の袋を差し出す'
            ),
          },
        ],
      },
    },
  },

  /* 2 · 선택 1 반응 ------------------------------------------------------- */
  {
    id: 'c1_honest',
    step: 2,
    lines: [
      line(
        'yunha',
        '솔직하게 말해 주셔서 마음이 놓이네요. 그런 사람이 같이 지내기 편하거든요.',
        "I'm relieved you were so honest. People like that are easy to live with.",
        '正直に話してくれて安心しました。そういう人とは一緒に暮らしやすいんです。'
      ),
      line(
        'jihye',
        '오오, 용기 있는 자기소개! 괜찮아요, 같이 살면서 천천히 해결해 봐요!',
        "Ooh, what a brave introduction! It's fine, we'll figure it out together, little by little!",
        'おお、勇気ある自己紹介！ 大丈夫、一緒に暮らしながらゆっくり何とかしよう！'
      ),
      line(
        'saeun',
        '……자랑할 일은 아닌 것 같은데. 뭐, 솔직한 건 인정.',
        "...Not exactly something to brag about. Well, I'll give you credit for being honest.",
        '……自慢するようなことじゃないと思うけど。まあ、正直なのは認めてあげる。'
      ),
    ],
    next: { type: 'goto', to: 'kitchen' },
  },
  {
    id: 'c1_energy',
    step: 2,
    lines: [
      line(
        'jihye',
        '오, 마음에 들어요! 분위기 메이커는 내가 이미 하고 있는데, 같이 하면 두 배!',
        "Oh, I like you! I'm already the mood maker here, but with two of us it's double!",
        'お、気に入った！ ムードメーカーは私がもうやってるけど、二人ならダブルだね！'
      ),
      line(
        'yunha',
        '후후……. 이 집이 조금 더 시끌벅적해지겠네요.',
        'Hehe... this house is about to get a little louder.',
        'ふふ……。この家、ちょっとだけにぎやかになりそうですね。'
      ),
      line(
        'saeun',
        '……시끄러운 사람이 두 명이 됐네.',
        '...So now there are two loud people.',
        '……うるさい人が二人になっちゃった。'
      ),
    ],
    next: { type: 'goto', to: 'kitchen' },
  },
  {
    id: 'c1_quiet',
    step: 2,
    lines: [
      line(
        'saeun',
        '……그거, 내가 제일 좋아하는 과자잖아. 우연이지? 우연이겠지.',
        "...That's my favourite snack. A coincidence, right? It has to be.",
        '……それ、私がいちばん好きなお菓子なんだけど。偶然だよね？ 偶然でしょ。'
      ),
      line(
        'jihye',
        '오, 선물이다! 센스 있는데요? 세은이 표정이 살짝 풀렸어요!',
        'Oh, a gift! Nice touch! Saeun’s face just softened a little!',
        'お、プレゼントだ！ センスあるじゃん！ セウンの表情がちょっとゆるんだよ！'
      ),
      line(
        'saeun',
        '풀린 적 없거든! ……고마워.',
        "It did not! ...Thanks.",
        'ゆるんでない！ ……ありがとう。'
      ),
    ],
    next: { type: 'goto', to: 'kitchen' },
  },

  /* 3 · 저녁 → 선택 2 ----------------------------------------------------- */
  {
    id: 'kitchen',
    step: 3,
    lines: [
      line(
        'narrator',
        "피자 상자가 비고, 창밖엔 어느새 저녁노을이 들었다. 냉장고 옆 화이트보드에는 '당번표'가 붙어 있다.",
        'The pizza boxes are empty, and evening light has crept in through the window. A chore chart is stuck to the whiteboard beside the fridge.',
        'ピザの箱が空になり、いつの間にか窓の外は夕焼けだ。冷蔵庫の横のホワイトボードには「当番表」が貼ってある。'
      ),
      line(
        'jihye',
        '우리 집은 당번제예요! 오늘은 환영 기념으로 쉬어도 되지만… 뭐라도 하나 도와줄래요?',
        'We run on a chore rota here! You can rest today as a welcome gift, but... want to help with something?',
        'この家は当番制なの！ 今日は歓迎ってことで休んでもいいけど……何か一つ手伝ってくれる？'
      ),
      line(
        'narrator',
        '싱크대에서는 세은이 투덜대며 설거지를 하고, 윤하는 차를 끓이고, 지혜는 볼 영화를 고르는 중이다.',
        'Saeun grumbles at the sink as she washes up, Yunha brews tea, and Jihye is busy picking a movie to watch.',
        'シンクではセウンがぶつぶつ言いながら洗い物をして、ユンハはお茶を淹れ、ジヘは観る映画を選んでいる。'
      ),
    ],
    next: {
      type: 'choice',
      choice: {
        id: 'c2',
        prompt: L('무엇을 도울까?', 'What should I help with?', '何を手伝おう？'),
        options: [
          {
            id: 'c2_dishes',
            points: 'saeun',
            to: 'c2_dishes',
            label: L(
              '설거지하는 세은 옆에서 그릇을 닦는다',
              'Dry dishes next to Saeun at the sink',
              '洗い物をするセウンの隣で食器を拭く'
            ),
          },
          {
            id: 'c2_tea',
            points: 'yunha',
            to: 'c2_tea',
            label: L(
              '차를 끓이는 윤하와 함께 찻잔을 나른다',
              'Carry the cups with Yunha, who is brewing tea',
              'お茶を淹れるユンハと一緒にカップを運ぶ'
            ),
          },
          {
            id: 'c2_movie',
            points: 'jihye',
            to: 'c2_movie',
            label: L(
              '영화를 고르는 지혜 곁에 앉는다',
              'Sit by Jihye, who is picking a movie',
              '映画を選ぶジヘの隣に座る'
            ),
          },
        ],
      },
    },
  },

  /* 4 · 선택 2 반응 ------------------------------------------------------- */
  {
    id: 'c2_dishes',
    step: 4,
    lines: [
      line(
        'saeun',
        '……뭐 하는 거야. 이건 내가 하던 건데.',
        '...What are you doing? I was doing that.',
        '……何してるの。それ、私がやってたのに。'
      ),
      line(
        'me',
        '같이 하면 더 빨리 끝나잖아.',
        "It'll be done faster if we do it together.",
        '二人でやったほうが早く終わるでしょ。'
      ),
      line(
        'saeun',
        '……그럼 거품은 내가 낼 테니까, 헹구는 건 알아서 해. 대충 하면 알지?',
        "...Then I'll do the suds and you rinse. And don't you dare do it sloppily.",
        '……じゃあ泡立てるのは私がやるから、すすぎはそっちでね。雑にやったら許さないから。'
      ),
    ],
    next: { type: 'goto', to: 'night' },
  },
  {
    id: 'c2_tea',
    step: 4,
    lines: [
      line(
        'yunha',
        '고마워요. 차는 따뜻할 때 마셔야 제맛이거든요.',
        'Thank you. Tea only tastes right while it’s warm.',
        'ありがとうございます。お茶は温かいうちが一番おいしいんです。'
      ),
      line(
        'yunha',
        '……그런데 그 찻잔, 제가 제일 아끼는 거예요. 깨뜨리면… 후후, 농담이에요. 아마도요.',
        "...By the way, that cup is my favourite. If you drop it... hehe, just kidding. Probably.",
        '……ところで、そのカップ、私のお気に入りなんです。割ったら……ふふ、冗談です。たぶん。'
      ),
      line(
        'me',
        '(……두 손으로 조심조심 들어야겠다.)',
        '(...I am carrying this with both hands.)',
        '（……両手で慎重に持とう。）'
      ),
    ],
    next: { type: 'goto', to: 'night' },
  },
  {
    id: 'c2_movie',
    step: 4,
    lines: [
      line(
        'jihye',
        '오, 같이 볼래요? 제 추천작은 99퍼센트 재밌어요!',
        'Oh, want to watch together? My pick is 99 percent fun, guaranteed!',
        'お、一緒に観る？ 私のおすすめは99パーセント面白いよ！'
      ),
      line('me', '나머지 1퍼센트는요?', 'And the other 1 percent?', '残りの1パーセントは？'),
      line(
        'jihye',
        '……보는 사람 몫이죠!',
        "...That's up to the viewer!",
        '……観る人次第ってこと！'
      ),
    ],
    next: { type: 'goto', to: 'night' },
  },

  /* 5 · 밤 → 선택 3 ------------------------------------------------------- */
  {
    id: 'night',
    step: 5,
    lines: [
      line(
        'narrator',
        '불이 하나둘 꺼지고, 낯선 방의 낯선 천장 아래에 눕는다. 문 너머로 집 안의 소리가 들려온다.',
        'The lights go out one by one. I lie down under an unfamiliar ceiling in an unfamiliar room, listening to the house through the door.',
        '明かりが一つ、また一つ消えていく。見知らぬ部屋の見知らぬ天井の下に横になり、ドアの向こうから家の音が聞こえてくる。'
      ),
      line(
        'me',
        '서울에서의 첫날이 이렇게 끝나는구나. ……내일은 뭘 해 볼까.',
        "So that's how my first day in Seoul ends. ...What should I try tomorrow?",
        'ソウルでの初日はこうして終わるのか。……明日は何をしてみよう。'
      ),
    ],
    next: {
      type: 'choice',
      choice: {
        id: 'c3',
        prompt: L('내일, 가장 먼저 하고 싶은 일은?', 'What do I want to do first tomorrow?', '明日、いちばん最初にやりたいことは？'),
        options: [
          {
            id: 'c3_walk',
            points: 'jihye',
            to: 'c3_walk',
            label: L(
              '일찍 일어나 지혜의 아침 산책에 따라나선다',
              "Wake up early and tag along on Jihye's morning walk",
              '早起きしてジヘの朝の散歩についていく'
            ),
          },
          {
            id: 'c3_snack',
            points: 'saeun',
            to: 'c3_snack',
            label: L(
              '편의점에서 세은 몫의 간식을 슬쩍 사 온다',
              "Slip out to the convenience store and quietly buy a snack for Saeun",
              'コンビニでこっそりセウンの分のおやつを買ってくる'
            ),
          },
          {
            id: 'c3_ask',
            points: 'yunha',
            to: 'c3_ask',
            label: L(
              '윤하에게 이 집의 하루 리듬을 더 물어본다',
              'Ask Yunha more about how a day runs in this house',
              'ユンハにこの家の一日の流れをもう少し聞いてみる'
            ),
          },
        ],
      },
    },
  },

  /* 6 · 선택 3 반응 ------------------------------------------------------- */
  {
    id: 'c3_walk',
    step: 6,
    lines: [
      line(
        'narrator',
        '다음 날 아침, 현관 앞. 운동화 끈을 묶던 지혜가 손을 흔든다.',
        'The next morning at the front door, Jihye waves as she ties her sneakers.',
        '翌朝、玄関先。スニーカーの紐を結んでいたジヘが手を振る。'
      ),
      line(
        'jihye',
        '진짜 나왔네요! 좋아요, 오늘은 동네 한 바퀴 투어예요!',
        "You actually came! Great, today it's a tour of the whole neighbourhood!",
        'ほんとに来た！ いいね、今日は近所ぐるっとツアーだよ！'
      ),
    ],
    next: { type: 'resolveEnding' },
  },
  {
    id: 'c3_snack',
    step: 6,
    lines: [
      line(
        'narrator',
        '다음 날 아침, 식탁 위에 편의점 봉지를 슬쩍 올려 둔다.',
        'The next morning, I quietly leave a convenience-store bag on the dining table.',
        '翌朝、ダイニングテーブルの上にコンビニの袋をそっと置いておく。'
      ),
      line(
        'saeun',
        '……이게 뭐야. 누가 이런 거 사 달랬어. ……잘 먹을게.',
        "...What's this? Nobody asked for this. ...Thanks for the snack.",
        '……何これ。誰も頼んでないんだけど。……いただきます。'
      ),
    ],
    next: { type: 'resolveEnding' },
  },
  {
    id: 'c3_ask',
    step: 6,
    lines: [
      line(
        'narrator',
        '다음 날 아침, 부엌. 윤하가 주전자를 올리며 당번표를 가리킨다.',
        'The next morning in the kitchen, Yunha puts the kettle on and points at the chore chart.',
        '翌朝のキッチン。ユンハはケトルを火にかけながら、当番表を指さす。'
      ),
      line(
        'yunha',
        '아침은 보통 이 시간에 먹어요. 천천히 익숙해지면 돼요. ……물론 지혜 씨의 아침 소음은 감수하셔야 하지만요.',
        "Breakfast is usually about now. Take your time getting used to things. ...Though you'll have to put up with Jihye's morning noise.",
        '朝ごはんはだいたいこの時間です。ゆっくり慣れていけば大丈夫。……ただ、ジヘさんの朝のにぎやかさは覚悟してくださいね。'
      ),
    ],
    next: { type: 'resolveEnding' },
  },

  /* 7 · 엔딩(4가지) ------------------------------------------------------- */
  {
    id: 'end_jihye',
    step: 7,
    ending: 'jihye',
    lines: [
      line(
        'narrator',
        '며칠 뒤. 이 집의 아침은 지혜의 목소리로 시작해서, 지혜의 웃음소리로 끝난다.',
        "A few days later. Mornings in this house start with Jihye's voice and end with Jihye's laughter.",
        '数日後。この家の朝は、ジヘの声で始まり、ジヘの笑い声で終わる。'
      ),
      line(
        'jihye',
        '있잖아요, 이 집에 오길 잘했죠? 나 오늘도 계획 엄청 많아요! 같이 가요!',
        "Admit it, you're glad you moved in, right? I've got a ton of plans today too! Come with me!",
        'ねえ、この家に来て正解だったでしょ？ 今日も予定がいっぱいなの！ 一緒に行こう！'
      ),
      line(
        'me',
        '……정신없는데, 이상하게 싫지 않다.',
        "...It's chaotic, but strangely, I don't mind.",
        '……慌ただしいけれど、不思議と悪くない。'
      ),
    ],
    next: { type: 'summary' },
  },
  {
    id: 'end_yunha',
    step: 7,
    ending: 'yunha',
    lines: [
      line(
        'narrator',
        '며칠 뒤. 밤이 깊은 거실에는 주전자 소리만 작게 울린다.',
        'A few days later. Deep in the night, only the soft hiss of a kettle fills the living room.',
        '数日後。夜更けのリビングに、ケトルの小さな音だけが響いている。'
      ),
      line(
        'yunha',
        '오늘은 어땠어요? ……말하기 어려우면 차부터 마셔요. 천천히 들을게요.',
        "How was your day? ...If it's hard to say, have some tea first. I'll listen, no rush.",
        '今日はどうでしたか？ ……話しにくかったら、まずお茶をどうぞ。ゆっくり聞きますから。'
      ),
      line(
        'me',
        '따뜻한 잔을 두 손으로 감싸 쥐었다. 이 집에, 생각보다 오래 있고 싶어졌다.',
        'I wrap both hands around the warm cup. I find myself wanting to stay in this house longer than I expected.',
        '温かいカップを両手で包む。この家に、思っていたより長くいたくなってきた。'
      ),
    ],
    next: { type: 'summary' },
  },
  {
    id: 'end_saeun',
    step: 7,
    ending: 'saeun',
    lines: [
      line(
        'narrator',
        '며칠 뒤. 거실 구석 소파가 세은의 자리라는 걸 알게 됐다. 그 옆에 슬쩍 앉아도 이제는 쫓겨나지 않는다.',
        "A few days later. I've learned the corner of the sofa is Saeun's spot. I can sit beside it now without being chased away.",
        '数日後。リビングの隅のソファがセウンの定位置だと分かった。その隣にそっと座っても、もう追い払われない。'
      ),
      line(
        'saeun',
        '……앉아도 되긴 하는데, 말은 걸지 마. ……아, 그 과자는 같이 먹어도 돼.',
        "...You can sit, but don't talk to me. ...Oh, and you can share those snacks.",
        '……座ってもいいけど、話しかけないで。……あ、そのお菓子は一緒に食べてもいいよ。'
      ),
      line(
        'me',
        '가시 끝에 달린 작은 인사. 오늘은 그걸로 충분하다.',
        'A small hello at the tip of the thorns. For today, that is enough.',
        'とげの先に添えられた小さなあいさつ。今日はそれで十分だ。'
      ),
    ],
    next: { type: 'summary' },
  },
  {
    id: 'end_together',
    step: 7,
    ending: 'together',
    lines: [
      line(
        'narrator',
        '며칠 뒤. 외출하려고 신발을 신는데, 현관 앞으로 세 사람이 차례차례 모여든다.',
        'A few days later. As I put on my shoes to head out, the three of them gather one after another at the front door.',
        '数日後。出かけようと靴を履いていると、玄関先に三人が次々と集まってきた。'
      ),
      line('jihye', '어디 가요? 나도 갈래요!', "Where are you going? I'm coming too!", 'どこ行くの？ 私も行く！'),
      line(
        'yunha',
        '혼자 들기엔 짐이 많을 거예요. 저도 같이 갈게요.',
        "That'll be too much to carry alone. I'll come along.",
        '一人で持つには多いと思います。私も一緒に行きますね。'
      ),
      line(
        'saeun',
        '……나도. 사야 할 게 있어서. 우연히 같은 방향이야.',
        '...Me too. I have something to buy. We just happen to be going the same way.',
        '……私も。買うものがあるから。たまたま同じ方向なだけ。'
      ),
    ],
    next: { type: 'summary' },
  },
];

export const BEAT_MAP: Record<string, Beat> = Object.fromEntries(BEATS.map((b) => [b.id, b]));

/* -------------------------------------------------------------------------- */
/* 엔딩                                                                         */
/* -------------------------------------------------------------------------- */

export const ENDINGS: Ending[] = [
  {
    id: 'jihye',
    beat: 'end_jihye',
    title: L('소란스러워서 즐거운 하루', 'A Noisy, Happy Day', 'にぎやかで楽しい一日'),
    summary: L(
      '시끌벅적한 하루하루가 어느새 이 집의 일상이 되어 갑니다.',
      'Noisy days quietly turn into everyday life in this house.',
      'にぎやかな毎日が、いつの間にかこの家の日常になっていきます。'
    ),
  },
  {
    id: 'yunha',
    beat: 'end_yunha',
    title: L('조용히 번지는 찻잔의 온기', 'The Warmth of a Quiet Cup', '静かに広がるカップのぬくもり'),
    summary: L(
      '조용한 대화와 따뜻한 차가 이 집의 밤을 채워 갑니다.',
      'Quiet talks and warm tea begin to fill the nights of this house.',
      '静かな会話と温かいお茶が、この家の夜を満たしていきます。'
    ),
  },
  {
    id: 'saeun',
    beat: 'end_saeun',
    title: L('가시 끝의 작은 인사', 'A Small Hello Behind the Thorns', 'とげの先の小さなあいさつ'),
    summary: L(
      '가시 돋친 말 뒤에 숨은 작은 마음을 조금씩 알아 갑니다.',
      'You start to notice the small kindness hiding behind the prickly words.',
      'とげのある言葉の裏に隠れた小さな気持ちを、少しずつ知っていきます。'
    ),
  },
  {
    id: 'together',
    beat: 'end_together',
    title: L('다 같이 현관 앞에서', 'All Together at the Door', 'みんなで玄関先で'),
    summary: L(
      '한 사람만이 아니라, 이 집 사람들 모두와 가까워진 하루입니다.',
      "A day where you've grown close not to just one person, but to everyone in the house.",
      '誰か一人ではなく、この家のみんなと近づいた一日です。'
    ),
  },
];

export const ENDING_MAP: Record<EndingId, Ending> = Object.fromEntries(ENDINGS.map((e) => [e.id, e])) as Record<EndingId, Ending>;

export type Tally = Record<Who, number>;
export const emptyTally = (): Tally => ({ jihye: 0, yunha: 0, saeun: 0 });

/**
 * 선택 3번의 친밀도 합계로 엔딩을 정한다.
 *   - 한 룸메이트가 2점 이상이면 그 사람의 엔딩
 *   - 1:1:1 이면 모두와 함께하는 엔딩
 */
export function resolveEnding(tally: Tally): EndingId {
  const order: Who[] = ['jihye', 'yunha', 'saeun'];
  const top = order.reduce((a, b) => (tally[b] > tally[a] ? b : a));
  return tally[top] >= 2 ? top : 'together';
}

/** 시안 점검용: 스크립트 그래프가 끊기지 않았는지, 모든 엔딩에 도달할 수 있는지 확인한다. */
export function validateScript(): string[] {
  const problems: string[] = [];
  const reachable = new Set<string>();
  const stack = [START];
  while (stack.length) {
    const id = stack.pop()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    const b = BEAT_MAP[id];
    if (!b) {
      problems.push(`missing beat: ${id}`);
      continue;
    }
    if (b.next.type === 'goto') stack.push(b.next.to);
    if (b.next.type === 'choice') b.next.choice.options.forEach((o) => stack.push(o.to));
    if (b.next.type === 'resolveEnding') ENDINGS.forEach((e) => stack.push(e.beat));
  }
  ENDINGS.forEach((e) => {
    if (!reachable.has(e.beat)) problems.push(`unreachable ending: ${e.id}`);
  });
  return problems;
}
