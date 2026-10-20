"use client";
import { useState } from "react";
import Link from "next/link";

export default function OpeningScene({
  locale,
  image,
}: {
  locale: string;
  image: string;
}) {
  const [entered, setEntered] = useState(false);
  const ko = locale === "ko",
    ja = locale === "ja";
  function begin() {
    setEntered(true);
    document
      .getElementById("stories")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  }
  return (
    <section
      className={`opening-scene ${entered ? "has-entered" : ""}`}
      aria-label={ko ? "이야기의 시작" : "The beginning of a story"}
    >
      <div className="editorial-container opening-inner">
        <div className="opening-topline">
          <span>INDEPENDENT GAME STUDIO · EST. 2022</span>
          <span>
            SEONGNAM, SOUTH KOREA <span className="tiny-star">✳</span>
          </span>
        </div>
        <div className="opening-composition">
          <div className="opening-art">
            <img
              src={image}
              alt={
                ko
                  ? "빛이 들어오는 계단과 그랜드 피아노, 엘리시안의 이야기 속 세계"
                  : ja
                    ? "光が差し込む階段とグランドピアノ"
                    : "A grand piano and a staircase flooded with light, a world of Elysian"
              }
              fetchPriority="high"
            />
            <span className="art-corner" />
            <span className="art-caption">A WORLD WAITING TO BE FOUND.</span>
          </div>
          <div className="opening-copy">
            <div className="manuscript-label" aria-hidden="true">
              <span>序</span>
              <span>첫</span>
              <span>문</span>
              <span>장</span>
              <span></span>
            </div>
            <h1>
              {ko ? (
                <>
                  이야기의
                  <br />
                  다음 장을
                  <br />
                  <em>열다.</em>
                </>
              ) : ja ? (
                <>
                  物語の、
                  <br />
                  次のページを
                  <br />
                  <em>ひらく。</em>
                </>
              ) : (
                <>
                  A story.
                  <br />A world.
                  <br />
                  <em>A new chapter.</em>
                </>
              )}
            </h1>
            <p>
              {ko ? (
                <>
                  끝난 뒤에도, 마음에 남는 세계.
                  <br />
                  우리는 그런 이야기를 만듭니다.
                </>
              ) : ja ? (
                <>
                  終わったあとも、心に残る世界。
                  <br />
                  私たちは、そんな物語をつくります。
                </>
              ) : (
                <>
                  Worlds that stay with you, even after the end.
                  <br />
                  These are the stories we create.
                </>
              )}
            </p>
          </div>
          <div className="opening-script" aria-hidden="true">
            For the
            <br />
            <span>story-lovers.</span>
          </div>
          <span className="opening-side" aria-hidden="true">
            STORIES BEGIN WHERE YOU ARE.
          </span>
        </div>
        <div className="opening-bottom">
          <button className="start-story" onClick={begin}>
            <span className="start-icon" aria-hidden="true">
              ▶
            </span>
            <span>
              <small>START A NEW CHAPTER</small>
              {ko ? "이야기 펼치기" : ja ? "物語をひらく" : "Open the story"}
            </span>
            <span className="start-arrow" aria-hidden="true">
              ↓
            </span>
          </button>
          <Link href={`/${locale}/about`} className="opening-studio-link">
            {ko
              ? "우리가 만드는 세계"
              : ja
                ? "私たちの世界"
                : "The worlds we make"}{" "}
            <span aria-hidden="true">↗</span>
          </Link>
          <div className="opening-page">
            <span>PROLOGUE</span>
            <span>001 — ∞</span>
          </div>
        </div>
      </div>
    </section>
  );
}
