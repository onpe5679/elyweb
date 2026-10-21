import {
  getLocalizedArray,
  getLocalizedField,
  type Game,
  type GameSectionDB,
} from './supabase';
import { resolveBrand, type BrandId } from './brands';

/**
 * 작품 목록/상세가 공통으로 읽는 "화면용 모델".
 * DB 의 games + game_sections 를 한 규격으로 정리한다. 담당자는 어드민에서 아래 슬롯에 맞춰 채우면 된다
 * (슬롯 설명: docs/game-detail-spec.md).
 */

export type GameStatus = 'released' | 'coming_soon' | 'in_development' | 'publishing' | string;

export type GameCardModel = {
  slug: string;
  title: string;
  series: string;
  desc: string;
  status: GameStatus;
  brand: BrandId;
  genres: string[];
  /** 가로형 이미지(배너 우선) / 세로형 이미지(커버 우선) */
  wide: string;
  tall: string;
};

export function toCard(game: Game, locale: string): GameCardModel {
  const wide = game.banner_image || game.thumbnail_image || game.cover_image || '';
  const tall = game.cover_image || game.thumbnail_image || game.banner_image || '';
  return {
    slug: game.slug,
    title: getLocalizedField(game, 'title', locale),
    series: getLocalizedField(game, 'series', locale),
    desc: getLocalizedField(game, 'description', locale),
    status: game.status,
    brand: resolveBrand(game),
    genres: getLocalizedArray(game, 'genre', locale),
    wide,
    tall,
  };
}

export type StoryBlock = { id: string; title: string; body: string; kind: 'synopsis' | 'text' };
export type CreditGroup = { id: string; title: string; rows: { role: string; name: string }[] };
export type TimelineGroup = { id: string; title: string; items: { date: string; text: string }[] };
export type VideoItem = { id: string; title: string; youtubeId: string; url: string };
export type GalleryGroup = { id: string; title: string; images: string[] };

export type GameDetailModel = GameCardModel & {
  steamUrl?: string;
  officialUrl?: string;
  platforms: string[];
  story: StoryBlock[];
  credits: CreditGroup[];
  timeline: TimelineGroup[];
  videos: VideoItem[];
  gallery: GalleryGroup[];
  keyArt: string[];
  stores: { name: string; url: string }[];
  release?: { date: string; label: string };
  keyStaff: { role: string; name: string }[];
};

const EMOJI = /[\p{Extended_Pictographic}️]/gu;
const clean = (s: string) => s.replace(EMOJI, '').replace(/\s+/g, ' ').trim();
const SYNOPSIS = /시놉시스|synopsis|あらすじ|줄거리|story|ストーリー/i;
const RELEASE = /출시|release|リリース|発売|launch/i;
const STEAM = /steam|스팀/i;

function youtubeId(url: string): string {
  const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : url;
}

export function toDetail(game: Game, rows: GameSectionDB[], locale: string): GameDetailModel {
  const card = toCard(game, locale);
  const story: StoryBlock[] = [];
  const credits: CreditGroup[] = [];
  const timeline: TimelineGroup[] = [];
  const videos: VideoItem[] = [];
  const gallery: GalleryGroup[] = [];
  const stores: { name: string; url: string }[] = [];

  const pick = (row: GameSectionDB, base: 'title' | 'content') =>
    ((row as Record<string, unknown>)[`${base}_${locale}`] as string) ||
    ((row as Record<string, unknown>)[`${base}_ko`] as string) ||
    '';

  for (const row of rows) {
    const title = pick(row, 'title');
    switch (row.section_type) {
      case 'text':
      case 'custom': {
        const body = pick(row, 'content').trim();
        if (body) story.push({ id: row.id, title, body, kind: SYNOPSIS.test(title) ? 'synopsis' : 'text' });
        if (row.section_type === 'custom' && row.images?.length) gallery.push({ id: row.id, title, images: row.images });
        break;
      }
      case 'gallery':
        if (row.images?.length) gallery.push({ id: row.id, title, images: row.images });
        break;
      case 'video':
        if (row.video_url) {
          const id = youtubeId(row.video_url);
          videos.push({ id: row.id, title, youtubeId: id, url: `https://www.youtube.com/watch?v=${id}` });
        }
        break;
      case 'credits':
        if (row.credits?.length) credits.push({ id: row.id, title, rows: row.credits });
        break;
      case 'timeline':
        if (row.timeline_items?.length) {
          timeline.push({
            id: row.id,
            title,
            items: row.timeline_items.map((it) => ({
              date: it.date,
              text: clean(
                ((it as Record<string, unknown>)[`event_${locale}`] as string) || it.event_ko || ''
              ),
            })),
          });
        }
        break;
      case 'store':
        (row.store_links || []).forEach((l) => stores.push({ name: l.name, url: l.url }));
        break;
    }
  }

  // 스토어: 전용 섹션이 없으면 games.steam_url 로 대신한다.
  if (!stores.length && game.steam_url) stores.push({ name: 'Steam', url: game.steam_url });

  // 출시일: 연혁 중 "출시" 항목(Steam 우선)
  const releases = timeline.flatMap((g) => g.items).filter((i) => RELEASE.test(i.text));
  const picked = releases.find((i) => STEAM.test(i.text)) || releases[0];
  const release = picked ? { date: picked.date, label: picked.text } : undefined;

  // 키아트: 서로 다른 이미지가 2장 이상일 때만 "도판" 섹션으로 보여 준다(없는 이미지를 만들지 않는다).
  const keyArt = Array.from(new Set([card.wide, card.tall].filter(Boolean)));

  return {
    ...card,
    steamUrl: game.steam_url,
    officialUrl: game.official_url,
    platforms: game.platforms || [],
    story,
    credits,
    timeline,
    videos,
    gallery,
    keyArt,
    stores,
    release,
    keyStaff: (credits[0]?.rows || []).slice(0, 4),
  };
}
