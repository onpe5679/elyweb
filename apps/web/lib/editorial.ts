import { cache } from "react";
import {
  getGames,
  getGameBySlug,
  getGameSections,
  type Game,
} from "./supabase";

export type { Game, GameSection } from "./supabase";
export const getEditorialGames = cache(getGames);
export const getEditorialGame = cache(getGameBySlug);
export const getEditorialSections = cache(getGameSections);

export function isHabomGame(game: Game): boolean {
  return [game.series_ko, game.series_en, game.series_ja].some((value) =>
    /하봄|habom|ハボム/i.test(value || ""),
  );
}

// Local, compressed versions of the existing artwork. A changed CMS image still
// wins: only the original, known assets are replaced with these derivatives.
const artwork: Record<string, string> = {
  "371b19e8-1942-4426-9c5d-0a19ee60332c.png": "sharehouse-cover",
  "4c1af081-4e1c-49c6-95c0-12c8ec4d202a.png": "sharehouse-banner",
  "7bc75d95-55d7-42f8-9304-c0cf9d3304ae.png": "festival-not-over-cover",
  "1f8f6031-4925-4222-9e13-4e505ae2cb0d.png": "festival-not-over-banner",
  "b9c49688-36a2-409a-8bc4-529e7b9544d8.png": "memorial-circuit-cover",
  "f4acbf59-4819-4e9e-822f-aae29da3074a.png": "memorial-circuit-banner",
  "737f71ab-5247-4a68-9aa9-5afc0309b1d2.jpg": "cella-cover",
  "0b4bdfc9-2e65-4c03-bb6d-c5fc8eec3cee.jpg": "cella-banner",
  "bb03afc9-7f6b-41de-b703-c23806271526.png": "ibat-cover",
  "f6ab4dde-8079-4974-8cc8-019d9edc3ca4.jpg": "ibat-banner",
};

export function gameImage(
  game: Game,
  kind: "cover" | "banner" = "cover",
): string {
  const source =
    kind === "banner"
      ? game.banner_image || game.cover_image || game.thumbnail_image
      : game.cover_image || game.thumbnail_image || game.banner_image;
  if (!source) return "/images/editorial/hero-world.webp";
  const name = source.split("/").pop()?.split("?")[0] || "";
  return artwork[name] ? `/images/editorial/${artwork[name]}.webp` : source;
}

export function editorialLocale(
  locale: string,
  ko: string,
  en: string,
  ja: string,
): string {
  return locale === "en" ? en : locale === "ja" ? ja : ko;
}
