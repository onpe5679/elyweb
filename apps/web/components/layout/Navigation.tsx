"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navigation(_props: {
  logoImage?: string | null;
  logoIcon?: string;
}) {
  const locale = useLocale();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const labels =
    locale === "en"
      ? ["Studio", "Our stories", "Journal", "Contact"]
      : locale === "ja"
        ? ["スタジオ", "作品", "ニュース", "お問い合わせ"]
        : ["스튜디오", "작품", "소식", "문의"];
  const links = ["/about", "/games", "/news", "/contact"];
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [open]);
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        {locale === "ko" ? "본문으로 건너뛰기" : "Skip to content"}
      </a>
      <nav
        className="site-nav editorial-container"
        aria-label={locale === "ko" ? "주 메뉴" : "Main navigation"}
      >
        <Link
          className="brand-lockup"
          href="/"
          aria-label="Studio Elysian Home"
        >
          <img
            src="/images/editorial/elysian-mark.webp"
            width="42"
            height="42"
            alt=""
          />
          <span>
            <small>STUDIO</small>
            <strong>elysian</strong>
          </span>
        </Link>
        <div className="nav-links">
          {links.map((href, i) => (
            <Link
              key={href}
              href={href}
              className={path.startsWith(href) ? "active" : ""}
              aria-current={path.startsWith(href) ? "page" : undefined}
            >
              {labels[i]}
            </Link>
          ))}
        </div>
        <div className="nav-tools">
          <Link
            className={`habom-nav ${path.startsWith("/habom") ? "active" : ""}`}
            href="/habom"
          >
            <span className="habom-dot" />
            Habom <span aria-hidden="true">↗</span>
          </Link>
          <LanguageSwitcher />
          <button
            ref={toggle}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-button"
          >
            <span className={open ? "is-open" : ""} />
            <span className={open ? "is-open" : ""} />
          </button>
        </div>
      </nav>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Mobile navigation"
          data-testid="mobile-menu"
        >
          {links.map((href, i) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              <span>0{i + 1}</span>
              {labels[i]}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link href="/habom" onClick={() => setOpen(false)}>
            <span>05</span>Habom Studio<span aria-hidden="true">↗</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
