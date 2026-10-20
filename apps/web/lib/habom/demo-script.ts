// SAMPLE SCRIPT for the design mock-up of the Habom mini demo.
// It is NOT official game dialogue: only the three heroines' names and personalities come from
// the public synopsis. The team replaces `DEMO_SCRIPTS` with an approved demo script per game.

export type Speaker = 'jihye' | 'yunha' | 'saeun';
export type DemoLine = { speaker?: Speaker; text: string };
export type DemoNode = {
  lines: DemoLine[];
  choices?: { label: string; next: string }[];
  next?: string;
};
export type DemoScript = {
  speakers: Record<Speaker, string>;
  start: string;
  nodes: Record<string, DemoNode>;
};

const ko: DemoScript = {
  speakers: { jihye: '류지혜', yunha: '박윤하', saeun: '홍세은' },
  start: 'arrive',
  nodes: {
    arrive: {
      lines: [
        { text: '캐리어 하나를 끌고 셰어하우스 앞에 섰다. 초인종을 누르자마자 문이 활짝 열렸다.' },
        { speaker: 'jihye', text: '왔다! 오늘부터 같이 사는 신입 맞지? 들어와, 들어와!' },
        { speaker: 'yunha', text: '지혜야, 인사할 틈은 줘야지. …어서 와요. 방은 2층 끝이에요.' },
        { speaker: 'saeun', text: '…흥. 냉장고에 이름 안 쓴 건 먹어도 되는 걸로 알게.' },
        { text: '세 사람의 시선이 동시에 나에게 꽂혔다. 뭐라고 대답하지?' },
      ],
      choices: [
        { label: '“잘 부탁드립니다! 짐부터 풀어도 될까요?”', next: 'yunha' },
        { label: '“냉장고 규칙… 진짜예요?”', next: 'saeun' },
        { label: '“혹시 환영 파티 같은 건… 없죠?”', next: 'jihye' },
      ],
    },
    yunha: {
      lines: [
        { speaker: 'yunha', text: '착실하네요. 계단 조심해요, 세 번째 칸이 삐걱거리니까.' },
        { text: '올라가 보니, 세 번째 칸이 정말로 삐걱 소리를 냈다.' },
      ],
      next: 'outro',
    },
    saeun: {
      lines: [
        { speaker: 'saeun', text: '진짜야. 대신 내 푸딩은 건드리지 마. 그건 진짜로 진짜야.' },
        { speaker: 'jihye', text: '세은이 푸딩은 국가기밀급이거든~' },
      ],
      next: 'outro',
    },
    jihye: {
      lines: [
        { speaker: 'jihye', text: '없긴 왜 없어! 오늘 저녁은 피자다!' },
        { speaker: 'yunha', text: '…방금 정한 거죠?' },
      ],
      next: 'outro',
    },
    outro: {
      lines: [{ text: '이렇게, 조금 시끄러운 동거 생활이 시작됐다.' }],
    },
  },
};

const en: DemoScript = {
  speakers: { jihye: 'Jihye', yunha: 'Yunha', saeun: 'Saeun' },
  start: 'arrive',
  nodes: {
    arrive: {
      lines: [
        { text: 'I stood in front of the share house with a single suitcase. The door flew open the moment I rang.' },
        { speaker: 'jihye', text: "You made it! You're the new housemate, right? Come in, come in!" },
        { speaker: 'yunha', text: 'Jihye, let them say hello first. …Welcome. Your room is at the end of the second floor.' },
        { speaker: 'saeun', text: "…Hmph. Anything in the fridge without a name on it counts as fair game." },
        { text: 'All three of them were looking at me. What do I say?' },
      ],
      choices: [
        { label: '"Nice to meet you! Mind if I unpack first?"', next: 'yunha' },
        { label: '"Wait… is that fridge rule real?"', next: 'saeun' },
        { label: '"There isn\'t a welcome party… is there?"', next: 'jihye' },
      ],
    },
    yunha: {
      lines: [
        { speaker: 'yunha', text: 'How polite. Mind the stairs — the third step creaks.' },
        { text: 'On the way up, the third step really did creak.' },
      ],
      next: 'outro',
    },
    saeun: {
      lines: [
        { speaker: 'saeun', text: "It's real. But don't touch my pudding. That one's really real." },
        { speaker: 'jihye', text: "Saeun's pudding is basically a state secret~" },
      ],
      next: 'outro',
    },
    jihye: {
      lines: [
        { speaker: 'jihye', text: "Of course there is! Pizza tonight!" },
        { speaker: 'yunha', text: '…You just decided that, didn\'t you?' },
      ],
      next: 'outro',
    },
    outro: {
      lines: [{ text: 'And so began a slightly noisy life under one roof.' }],
    },
  },
};

const ja: DemoScript = {
  speakers: { jihye: 'ジヘ', yunha: 'ユナ', saeun: 'セウン' },
  start: 'arrive',
  nodes: {
    arrive: {
      lines: [
        { text: 'スーツケースひとつを引いて、シェアハウスの前に立った。チャイムを押した瞬間、ドアが勢いよく開いた。' },
        { speaker: 'jihye', text: '来た！今日から一緒に住む新人さんだよね？入って入って！' },
        { speaker: 'yunha', text: 'ジヘ、挨拶くらいさせてあげて。…いらっしゃい。部屋は2階の奥です。' },
        { speaker: 'saeun', text: '…ふん。冷蔵庫の名前が書いてないものは、食べていいってことで。' },
        { text: '三人の視線が一斉にこちらへ。なんて答えよう？' },
      ],
      choices: [
        { label: '「よろしくお願いします！先に荷ほどきしても？」', next: 'yunha' },
        { label: '「冷蔵庫のルール…本当なんですか？」', next: 'saeun' },
        { label: '「歓迎会なんて…ないですよね？」', next: 'jihye' },
      ],
    },
    yunha: {
      lines: [
        { speaker: 'yunha', text: 'しっかりしてますね。階段に気をつけて、三段目がきしむから。' },
        { text: '上ってみると、三段目は本当にきしんだ。' },
      ],
      next: 'outro',
    },
    saeun: {
      lines: [
        { speaker: 'saeun', text: '本当だよ。でも私のプリンには触らないで。それは本当に本当。' },
        { speaker: 'jihye', text: 'セウンのプリンは国家機密レベルだからね〜' },
      ],
      next: 'outro',
    },
    jihye: {
      lines: [
        { speaker: 'jihye', text: 'あるに決まってるでしょ！今夜はピザだよ！' },
        { speaker: 'yunha', text: '…今決めたでしょう？' },
      ],
      next: 'outro',
    },
    outro: {
      lines: [{ text: 'こうして、ちょっと騒がしい共同生活が始まった。' }],
    },
  },
};

// Scripts are keyed by game slug, so only games that ship a demo show the section.
export const DEMO_SCRIPTS: Record<string, Record<string, DemoScript>> = {
  sharehouse: { ko, en, ja },
};
