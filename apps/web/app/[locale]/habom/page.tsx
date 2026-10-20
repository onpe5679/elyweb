import type { Metadata } from "next";
import Link from "next/link";
import { getEditorialGames, isHabomGame, gameImage } from "@/lib/editorial";
import { getLocalizedField, getLocalizedArray } from "@/lib/supabase";
import styles from "./habom.module.css";

const copy = {
  ko: {
    title: ["우리의 매일에,", "조금 더 두근."],
    introduction:
      "평범한 하루가 특별한 이야기가 되는 곳.\n하봄의 세계에 오신 걸 환영해요.",
    discover: "하봄의 이야기 만나기",
    featured: "지금, 만나볼 이야기",
    gamesTitle: ["좋아하는 마음,", "플레이할 시간."],
    gamesDescription: "어떤 만남은, 오래도록 마음에 남으니까.",
    viewGame: "이야기 들여다보기",
    released: "지금 만날 수 있어요",
    upcoming: "새로운 만남을 준비하고 있어요",
    aboutTitle: ["사소한 순간도", "좋아하게 될 거예요."],
    aboutText:
      "첫인사의 설렘, 뜻밖의 웃음, 조금 서툰 진심.\n하봄은 그 작은 순간들을 모아\n당신의 하루에 오래 남을 이야기를 만듭니다.",
    contact: "하봄에 이야기 건네기",
    elysian: "엘리시안의 다른 이야기들도 만나보세요.",
    returnLink: "스튜디오 엘리시안으로",
    empty: "새로운 이야기를 준비하고 있어요.",
  },
  en: {
    title: ["Everyday life,", "a little more heart."],
    introduction:
      "A place where ordinary days become extraordinary stories.\nWelcome to the world of Habom.",
    discover: "Discover our stories",
    featured: "Your next story",
    gamesTitle: ["Something to love.", "Time to play."],
    gamesDescription: "Some encounters stay with you for a long, long time.",
    viewGame: "Step into the story",
    released: "Ready to meet you",
    upcoming: "A new encounter is on its way",
    aboutTitle: ["Fall in love with", "the little things."],
    aboutText:
      "A first hello. An unexpected laugh. An honest, awkward confession.\nWe bring these little moments together\nto tell stories that stay with you.",
    contact: "Say hello to Habom",
    elysian: "There are more stories waiting at Elysian.",
    returnLink: "Visit Studio Elysian",
    empty: "A new story is on its way.",
  },
  ja: {
    title: ["いつもの毎日に、", "もう少し、ときめき。"],
    introduction:
      "何気ない毎日が、特別な物語になる場所。\nハボムの世界へようこそ。",
    discover: "ハボムの物語に出会う",
    featured: "今、出会える物語",
    gamesTitle: ["好きになる気持ち。", "遊びたくなる時間。"],
    gamesDescription: "ずっと心に残る出会いが、あるから。",
    viewGame: "物語をのぞいてみる",
    released: "今すぐ出会えます",
    upcoming: "新しい出会いを準備しています",
    aboutTitle: ["小さな瞬間も、", "好きになる。"],
    aboutText:
      "初めての挨拶、思いがけない笑顔、少し不器用な本音。\nハボムはその小さな瞬間を集めて、\nあなたの心に残る物語をつくります。",
    contact: "ハボムに話しかける",
    elysian: "エリシアンのほかの物語にも出会ってみませんか。",
    returnLink: "スタジオエリシアンへ",
    empty: "新しい物語を準備しています。",
  },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Bloom({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 120 120"
      fill="none"
    >
      <path
        d="M60 20C77-12 105 16 88 39c38-7 38 34 9 40 27 24-6 47-25 23-4 37-42 30-40-1C1 118-15 80 16 68-18 52 3 20 31 34 24-1 61-8 60 20Z"
        fill="currentColor"
      />
      <circle cx="53" cy="58" r="3.5" fill="#fff8dd" />
      <circle cx="72" cy="58" r="3.5" fill="#fff8dd" />
      <path
        d="M52 73c7 8 15 8 22-1"
        stroke="#fff8dd"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const title =
    params.locale === "ko"
      ? "하봄 스튜디오"
      : params.locale === "ja"
        ? "ハボムスタジオ"
        : "Habom Studio";
  return {
    title: `${title} — Studio Elysian`,
    description:
      copy[params.locale as keyof typeof copy]?.introduction ||
      copy.en.introduction,
  };
}

export default async function HabomPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = copy[locale as keyof typeof copy] || copy.en;
  const games = (await getEditorialGames()).filter(isHabomGame);
  const featured = games[0];

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="habom-heading">
        <div className={styles.brandLine}>
          <Link
            href={`/${locale}/habom`}
            className={styles.brand}
            aria-label={
              locale === "ko" ? "하봄 스튜디오 홈" : "Habom Studio home"
            }
          >
            <span>
              하봄<span className={styles.brandDot}>.</span>
            </span>
            <small>HABOM STUDIO</small>
          </Link>
          <span className={styles.brandNote}>
            A LITTLE MORE HEART,
            <br />A LITTLE MORE STORY.
          </span>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <span />
              HELLO, WE ARE HABOM!
            </span>
            <h1 id="habom-heading">
              {t.title[0]}
              <br />
              <span>{t.title[1]}</span>
            </h1>
            <p>{t.introduction}</p>
            <a href="#habom-games" className={styles.primaryButton}>
              {t.discover}
              <span>
                <Arrow />
              </span>
            </a>
            <div className={styles.heroFootnote}>
              <span>01 — STORIES WITH HEART</span>
              <svg aria-hidden="true" viewBox="0 0 90 44" fill="none">
                <path
                  d="M2 20C16 0 34 5 31 22c-3 13-23 12-22 0C10 9 38 1 59 17c10 8 13 14 26 11m-8-8 9 8-10 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImageWrap}>
              {featured && (
                <img
                  className={styles.heroImage}
                  src={gameImage(featured)}
                  alt={getLocalizedField(featured, "title", locale)}
                  fetchPriority="high"
                />
              )}
              <span className={styles.imageOutline} aria-hidden="true" />
            </div>
            <div className={styles.helloSticker} aria-hidden="true">
              <span>
                HELLO,
                <br />
                NEW STORY!
              </span>
              <span>✳</span>
            </div>
            {featured && (
              <Link
                href={`/${locale}/games/${featured.slug}`}
                className={styles.featuredLabel}
              >
                <span>
                  <small>{t.featured}</small>
                  <strong>
                    {getLocalizedField(featured, "title", locale)}
                  </strong>
                </span>
                <span className={styles.featuredArrow}>
                  <Arrow diagonal />
                </span>
              </Link>
            )}
            <span className={styles.cornerSpark} aria-hidden="true">
              ✳
            </span>
          </div>
        </div>
      </section>

      <div className={styles.ribbon} aria-hidden="true">
        <span>SMALL MOMENTS</span>
        <span>✳</span>
        <span>BIG FEELINGS</span>
        <span>✳</span>
        <span>STORIES BY HABOM</span>
        <span>✳</span>
        <span>SMALL MOMENTS</span>
        <span>✳</span>
        <span>BIG FEELINGS</span>
      </div>

      <section
        id="habom-games"
        className={styles.gamesSection}
        aria-labelledby="habom-games-heading"
      >
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>OUR LITTLE WORLDS</span>
            <h2 id="habom-games-heading">
              {t.gamesTitle[0]}
              <br />
              {t.gamesTitle[1]}
            </h2>
          </div>
          <p>{t.gamesDescription}</p>
        </div>
        <div className={styles.gamesList}>
          {games.map((game, index) => (
            <article className={styles.game} key={game.id}>
              <Link
                className={styles.gameArtwork}
                href={`/${locale}/games/${game.slug}`}
                aria-label={`${getLocalizedField(game, "title", locale)} — ${t.viewGame}`}
              >
                <img
                  src={gameImage(game, "banner")}
                  alt={getLocalizedField(game, "title", locale)}
                  loading="lazy"
                />
                <span className={styles.gameNumber}>
                  {String(index + 1).padStart(2, "0")}
                  <span> / HABOM</span>
                </span>
                <span className={styles.artworkArrow}>
                  <Arrow diagonal />
                </span>
              </Link>
              <div className={styles.gameInfo}>
                <div className={styles.gameStatus}>
                  <span />
                  {game.status === "released" ? t.released : t.upcoming}
                </div>
                <h3>
                  <Link href={`/${locale}/games/${game.slug}`}>
                    {getLocalizedField(game, "title", locale)}
                  </Link>
                </h3>
                <p>
                  {getLocalizedField(game, "description", locale).replace(
                    /^[“「]+|[」”]+$/g,
                    "",
                  )}
                </p>
                <div className={styles.tags}>
                  {getLocalizedArray(game, "genre", locale)
                    .slice(0, 3)
                    .map((genre) => (
                      <span key={genre}>{genre}</span>
                    ))}
                </div>
                <Link
                  href={`/${locale}/games/${game.slug}`}
                  className={styles.gameLink}
                >
                  {t.viewGame}
                  <Arrow />
                </Link>
              </div>
            </article>
          ))}
          {!games.length && <p>{t.empty}</p>}
        </div>
      </section>

      <section className={styles.about} aria-labelledby="habom-about-heading">
        <div className={styles.aboutDecor} aria-hidden="true">
          <Bloom />
          <span>
            MADE WITH
            <br />A LITTLE LOVE.
          </span>
        </div>
        <div className={styles.aboutCopy}>
          <span className={styles.eyebrow}>THIS IS OUR KIND OF STORY</span>
          <h2 id="habom-about-heading">
            {t.aboutTitle[0]}
            <br />
            {t.aboutTitle[1]}
          </h2>
          <p>{t.aboutText}</p>
          <Link href={`/${locale}/contact`} className={styles.contactLink}>
            {t.contact}
            <Arrow diagonal />
          </Link>
        </div>
        <span className={styles.aboutWord} aria-hidden="true">
          habom.
        </span>
      </section>

      <div className={styles.returnBar}>
        <p>{t.elysian}</p>
        <Link href={`/${locale}`}>
          {t.returnLink}
          <Arrow diagonal />
        </Link>
      </div>
    </div>
  );
}
