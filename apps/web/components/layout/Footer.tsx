"use client";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
interface FooterProps {
  settings: {
    contactEmail: string;
    twitterUrl: string;
    youtubeUrl: string;
    instagramUrl: string;
    logoImage?: string | null;
    logoIcon?: string;
  };
}
export default function Footer({ settings }: FooterProps) {
  const locale = useLocale();
  const contact =
    locale === "ko"
      ? "함께 쓸 다음 이야기."
      : locale === "ja"
        ? "一緒に紡ぐ、次の物語。"
        : "Let’s write the next chapter.";
  return (
    <footer className="site-footer">
      <div className="editorial-container">
        <div className="footer-invitation">
          <div>
            <p className="eyebrow">THE STORY CONTINUES</p>
            <h2>{contact}</h2>
          </div>
          <Link
            href="/contact"
            className="footer-contact"
            aria-label={locale === "ko" ? "문의하기" : "Contact us"}
          >
            <span>
              {locale === "ko"
                ? "이야기 나누기"
                : locale === "ja"
                  ? "お問い合わせ"
                  : "Get in touch"}
            </span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="footer-body">
          <Link href="/" className="footer-wordmark">
            elysian<span>®</span>
          </Link>
          <div className="footer-motto">
            FOR STORY-LOVERS,
            <br />
            BY STORYTELLERS.
          </div>
          <div className="footer-links">
            <Link href="/about">Studio</Link>
            <Link href="/press">Press kit ↗</Link>
            <Link href="/habom">Habom Studio ↗</Link>
            {settings.twitterUrl && (
              <a
                href={settings.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                X / Twitter ↗
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube ↗
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram ↗
              </a>
            )}
          </div>
        </div>
        <div className="footer-legal">
          <div>
            <p>
              주식회사 스튜디오엘리시안 · 대표 우현제 · 사업자등록번호
              373-81-03729
            </p>
            <p>경기도 성남시 분당구 대왕판교로645번길 12, 6층 27호</p>
            <p>
              <a
                href={`mailto:${settings.contactEmail || "stdelysian@gmail.com"}`}
              >
                {settings.contactEmail || "stdelysian@gmail.com"}
              </a>{" "}
              · 010-5344-0783
            </p>
          </div>
          <div>
            <p>© {new Date().getFullYear()} STUDIO ELYSIAN</p>
            <Link href="/privacy">
              {locale === "ko"
                ? "개인정보처리방침"
                : locale === "ja"
                  ? "プライバシーポリシー"
                  : "Privacy policy"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
