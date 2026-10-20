import Link from "next/link";
import {
  getEditorialGames,
  isHabomGame,
  editorialLocale as l,
} from "@/lib/editorial";
import WorksCollection from "@/components/editorial/WorksCollection";
export const revalidate = 60;
export default async function GamesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const games = (await getEditorialGames()).filter((g) => !isHabomGame(g));
  return (
    <div className="collection-page editorial-container">
      <div className="collection-title">
        <div>
          <p className="eyebrow">THE ELYSIAN COLLECTION</p>
          <h1>
            {l(locale, "이야기 보관소", "Our stories", "物語のアーカイブ")}
            <span>.</span>
          </h1>
          <p>
            {l(
              locale,
              "어떤 세계에서, 당신의 다음 이야기를 시작할까요?",
              "Where will your next story begin?",
              "あなたの次の物語は、どの世界から？",
            )}
          </p>
        </div>
        <span className="collection-count">
          {String(games.length).padStart(2, "0")}
          <small>STORIES & COUNTING</small>
        </span>
      </div>
      <WorksCollection games={games} locale={locale} full />
      <div className="collection-habom">
        <p>
          {l(
            locale,
            "또 다른 설렘을 찾고 있다면.",
            "Looking for a different kind of story?",
            "別のときめきを探しているなら。",
          )}
        </p>
        <Link className="text-link" href={`/${locale}/habom`}>
          Habom Studio <span>↗</span>
        </Link>
      </div>
    </div>
  );
}
