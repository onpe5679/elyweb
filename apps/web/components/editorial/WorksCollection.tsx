"use client";
import { useState } from "react";
import Link from "next/link";
import { gameImage, isHabomGame, type Game } from "@/lib/editorial";
import { getLocalizedField, getLocalizedArray } from "@/lib/supabase";

export default function WorksCollection({
  games,
  locale,
  full = false,
}: {
  games: Game[];
  locale: string;
  full?: boolean;
}) {
  const ko = locale === "ko",
    ja = locale === "ja";
  const [filter, setFilter] = useState("all");
  const series = Array.from(
    new Set(
      games.map((g) => getLocalizedField(g, "series", locale)).filter(Boolean),
    ),
  );
  const visible = games.filter(
    (g) =>
      filter === "all" || getLocalizedField(g, "series", locale) === filter,
  );
  const state = (s: string) =>
    s === "released"
      ? ko
        ? "출시작"
        : ja
          ? "発売中"
          : "Available"
      : ko
        ? "개발 중"
        : ja
          ? "開発中"
          : "In development";
  return (
    <div className={`works-collection ${full ? "works-full" : ""}`}>
      <div className="works-toolbar">
        <div
          className="works-filters"
          role="group"
          aria-label={ko ? "시리즈별 작품 보기" : "Filter stories by series"}
        >
          <button
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            {ko ? "모든 이야기" : ja ? "すべての物語" : "All stories"}{" "}
            <sup>{games.length.toString().padStart(2, "0")}</sup>
          </button>
          {series.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="works-toolbar-note">
          SELECTED WORKS, ONGOING WORLDS
        </span>
      </div>
      <div className="works-grid">
        {visible.map((game, i) => (
          <Link
            className={`work-entry ${i === 0 ? "work-entry-lead" : ""}`}
            key={game.id}
            href={`/${locale}/games/${game.slug}`}
          >
            <div className="work-art">
              <img
                src={gameImage(game, "banner")}
                alt={getLocalizedField(game, "title", locale)}
                loading="lazy"
              />
              <span className="work-number">
                {String(games.indexOf(game) + 1).padStart(2, "0")}
              </span>
              <span className="work-open" aria-hidden="true">
                ↗
              </span>
              <span className="work-art-caption">
                {isHabomGame(game)
                  ? "HABOM STUDIO"
                  : getLocalizedField(game, "series", "en") || "STUDIO ELYSIAN"}
              </span>
            </div>
            <div className="work-info">
              <div className="work-meta">
                <span>
                  {getLocalizedArray(game, "genre", locale)
                    .slice(0, 2)
                    .join(" · ")}
                </span>
                <span
                  className={`release-state ${game.status === "released" ? "released" : ""}`}
                >
                  <i />
                  {state(game.status)}
                </span>
              </div>
              <h3>{getLocalizedField(game, "title", locale)}</h3>
              <p>
                {getLocalizedField(game, "description", locale).replace(
                  /[“”「」<>]/g,
                  "",
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="empty-stories">
          {ko
            ? "아직 등록된 이야기가 없습니다."
            : ja
              ? "公開された作品はまだありません。"
              : "No stories have been published yet."}
        </p>
      )}
    </div>
  );
}
