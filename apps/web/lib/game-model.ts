import {
  getLocalizedArray,
  getLocalizedField,
  type Game,
  type GameSectionDB,
} from './supabase';
import { resolveBrand, type BrandId } from './brands';
import { dateKey } from './format';

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
  /** 가로형 이미지(목록·스트립·카드용) / 세로형 이미지(포스터) / 상세 히어로 배경 */
  wide: string;
  tall: string;
  hero: string;
  /** 출시 연도(예: "2024"). 아직 출시 전이면 undefined → 화면에서는 "Coming Soon" */
  year?: string;
};

export type StoreKind = 'steam' | 'stove' | 'itch' | 'web';
export type StoreLink = { name: string; url: string; kind: StoreKind };
/** 작품 전용 SNS(어드민 '스토어·SNS' 섹션에서 로고를 X / YouTube / Instagram 으로 고른 링크) */
export type SnsKind = 'x' | 'youtube' | 'instagram';
export type SnsLink = { name: string; url: string; kind: SnsKind };

export type StoryBlock = { id: string; title: string; body: string; kind: 'synopsis' | 'text' };
export type CreditGroup = { id: string; title: string; rows: { role: string; name: string }[] };
export type TimelineItem = { date: string; text: string };
export type VideoItem = { id: string; title: string; youtubeId: string; url: string };

export type GameDetailModel = GameCardModel & {
  officialUrl?: string;
  platforms: string[];
  story: StoryBlock[];
  credits: CreditGroup[];
  videos: VideoItem[];
  /** 이미지 캐러셀: 세로 포스터(커버) → 갤러리 섹션 이미지(올린 순서). 갤러리가 비어 있으면 배너를 대신 넣는다. */
  images: string[];
  stores: StoreLink[];
  sns: SnsLink[];
  release?: { date: string; label: string };
  /** 작품 정보의 "주요 전시": 연혁 중 전시·선정·수상 항목만(최신순, 최대 5개) */
  exhibitions: TimelineItem[];
};

const EMOJI = /[\p{Extended_Pictographic}️]/gu;
const clean = (s: string) => s.replace(EMOJI, '').replace(/\s+/g, ' ').trim();
const SYNOPSIS = /시놉시스|synopsis|あらすじ|줄거리|story|ストーリー/i;
const RELEASE = /출시|release|リリース|発売|launch/i;
const STEAM = /steam|스팀/i;
const EXHIBIT = /전시|선정|수상|쇼케이스|showcase|expo|exhibit|award|festival|페스|\bBIC\b|지스타|g-?star|展|受賞|選出|選定/i;
const NOT_EXHIBIT = /펀딩|funding|텀블벅|tumblbug|ファンディング/i;

function youtubeId(url: string): string {
  const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : url;
}

export function storeKind(name: string, url: string, icon?: string): StoreKind {
  // 어드민 '스토어' 섹션에서 고른 로고가 있으면 그것을 따른다.
  if (icon === 'steam' || icon === 'stove' || icon === 'itch') return icon;
  const hay = `${name} ${url}`;
  if (/steampowered|steam|스팀/i.test(hay)) return 'steam';
  if (/onstove|stove|스토브/i.test(hay)) return 'stove';
  if (/itch\.io|itch/i.test(hay)) return 'itch';
  return 'web';
}

