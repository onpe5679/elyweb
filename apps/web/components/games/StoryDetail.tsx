"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Game, GameSection } from "@/lib/supabase";
import { gameImage, isHabomGame } from "@/lib/editorial";
import DialogueExperience from "@/components/habom/DialogueExperience";
import styles from "./StoryDetail.module.css";

const messages = {
  ko: {
    collection: "작품집",
    story: "이야기",
    gallery: "아트워크",
    video: "영상",
    credits: "제작진",
    timeline: "발자취",
    trailer: "트레일러 보기",
    steam: "Steam에서 만나기",
    official: "공식 사이트",
    overview: "이야기의 시작",
    information: "작품 정보",
    genre: "장르",
    platform: "플랫폼",
    series: "시리즈",
    status: "출시 상태",
    released: "출시",
    coming_soon: "출시 예정",
    in_development: "개발 중",
    publishing: "퍼블리싱",
    close: "닫기",
    previous: "이전 이미지",
    next: "다음 이미지",
    enlarge: "크게 보기",
    play: "재생",
    related: "다음 페이지의 이야기",
    allWorks: "모든 작품 보기",
    artwork: "키비주얼",
    stores: "작품 만나기",
    imageOf: "이미지",
    back: "작품집으로 돌아가기",
    habom: "하봄 스튜디오",
  },
  en: {
    collection: "Collection",
    story: "Story",
    gallery: "Artwork",
    video: "Films",
    credits: "Credits",
    timeline: "Milestones",
    trailer: "Watch trailer",
    steam: "Explore on Steam",
    official: "Official website",
    overview: "Where the story begins",
    information: "Game information",
    genre: "Genre",
    platform: "Platforms",
    series: "Series",
    status: "Status",
    released: "Available now",
    coming_soon: "Coming soon",
    in_development: "In development",
    publishing: "Publishing",
    close: "Close",
    previous: "Previous image",
    next: "Next image",
    enlarge: "Enlarge",
    play: "Play",
    related: "The next chapter awaits",
    allWorks: "Explore all games",
    artwork: "Key visual",
    stores: "Find the game",
    imageOf: "Image",
    back: "Back to the collection",
    habom: "Habom Studio",
  },
  ja: {
    collection: "作品集",
    story: "物語",
    gallery: "アートワーク",
    video: "映像",
    credits: "クレジット",
    timeline: "歩み",
    trailer: "トレーラーを見る",
    steam: "Steamで見る",
    official: "公式サイト",
    overview: "物語のはじまり",
    information: "作品情報",
    genre: "ジャンル",
    platform: "プラットフォーム",
    series: "シリーズ",
    status: "発売状況",
    released: "発売中",
    coming_soon: "近日発売",
    in_development: "開発中",
    publishing: "パブリッシング",
    close: "閉じる",
    previous: "前の画像",
    next: "次の画像",
    enlarge: "拡大する",
    play: "再生",
    related: "次のページの物語",
    allWorks: "すべての作品を見る",
    artwork: "キービジュアル",
    stores: "作品を楽しむ",
    imageOf: "画像",
    back: "作品集へ戻る",
    habom: "ハボムスタジオ",
  },
};

type Labels = typeof messages.ko;
type Content = Record<string, unknown>;
type StoreLink = { label: string; url: string };
type Media =
  | { kind: "image"; images: string[]; index: number; title: string }
  | { kind: "video"; id: string; title: string };

function localized(item: object, field: string, locale: string): string {
  const source = item as Content;
  const value = source[`${field}_${locale}`] || source[`${field}_ko`];
  return typeof value === "string" ? value : "";
}

function localizedList(item: object, field: string, locale: string): string[] {
  const source = item as Content;
  const value = source[`${field}_${locale}`] || source[`${field}_ko`];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function imageList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is string => typeof entry === "string" && !!entry,
      )
    : [];
}

function externalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function youtubeId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : ["youtube.com", "youtube-nocookie.com", "m.youtube.com"].includes(
              host,
            )
          ? url.searchParams.get("v") ||
            url.pathname.split("/").filter(Boolean).pop()
          : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={back ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Play() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 4.8c0-.8.8-1.2 1.5-.8l12 7.2a1 1 0 0 1 0 1.7l-12 7.2c-.7.4-1.5-.1-1.5-.9V4.8Z" />
    </svg>
  );
}

function ExternalArrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {count !== undefined && (
        <span className={styles.sectionCount}>
          {String(count).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

function CopySection({
  section,
  locale,
  children,
}: {
  section: GameSection;
  locale: string;
  children?: React.ReactNode;
}) {
  const content = section.content || {};
  const title = localized(section, "title", locale);
  const paragraphs = ["lead", "p1", "p2", "content"]
    .map((key) => ({ key, value: localized(content, key, locale) }))
    .filter((item) => item.value);
  const quote = localized(content, "quote", locale);
  if (!paragraphs.length && !quote && !children) return null;
  return (
    <section className={styles.copySection} id={`section-${section.id}`}>
      {title && <h3>{title}</h3>}
      {paragraphs.map(({ key, value }) => (
        <p key={key} className={key === "lead" ? styles.lead : undefined}>
          {value}
        </p>
      ))}
      {quote && <blockquote>{quote}</blockquote>}
      {children}
    </section>
  );
}

export default function StoryDetail({
  game,
  sections,
  relatedGames,
  locale,
}: {
  game: Game;
  sections: GameSection[];
  relatedGames: Game[];
  locale: string;
}) {
  const t: Labels = messages[locale as keyof typeof messages] || messages.ko;
  const title = localized(game, "title", locale);
  const description = localized(game, "description", locale);
  const series = localized(game, "series", locale);
  const genres = localizedList(game, "genre", locale);
  const habom = isHabomGame(game);
  const banner = gameImage(game, "banner");
  const cover = gameImage(game, "cover");
  const collectionHref = `/${locale}/${habom ? "habom" : "games"}`;
  const availableSections = sections.filter(
    (section) => section.is_active !== false,
  );
  const narrative = availableSections.filter((section) =>
    ["text", "info", "synopsis", "custom"].includes(section.type),
  );
  const gallerySections = availableSections.filter(
    (section) =>
      section.type === "gallery" && imageList(section.content?.images).length,
  );
  const videos = availableSections.filter(
    (section) =>
      section.type === "video" &&
      (youtubeId(section.content?.youtube_id) ||
        externalUrl(section.content?.youtube_id) ||
        externalUrl(section.content?.video_url)),
  );
  const credits = availableSections.filter(
    (section) =>
      section.type === "credits" &&
      Array.isArray(section.content?.credits) &&
      section.content.credits.length,
  );
  const timelines = availableSections.filter(
    (section) =>
      section.type === "timeline" &&
      Array.isArray(section.content?.items) &&
      section.content.items.length,
  );
  const artwork = Array.from(new Set([banner, cover].filter(Boolean)));
  const trailer = videos.find((section) =>
    youtubeId(section.content?.youtube_id),
  );
  const storeLinks: StoreLink[] = [];
  if (externalUrl(game.steam_url))
    storeLinks.push({ label: "Steam", url: game.steam_url! });
  if (externalUrl(game.official_url))
    storeLinks.push({ label: t.official, url: game.official_url! });
  for (const section of availableSections.filter(
    (item) => item.type === "store",
  )) {
    const links = section.content?.links;
    if (Array.isArray(links))
      for (const link of links) {
        if (
          link &&
          typeof link === "object" &&
          externalUrl(link.url) &&
          !storeLinks.some((existing) => existing.url === link.url)
        ) {
          storeLinks.push({
            label: typeof link.label === "string" ? link.label : t.stores,
            url: link.url,
          });
        }
      }
  }
  const status = t[game.status as keyof Labels] || game.status;
  const [media, setMedia] = useState<Media | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isModalOpen = media !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isModalOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  const shiftImage = (offset: number) =>
    setMedia((current) =>
      current?.kind === "image"
        ? {
            ...current,
            index:
              (current.index + offset + current.images.length) %
              current.images.length,
          }
        : current,
    );

  function renderGallery(images: string[], galleryTitle: string) {
    return (
      <div className={styles.galleryGrid} data-count={images.length}>
        {images.map((src, index) => (
          <button
            type="button"
            className={styles.galleryItem}
            key={`${src}-${index}`}
            onClick={() =>
              setMedia({ kind: "image", images, index, title: galleryTitle })
            }
            aria-label={`${galleryTitle} ${index + 1} — ${t.enlarge}`}
          >
            <div className={styles.galleryImage}>
              <img
                src={src}
                alt={`${title} — ${galleryTitle} ${index + 1}`}
                loading="lazy"
              />
              <span className={styles.expandIcon} aria-hidden="true">
                ↗
              </span>
            </div>
            <span className={styles.galleryCaption}>
              <span>{galleryTitle}</span>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <article className={`${styles.page} ${habom ? styles.habom : ""}`}>
      <header className={styles.hero}>
        <div className={styles.heroArtwork} data-testid="game-banner">
          {banner && <img src={banner} alt="" fetchPriority="high" />}
        </div>
        <div className={styles.heroShade} />
        <div className={styles.heroTop}>
          <Link href={collectionHref} className={styles.breadcrumb}>
            <Arrow back />
            {habom ? t.habom : t.collection}
          </Link>
          <span className={styles.heroEdition}>
            STORIES TO REMEMBER <span>—</span> {habom ? "HABOM" : "ELYSIAN"}
          </span>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <div className={styles.heroKicker}>
              <span>{habom ? "HABOM STUDIO" : "STUDIO ELYSIAN"}</span>
              <i aria-hidden="true" />
              <span>{status}</span>
            </div>
            <h1>{title}</h1>
            {genres.length > 0 && (
              <p className={styles.heroGenres}>{genres.join(" · ")}</p>
            )}
            {description && (
              <p className={styles.heroDescription}>{description}</p>
            )}
            <div className={styles.heroActions}>
              {trailer && (
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() =>
                    setMedia({
                      kind: "video",
                      id: youtubeId(trailer.content.youtube_id)!,
                      title: localized(trailer, "title", locale) || t.trailer,
                    })
                  }
                >
                  <Play />
                  {t.trailer}
                </button>
              )}
              {storeLinks[0] && (
                <a
                  className={
                    trailer ? styles.outlineButton : styles.primaryButton
                  }
                  href={storeLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {storeLinks[0].label === "Steam"
                    ? t.steam
                    : storeLinks[0].label}
                  <ExternalArrow />
                </a>
              )}
              {!trailer && !storeLinks.length && (
                <a className={styles.outlineButton} href="#story">
                  {t.story}
                  <Arrow />
                </a>
              )}
            </div>
          </div>
          {cover && cover !== banner && (
            <button
              className={styles.poster}
              type="button"
              onClick={() =>
                setMedia({
                  kind: "image",
                  images: [cover],
                  index: 0,
                  title: t.artwork,
                })
              }
              aria-label={`${title} — ${t.artwork} ${t.enlarge}`}
            >
              <img src={cover} alt={`${title} — ${t.artwork}`} />
              <span>
                {t.artwork}
                <ExternalArrow />
              </span>
            </button>
          )}
        </div>
        <a className={styles.scrollHint} href="#story">
          <span>EXPLORE THE STORY</span>
          <span aria-hidden="true">↓</span>
        </a>
      </header>

      <nav className={styles.sectionNav} aria-label={t.information}>
        <div className={styles.navInner}>
          <a href="#story">
            <span>01</span>
            {t.story}
          </a>
          {(gallerySections.length > 0 || artwork.length > 0) && (
            <a href="#gallery">{t.gallery}</a>
          )}
          {videos.length > 0 && (
            <a href="#films">
              {t.video}
              <span>{String(videos.length).padStart(2, "0")}</span>
            </a>
          )}
          {credits.length > 0 && <a href="#credits">{t.credits}</a>}
          {timelines.length > 0 && <a href="#timeline">{t.timeline}</a>}
          <Link
            href={collectionHref}
            className={styles.navBack}
            aria-label={t.back}
          >
            <Arrow back />
          </Link>
        </div>
      </nav>

      <div className={styles.content}>
        <section id="story" className={styles.storySection}>
          <div className={styles.storyMain}>
            <SectionHeading eyebrow="01 — THE STORY" title={t.overview} />
            {narrative.length
              ? narrative.map((section) => (
                  <CopySection
                    key={section.id}
                    section={section}
                    locale={locale}
                  >
                    {section.type === "custom" &&
                      imageList(section.content?.images).length > 0 &&
                      renderGallery(
                        imageList(section.content.images),
                        localized(section, "title", locale) || t.gallery,
                      )}
                    {section.type === "custom" &&
                      externalUrl(section.content?.video_url) &&
                      (youtubeId(section.content.video_url) ? (
                        <button
                          className={styles.inlineVideo}
                          type="button"
                          onClick={() =>
                            setMedia({
                              kind: "video",
                              id: youtubeId(section.content.video_url)!,
                              title:
                                localized(section, "title", locale) || t.video,
                            })
                          }
                        >
                          <Play />
                          {t.play}
                          <Arrow />
                        </button>
                      ) : (
                        <a
                          className={styles.inlineVideo}
                          href={externalUrl(section.content.video_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.video}
                          <ExternalArrow />
                        </a>
                      ))}
                  </CopySection>
                ))
              : description && (
                  <p className={styles.fallbackCopy}>{description}</p>
                )}
          </div>
          <aside className={styles.information}>
            <span className={styles.eyebrow}>AT A GLANCE</span>
            <h2>{t.information}</h2>
            <dl>
              <div>
                <dt>{t.status}</dt>
                <dd className={styles.statusValue}>
                  <i aria-hidden="true" />
                  {status}
                </dd>
              </div>
              {genres.length > 0 && (
                <div>
                  <dt>{t.genre}</dt>
                  <dd>{genres.join(", ")}</dd>
                </div>
              )}
              {!!game.platforms?.length && (
                <div>
                  <dt>{t.platform}</dt>
                  <dd>{game.platforms.join(" / ")}</dd>
                </div>
              )}
              {series && (
                <div>
                  <dt>{t.series}</dt>
                  <dd>{series}</dd>
                </div>
              )}
            </dl>
            {storeLinks.length > 0 && (
              <div className={styles.storeLinks}>
                {storeLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{link.label}</span>
                    <ExternalArrow />
                  </a>
                ))}
              </div>
            )}
            <span className={styles.infoColophon}>
              {habom ? "HABOM STUDIO" : "STUDIO ELYSIAN"}
              <br />
              INTERACTIVE STORIES.
            </span>
          </aside>
        </section>

        {habom && (
          <div className={styles.experience}>
            <DialogueExperience
              gameTitle={title}
              image={banner || cover}
              locale={locale}
            />
          </div>
        )}

        {(gallerySections.length > 0 || artwork.length > 0) && (
          <section id="gallery" className={styles.block}>
            <SectionHeading
              eyebrow="STILLS & SCENES"
              title={t.gallery}
              count={
                gallerySections.length
                  ? gallerySections.reduce(
                      (sum, section) =>
                        sum + imageList(section.content.images).length,
                      0,
                    )
                  : artwork.length
              }
            />
            {gallerySections.length
              ? gallerySections.map((section) => (
                  <div
                    className={styles.mediaGroup}
                    id={`section-${section.id}`}
                    key={section.id}
                  >
                    {renderGallery(
                      imageList(section.content.images),
                      localized(section, "title", locale) || t.gallery,
                    )}
                  </div>
                ))
              : renderGallery(artwork, t.artwork)}
          </section>
        )}

        {videos.length > 0 && (
          <section id="films" className={styles.block}>
            <SectionHeading
              eyebrow="IN MOTION"
              title={t.video}
              count={videos.length}
            />
            <div className={styles.videoGrid}>
              {videos.map((section) => {
                const id = youtubeId(section.content.youtube_id);
                const videoTitle =
                  localized(section, "title", locale) || t.video;
                return (
                  <div id={`section-${section.id}`} key={section.id}>
                    {id ? (
                      <button
                        type="button"
                        className={styles.videoCard}
                        onClick={() =>
                          setMedia({ kind: "video", id, title: videoTitle })
                        }
                        aria-label={`${videoTitle} — ${t.play}`}
                      >
                        <div className={styles.videoImage}>
                          <img
                            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              const image = event.currentTarget;
                              if (image.getAttribute("src") !== banner) {
                                image.src = banner;
                              }
                            }}
                          />
                          <span className={styles.playCircle}>
                            <Play />
                          </span>
                          <span className={styles.videoTag}>FILM</span>
                        </div>
                        <span className={styles.videoCaption}>
                          {videoTitle}
                          <Arrow />
                        </span>
                      </button>
                    ) : (
                      <a
                        className={styles.externalVideo}
                        href={
                          externalUrl(section.content.youtube_id) ||
                          externalUrl(section.content.video_url)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Play />
                        <span>{videoTitle}</span>
                        <ExternalArrow />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {credits.length > 0 && (
          <section id="credits" className={styles.block}>
            <SectionHeading eyebrow="BEHIND THE STORY" title={t.credits} />
            <div className={styles.creditGroups}>
              {credits.map((section) => (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className={styles.creditGroup}
                >
                  <h3>{localized(section, "title", locale) || t.credits}</h3>
                  <dl>
                    {(
                      section.content.credits as {
                        role: string;
                        name: string;
                      }[]
                    ).map((credit, index) => (
                      <div key={`${credit.role}-${index}`}>
                        <dt>{credit.role}</dt>
                        <dd>{credit.name}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </section>
        )}

        {timelines.length > 0 && (
          <section id="timeline" className={styles.block}>
            <SectionHeading eyebrow="ALONG THE WAY" title={t.timeline} />
            {timelines.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className={styles.timeline}
              >
                <h3>{localized(section, "title", locale) || t.timeline}</h3>
                <ol>
                  {(
                    section.content.items as {
                      date: string;
                      text_ko?: string;
                      text_en?: string;
                      text_ja?: string;
                    }[]
                  ).map((item, index) => (
                    <li key={`${item.date}-${index}`}>
                      <span>{item.date}</span>
                      <p>{localized(item, "text", locale)}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </section>
        )}

        <section className={styles.related}>
          <div className={styles.relatedHeading}>
            <SectionHeading eyebrow="CONTINUE READING" title={t.related} />
            <Link href={collectionHref}>
              {t.allWorks}
              <Arrow />
            </Link>
          </div>
          {relatedGames.length > 0 && (
            <div className={styles.relatedGrid}>
              {relatedGames.map((relatedGame, index) => (
                <Link
                  href={`/${locale}/games/${relatedGame.slug}`}
                  className={styles.relatedCard}
                  key={relatedGame.id}
                >
                  <div className={styles.relatedImage}>
                    <img
                      src={gameImage(relatedGame, "cover")}
                      alt={localized(relatedGame, "title", locale)}
                      loading="lazy"
                    />
                    <span>
                      {String(index + 1).padStart(2, "0")}
                      <Arrow />
                    </span>
                  </div>
                  <span className={styles.relatedSeries}>
                    {localized(relatedGame, "series", locale)}
                  </span>
                  <h3>{localized(relatedGame, "title", locale)}</h3>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <dialog
        ref={dialogRef}
        className={`${styles.mediaDialog} ${media?.kind === "video" ? styles.videoDialog : ""}`}
        aria-labelledby="detail-media-title"
        onCancel={(event) => {
          event.preventDefault();
          setMedia(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMedia(null);
        }}
        onKeyDown={(event) => {
          if (
            media?.kind === "image" &&
            ["ArrowLeft", "ArrowRight"].includes(event.key)
          ) {
            event.preventDefault();
            shiftImage(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {media && (
          <div className={styles.modalShell}>
            <div className={styles.modalToolbar}>
              <h2 id="detail-media-title">{media.title}</h2>
              <button
                ref={closeRef}
                type="button"
                className={styles.closeButton}
                onClick={() => setMedia(null)}
                aria-label={t.close}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>
            {media.kind === "video" ? (
              <div className={styles.player}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&rel=0`}
                  title={media.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <>
                <div className={styles.lightboxImage}>
                  <img
                    src={media.images[media.index]}
                    alt={`${title} — ${media.title} ${media.index + 1}`}
                  />
                </div>
                <div className={styles.lightboxControls}>
                  <button
                    type="button"
                    onClick={() => shiftImage(-1)}
                    disabled={media.images.length < 2}
                    aria-label={t.previous}
                  >
                    <Arrow back />
                  </button>
                  <span aria-live="polite">
                    {String(media.index + 1).padStart(2, "0")}{" "}
                    <span>
                      / {String(media.images.length).padStart(2, "0")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => shiftImage(1)}
                    disabled={media.images.length < 2}
                    aria-label={t.next}
                  >
                    <Arrow />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </dialog>
    </article>
  );
}
