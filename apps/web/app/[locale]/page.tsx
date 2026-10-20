import Link from "next/link";
import OpeningScene from "@/components/editorial/OpeningScene";
import WorksCollection from "@/components/editorial/WorksCollection";
import {
  getEditorialGames,
  isHabomGame,
  editorialLocale as l,
} from "@/lib/editorial";
import {
  getHomeTimelineEvents,
  getLocalizedField,
  getSettings,
} from "@/lib/supabase";
export const revalidate = 60;

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [games, events, settings] = await Promise.all([
    getEditorialGames(),
    getHomeTimelineEvents(),
    getSettings(["hero_image"]),
  ]);
  const studioGames = games.filter((g) => !isHabomGame(g));
  const configuredHero = settings.hero_image?.value_ko;
  const hero =
    !configuredHero ||
    configuredHero.includes("bc794a86-e714-4942-8acf-9930e12b5a5d")
      ? "/images/editorial/hero-world.webp"
      : configuredHero;
  return (
    <div className="editorial-home">
      <OpeningScene locale={locale} image={hero} />
      <section
        className="studio-manifesto editorial-container"
        aria-labelledby="manifesto-title"
      >
        <div className="section-marker">
          <span>01 / OUR PHILOSOPHY</span>
          <span className="small-cross" aria-hidden="true">
            ✳
          </span>
        </div>
        <div className="manifesto-content">
          <p className="eyebrow">FOR STORY-LOVERS, BY STORYTELLERS</p>
          <h2 id="manifesto-title">
            {l(
              locale,
              "이야기를 사랑하는 당신에게.",
              "For those who live for stories.",
              "物語を愛する、あなたへ。",
            )}
          </h2>
          <div className="manifesto-columns">
            <p>
              {l(
                locale,
                "한 장의 그림이 세계가 되고, 한 줄의 문장이 당신의 기억이 될 때. 스튜디오 엘리시안은 이야기의 힘을 믿습니다.",
                "When a drawing becomes a world, and a sentence becomes a memory. At Studio Elysian, we believe in the power of stories.",
                "一枚の絵が世界になり、一行の言葉があなたの記憶になる。スタジオエリシアンは、物語の力を信じています。",
              )}
            </p>
            <p>
              {l(
                locale,
                "일러스트, 음악, 그리고 당신의 선택으로 완성되는 이야기. 서로 다른 세계 속에서 오래 머물고 싶은 순간을 만듭니다.",
                "Illustration, music, and the choices you make. We create moments you’ll want to linger in, across worlds waiting to be discovered.",
                "イラスト、音楽、そしてあなたの選択。異なる世界のなかで、いつまでも留まりたくなる瞬間をつくります。",
              )}
            </p>
          </div>
          <Link className="text-link" href={`/${locale}/about`}>
            {l(
              locale,
              "스튜디오 알아보기",
              "Meet the studio",
              "スタジオについて",
            )}{" "}
            <span>↗</span>
          </Link>
        </div>
      </section>
      <section
        id="stories"
        className="stories-section editorial-container"
        aria-labelledby="stories-title"
      >
        <div className="section-marker">
          <span>02 / SELECTED STORIES</span>
          <span>THE COLLECTION</span>
        </div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {l(
                locale,
                "서로 다른 세계, 이어지는 이야기",
                "DIFFERENT WORLDS, CONNECTED STORIES",
                "異なる世界、つながる物語",
              )}
            </p>
            <h2 id="stories-title">
              {l(
                locale,
                "우리가 펼치는 이야기",
                "The stories we tell",
                "私たちが紡ぐ物語",
              )}
              <span className="serif-heading-dot">.</span>
            </h2>
          </div>
          <Link href={`/${locale}/games`} className="text-link">
            {l(locale, "모든 작품", "All works", "すべての作品")}{" "}
            <span>↗</span>
          </Link>
        </div>
        <WorksCollection games={studioGames} locale={locale} />
      </section>
      <section className="interlude-section">
        <img src="/images/editorial/interlude.webp" alt="" loading="lazy" />
        <div className="interlude-shade" />
        <div className="editorial-container interlude-content">
          <span className="eyebrow">BEYOND THE LAST PAGE</span>
          <p>
            {l(
              locale,
              "마지막 장면이 끝나도,\n이야기는 남습니다.",
              "After the final scene,\nthe story stays.",
              "最後のシーンが終わっても、\n物語は続いていく。",
            )}
          </p>
          <span className="interlude-signature">Studio Elysian</span>
        </div>
      </section>
      <section className="habom-invitation editorial-container">
        <div className="habom-invite-title">
          <span className="eyebrow">ANOTHER SIDE OF OUR STORIES</span>
          <h2>
            {l(
              locale,
              "조금 더 가까운 설렘.",
              "A little closer to your heart.",
              "もっと身近な、ときめき。",
            )}
          </h2>
          <p>
            {l(
              locale,
              "일상에 찾아온 특별한 만남.\n하봄 스튜디오의 이야기를 만나보세요.",
              "Extraordinary encounters in everyday life.\nDiscover the stories of Habom Studio.",
              "日常に訪れる、特別な出会い。\nハボムスタジオの物語へ。",
            )}
          </p>
          <Link href={`/${locale}/habom`} className="text-link">
            {l(
              locale,
              "하봄 스튜디오로",
              "Visit Habom Studio",
              "ハボムスタジオへ",
            )}{" "}
            <span>↗</span>
          </Link>
        </div>
        <Link className="habom-invite-art" href={`/${locale}/habom`}>
          <img
            src="/images/editorial/sharehouse-cover.webp"
            alt={l(
              locale,
              "하봄 스튜디오, 어서오세요 셰어하우스에!",
              "Welcome to the Sharehouse, by Habom Studio",
              "ハボムスタジオのシェアハウス",
            )}
            loading="lazy"
          />
          <span className="habom-invite-stamp">
            habom<span>OUR SISTER STUDIO ↗</span>
          </span>
        </Link>
      </section>
      {events.length > 0 && (
        <section className="home-journal editorial-container">
          <div className="section-marker">
            <span>03 / FOOTNOTES</span>
            <span>OUR JOURNEY</span>
          </div>
          <div className="journal-layout">
            <div>
              <h2>
                {l(locale, "이야기의 발자취", "Along the way", "物語の足跡")}
              </h2>
              <Link href={`/${locale}/about#history`} className="text-link">
                {l(locale, "전체 연혁", "Our history", "これまでの歩み")}{" "}
                <span>↗</span>
              </Link>
            </div>
            <div className="journal-rows">
              {events
                .slice(-3)
                .reverse()
                .map((event) => (
                  <div key={event.id} className="journal-row">
                    <span>{event.date}</span>
                    <p>
                      {getLocalizedField(event, "title", locale).replace(
                        /🎮/g,
                        "",
                      )}
                    </p>
                    <span aria-hidden="true">＋</span>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
