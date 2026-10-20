import { getGameLabel, type LabelId } from './labels';
import {
  getLocalizedArray,
  getLocalizedField,
  type Game,
  type GameSection,
} from './supabase';

// One reading order for every game page, whatever the label. Each block is filled from the
// existing CMS data (games row + game_sections) and simply disappears when it has no content.
export type GameSpec = {
  slug: string;
  label: LabelId;
  title: string;
  otherTitles: string[];
  logline: string;
  series: string;
  genres: string[];
  platforms: string[];
  developer: string;
  status: string;
  releaseDate: string;
  banner: string;
  cover: string;
  steamUrl: string;
  officialUrl: string;
  trailer: VideoItem | null;
  story: StoryBlock[];
  gallery: GalleryImage[];
  galleryIsKeyArt: boolean;
  videos: VideoItem[];
  credits: CreditGroup[];
  timeline: TimelineRow[];
  stores: StoreLink[];
};

export type StoryBlock = { id: string; title: string; paragraphs: string[]; images: string[] };
export type GalleryImage = { src: string; kind: 'banner' | 'cover' | 'gallery' };
export type VideoItem = { id: string; title: string; youtubeId: string };
export type CreditGroup = { id: string; title: string; rows: { role: string; name: string }[] };
export type TimelineRow = { date: string; text: string };
export type StoreLink = { label: string; url: string; kind: 'steam' | 'web' };

export function youtubeId(url?: string | null): string {
  if (!url) return '';
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : /^[\w-]{6,}$/.test(url) ? url : '';
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/​/g, '').trim())
    .filter(Boolean);
}

export function buildGameSpec(game: Game, sections: GameSection[], locale: string): GameSpec {
  const loc = (item: Record<string, unknown>, field: string) => getLocalizedField(item, field, locale);
  const title = loc(game, 'title');
  const otherTitles = Array.from(
    new Set(['ko', 'en', 'ja'].map((l) => getLocalizedField(game, 'title', l)).filter((t) => t && t !== title)),
  );

  const story: StoryBlock[] = [];
  const videos: VideoItem[] = [];
  const credits: CreditGroup[] = [];
  const timeline: TimelineRow[] = [];
  const stores: StoreLink[] = [];
  const galleryImages: string[] = [...(game.gallery_images || [])];

  for (const section of sections) {
    const c = section.content || {};
    const sTitle = loc(section, 'title');
    const text = (key: string) => {
      const v = c[`${key}_${locale}`] || c[`${key}_ko`];
      return typeof v === 'string' ? v : '';
    };
    switch (section.type) {
      case 'text':
      case 'info':
      case 'synopsis': {
        const body = ['lead', 'p1', 'p2', 'content', 'quote'].map(text).filter(Boolean).join('\n\n');
        if (body) story.push({ id: section.id, title: sTitle, paragraphs: splitParagraphs(body), images: [] });
        break;
      }
      case 'custom': {
        const body = text('content');
        const images = Array.isArray(c.images) ? (c.images as string[]) : [];
        if (body || images.length) story.push({ id: section.id, title: sTitle, paragraphs: splitParagraphs(body), images });
        break;
      }
      case 'gallery':
        galleryImages.push(...((c.images as string[]) || []));
        break;
      case 'video': {
        const id = youtubeId(c.youtube_id as string);
        if (id) videos.push({ id: section.id, title: sTitle || 'Video', youtubeId: id });
        break;
      }
      case 'credits': {
        const rows = ((c.credits as { role: string; name: string }[]) || []).filter((r) => r.role || r.name);
        if (rows.length) credits.push({ id: section.id, title: sTitle, rows });
        break;
      }
      case 'timeline': {
        const items = (c.items as { date: string; text_ko?: string; text_en?: string; text_ja?: string }[]) || [];
        for (const it of items) {
          const t = (it[`text_${locale}` as 'text_ko'] || it.text_ko || '').trim();
          if (t) timeline.push({ date: it.date, text: t });
        }
        break;
      }
      case 'store':
        for (const link of (c.links as { label: string; url: string }[]) || []) {
          if (link.url) stores.push({ label: link.label, url: link.url, kind: /steampowered/.test(link.url) ? 'steam' : 'web' });
        }
        break;
    }
  }

  if (!timeline.length) {
    for (const it of game.project_timeline || []) {
      const t = getLocalizedField(it as Record<string, unknown>, 'title', locale);
      if (t) timeline.push({ date: it.date, text: t });
    }
  }

  if (game.steam_url && !stores.some((s) => s.url === game.steam_url)) {
    stores.unshift({ label: 'Steam', url: game.steam_url, kind: 'steam' });
  }
  if (game.official_url && !stores.some((s) => s.url === game.official_url)) {
    stores.push({ label: 'Official Site', url: game.official_url, kind: 'web' });
  }

  const trailerId = youtubeId(game.trailer_url);
  const trailer = trailerId
    ? videos.find((v) => v.youtubeId === trailerId) || { id: 'trailer', title: 'Trailer', youtubeId: trailerId }
    : videos[0] || null;
  if (trailer && !videos.some((v) => v.youtubeId === trailer.youtubeId)) videos.unshift(trailer);

  const banner = game.banner_image || game.cover_image || '';
  const cover = game.cover_image || game.banner_image || '';
  // Until cut-scenes/screenshots are uploaded, the gallery shows the official key art only.
  const galleryIsKeyArt = galleryImages.length === 0;
  const gallery: GalleryImage[] = galleryIsKeyArt
    ? Array.from(new Set([banner, cover].filter(Boolean))).map((src) => ({ src, kind: src === cover && src !== banner ? 'cover' : 'banner' }))
    : Array.from(new Set(galleryImages)).map((src) => ({ src, kind: 'gallery' }));

  return {
    slug: game.slug,
    label: getGameLabel(game),
    title,
    otherTitles,
    logline: loc(game, 'description'),
    series: loc(game, 'series'),
    genres: getLocalizedArray(game, 'genre', locale).length
      ? getLocalizedArray(game, 'genre', locale)
      : getLocalizedArray(game, 'genre', 'ko'),
    platforms: game.platforms || [],
    developer: game.developer || '',
    status: game.status,
    releaseDate: game.release_date || '',
    banner,
    cover,
    steamUrl: game.steam_url || '',
    officialUrl: game.official_url || '',
    trailer,
    story,
    gallery,
    galleryIsKeyArt,
    videos,
    credits,
    timeline,
    stores,
  };
}