/** 링크가 작품 SNS 인지 판별(로고 선택 우선, 없으면 주소로) */
export function snsKind(url: string, icon?: string): SnsKind | undefined {
  if (icon === 'x' || icon === 'twitter') return 'x';
  if (icon === 'youtube' || icon === 'instagram') return icon;
  if (icon) return undefined;
  if (/(^|\/\/|\.)(x|twitter)\.com\//i.test(url)) return 'x';
  if (/youtube\.com\/|youtu\.be\//i.test(url)) return 'youtube';
  if (/instagram\.com\//i.test(url)) return 'instagram';
  return undefined;
}

/** 한 작품의 섹션들에서 SNS 링크만 모은다(문의 페이지의 "작품별 SNS"도 이 함수를 쓴다). */
export function snsOf(rows: GameSectionDB[]): SnsLink[] {
  const out: SnsLink[] = [];
  for (const row of rows) {
    if (row.section_type !== 'store' || row.is_visible === false) continue;
    for (const l of row.store_links || []) {
      const kind = l.url ? snsKind(l.url, l.icon) : undefined;
      if (kind && !out.some((o) => o.url === l.url)) out.push({ name: l.name, url: l.url, kind });
    }
  }
  return out;
}

export const yearOf = (date?: string | null) => date?.match(/\d{4}/)?.[0];

function timelineItems(rows: GameSectionDB[], locale: string): TimelineItem[] {
  return rows
    .filter((r) => r.section_type === 'timeline')
    .flatMap((r) => r.timeline_items || [])
    .map((it) => ({
      date: it.date,
      text: clean(((it as Record<string, unknown>)[`event_${locale}`] as string) || it.event_ko || ''),
    }))
    .filter((it) => it.text);
}

/** 출시일: games.release_date → 연혁의 "출시" 항목(Steam 우선). */
function releaseOf(game: Game, items: TimelineItem[]): { date: string; label: string } | undefined {
  if (game.release_date) return { date: game.release_date.slice(0, 10), label: '' };
  const releases = items.filter((i) => RELEASE.test(i.text));
  const picked = releases.find((i) => STEAM.test(i.text)) || releases[0];
  return picked ? { date: picked.date, label: picked.text } : undefined;
}

/**
 * @param rows 이 작품의 game_sections(있으면 출시 연도를 계산한다)
 */
export function toCard(game: Game, locale: string, rows: GameSectionDB[] = []): GameCardModel {
  const brand = resolveBrand(game);
  // 엘리시안 작품은 가로 배너를, 하봄 작품은 캐주얼한 커버를 목록·카드의 대표 이미지로 쓴다(상세 히어로는 항상 배너).
  // 썸네일을 따로 올리면 목록·표지에서는 썸네일, 상세 히어로에서는 배너가 보인다(상세에서 썸네일 → 배너로 겹쳐 바뀜).
  const wide =
    (brand === 'habom'
      ? game.thumbnail_image || game.cover_image || game.banner_image
      : game.thumbnail_image || game.banner_image || game.cover_image) || '';
  const tall = game.cover_image || game.thumbnail_image || game.banner_image || '';
  const hero = game.banner_image || game.thumbnail_image || game.cover_image || '';
  const release = releaseOf(game, timelineItems(rows.filter((r) => r.game_id === game.id), locale));
  return {
    slug: game.slug,
    title: getLocalizedField(game, 'title', locale),
    series: getLocalizedField(game, 'series', locale),
    desc: getLocalizedField(game, 'description', locale),
    status: game.status,
    brand,
    genres: getLocalizedArray(game, 'genre', locale),
    wide,
    tall,
    hero,
    year: yearOf(release?.date),
  };
}

export function toDetail(game: Game, rows: GameSectionDB[], locale: string): GameDetailModel {
  const card = toCard(game, locale, rows);
  const story: StoryBlock[] = [];
  const credits: CreditGroup[] = [];
  const videos: VideoItem[] = [];
  const gallery: string[] = [];
  const stores: StoreLink[] = [];

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
        if (row.section_type === 'custom' && row.images?.length) gallery.push(...row.images);
        break;
      }
      case 'gallery':
        if (row.images?.length) gallery.push(...row.images);
        break;
      case 'video':
        if (row.video_url) {
          const id = youtubeId(row.video_url);
          videos.push({ id: row.id, title, youtubeId: id, url: `https://www.youtube.com/watch?v=${id}` });
        }
        break;
      case 'credits':
        if (row.credits?.length) credits.push({ id: row.id, title, rows: row.credits.filter((c) => c.role || c.name) });
        break;
      case 'store':
        (row.store_links || []).forEach((l) => {
          if (!l.url || snsKind(l.url, l.icon)) return; // SNS 는 snsOf 가 따로 모은다
          stores.push({ name: l.name, url: l.url, kind: storeKind(l.name, l.url, l.icon) });
        });
        break;
    }
  }

  // 스토어: games.steam_url 이 스토어 섹션에 없으면 맨 앞에 더한다.
  if (game.steam_url && !stores.some((s) => s.url === game.steam_url)) {
    stores.unshift({ name: 'Steam', url: game.steam_url, kind: 'steam' });
  }

  const items = timelineItems(rows, locale);
  const release = releaseOf(game, items);

  const exhibitions = items
    .filter((i) => EXHIBIT.test(i.text) && !RELEASE.test(i.text) && !NOT_EXHIBIT.test(i.text))
    .sort((a, b) => dateKey(b.date) - dateKey(a.date))
    .slice(0, 5);

  // 이미지: 세로 포스터를 맨 앞에 두고(세로 → 가로 → 가로 …), 갤러리 이미지를 올린 순서대로 잇는다.
  // 갤러리가 비어 있을 때만 배너를 넣는다(배너는 이미 히어로 배경으로 보이므로).
  const extra = [...(game.gallery_images || []), ...gallery].filter(Boolean);
  const images = Array.from(new Set([card.tall, ...(extra.length ? extra : [card.hero])].filter(Boolean)));

  return {
    ...card,
    officialUrl: game.official_url,
    platforms: game.platforms || [],
    story,
    credits,
    videos,
    images,
    stores,
    sns: snsOf(rows),
    release,
    exhibitions,
  };
}
