#!/usr/bin/env python3
"""
운영 사이트(https://www.studioelysian.co) 공개 HTML에서 콘텐츠 스냅샷을 만든다.

- 목적: Supabase 환경변수 없이도 시안이 실제 작품 데이터로 렌더링되도록 하는 읽기 전용 폴백.
- 쓰기: DB·운영 사이트를 수정하지 않는다. 공개 페이지를 GET 하기만 한다.
- 출력: apps/web/lib/snapshot/*.json  (DB 행(row)과 같은 모양 → lib/supabase.ts 의 타입을 그대로 사용)

사용:  python3 scripts/snapshot/build_snapshot.py [--cache DIR]
"""
import argparse
import json
import os
import re
import sys
import urllib.request
import uuid
from pathlib import Path

from bs4 import BeautifulSoup

BASE = "https://www.studioelysian.co"
LOCALES = ["ko", "en", "ja"]
OUT = Path(__file__).resolve().parents[2] / "apps/web/lib/snapshot"
NS = uuid.UUID("5d0d5d4e-1d0e-4a54-9a43-000000000001")

STATUS_MAP = {
    "Now Available": "released",
    "Coming Soon": "coming_soon",
    "In Development": "in_development",
    "Publishing": "publishing",
}
ICON_TYPE = {
    "article": "text",
    "info": "text",
    "auto_stories": "text",
    "history": "timeline",
    "group": "credits",
    "play_circle": "video",
    "photo_library": "gallery",
    "shopping_cart": "store",
    "widgets": "custom",
}

cache_dir: Path | None = None
IMAGE_MANIFEST: dict[str, str] = {}


def fetch(path: str) -> str:
    key = re.sub(r"[^a-zA-Z0-9]+", "_", path).strip("_") or "root"
    if cache_dir:
        f = cache_dir / f"{key}.html"
        if f.exists():
            return f.read_text(encoding="utf-8")
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "elyweb-snapshot/1.0"})
    with urllib.request.urlopen(req, timeout=40) as r:
        html = r.read().decode("utf-8")
    if cache_dir:
        cache_dir.mkdir(parents=True, exist_ok=True)
        (cache_dir / f"{key}.html").write_text(html, encoding="utf-8")
    return html


def soup(path: str) -> BeautifulSoup:
    return BeautifulSoup(fetch(path), "lxml")


def txt(el) -> str:
    return el.get_text() if el else ""


def local_image(url: str | None) -> str | None:
    """공개 이미지 URL → 저장소에 미러링되는 /snapshot/... 경로(파일명 = 원본 UUID)."""
    if not url:
        return None
    m = re.search(r"/(games|company_settings|team_members|news)/([0-9a-f-]{36})\.(png|jpg|jpeg|webp|avif)$", url)
    if not m:
        return url
    local = f"/snapshot/{m.group(1)}/{m.group(2)}.webp"
    IMAGE_MANIFEST[local] = url if url.startswith("http") else BASE + url
    return local


def parse_list(locale: str) -> dict:
    s = soup(f"/{locale}/games")
    out = {}
    for a in s.select('a[data-testid="game-card"]'):
        slug = a["href"].rstrip("/").split("/")[-1]
        series = txt(a.select_one("div.text-primary")).strip()
        out[slug] = {
            "status_text": txt(a.select_one('[data-testid="game-status-badge"]')).strip(),
            "image": a.find("img")["src"],
            "series": series,
            "title": txt(a.find("h3")).strip(),
            "desc": txt(a.find("p")).strip(),
        }
    order = [a["href"].rstrip("/").split("/")[-1] for a in s.select('a[data-testid="game-card"]')]
    return {"items": out, "order": order}


def parse_detail(locale: str, slug: str) -> dict:
    s = soup(f"/{locale}/games/{slug}")
    main = s.find("main")
    banner = main.select_one('[data-testid="game-banner"] img')
    poster = main.find("img", alt="Game Poster")
    steam = None
    official = None
    for a in main.find_all("a", href=True):
        label = a.get_text(strip=True)
        if "Steam" in label:
            steam = a["href"]
        elif "Official" in label:
            official = a["href"]
    h1 = main.find("h1")
    series = txt(h1.find_next("p")).strip() if h1 else ""
    sections = []
    for sec in main.select('section[id^="section-"]'):
        sid = sec["id"].replace("section-", "")
        h2 = sec.find("h2")
        icon = txt(h2.find("span", class_="material-symbols-outlined")).strip()
        title = h2.get_text(" ", strip=True).replace(icon, "", 1).strip()
        stype = ICON_TYPE.get(icon, "custom")
        row = {"id": sid, "section_type": stype, "title": title}
        if stype in ("text", "custom"):
            p = sec.select_one(".prose p, .prose div")
            row["content"] = txt(p).strip("\n ") if p else ""
        elif stype == "timeline":
            row["timeline_items"] = [
                {"date": txt(li.find_all("span")[0]).strip(), "text": txt(li.find_all("span")[1]).strip()}
                for li in sec.select("li")
            ]
        elif stype == "credits":
            row["credits"] = [
                {"role": txt(d.find("dt")).strip(), "name": txt(d.find("dd")).strip()}
                for d in sec.select("dl > div")
            ]
        elif stype == "video":
            ifr = sec.find("iframe")
            row["video_url"] = ifr["src"] if ifr else None
        elif stype == "gallery":
            row["images"] = [i["src"] for i in sec.find_all("img")]
        elif stype == "store":
            row["store_links"] = [
                {"name": a.get_text(strip=True), "url": a["href"]} for a in sec.find_all("a", href=True)
            ]
        sections.append(row)
    return {
        "banner": banner["src"] if banner else None,
        "poster": poster["src"] if poster else None,
        "steam": steam,
        "official": official,
        "title": txt(h1).strip() if h1 else "",
        "series": series,
        "sections": sections,
    }


# 공개 설명문에 근거한 장르 표기(운영 DB의 genre 컬럼은 공개 HTML에 노출되지 않음).
GENRES = {
    "memorial-circuit": {"ko": ["비주얼 노벨", "SF", "로맨스", "미스터리"], "en": ["Visual Novel", "SF", "Romance", "Mystery"], "ja": ["ビジュアルノベル", "SF", "ロマンス", "ミステリー"]},
    "IBAT": {"ko": ["비주얼 노벨", "SF", "일상"], "en": ["Visual Novel", "SF", "Slice of Life"], "ja": ["ビジュアルノベル", "SF", "日常"]},
    "cella": {"ko": ["스팀펑크", "추리 어드벤처"], "en": ["Steampunk", "Detective Adventure"], "ja": ["スチームパンク", "推理アドベンチャー"]},
    "festival-not-over": {"ko": ["심리 호러", "퍼즐 어드벤처"], "en": ["Psychological Horror", "Puzzle Adventure"], "ja": ["サイコホラー", "パズルアドベンチャー"]},
    "sharehouse": {"ko": ["로맨스 코미디", "비주얼 노벨"], "en": ["Romance Comedy", "Visual Novel"], "ja": ["ロマンスコメディ", "ビジュアルノベル"]},
}


def build_games():
    lists = {l: parse_list(l) for l in LOCALES}
    slugs = lists["ko"]["order"]
    games, sections = [], []
    for order, slug in enumerate(slugs, start=1):
        det = {l: parse_detail(l, slug) for l in LOCALES}
        k = det["ko"]
        lst = {l: lists[l]["items"][slug] for l in LOCALES}
        gid = str(uuid.uuid5(NS, "game:" + slug))
        status = STATUS_MAP.get(lst["ko"]["status_text"], "released")
        g = {
            "id": gid,
            "slug": slug,
            "status": status,
            "cover_image": local_image(k["poster"]),
            "thumbnail_image": local_image(lst["ko"]["image"]),
            "banner_image": local_image(k["banner"]),
            "steam_url": k["steam"],
            "official_url": k["official"],
            "platforms": ["PC", "Steam"] if k["steam"] else ["PC"],
            "is_featured": slug == "memorial-circuit",
            "display_order": order,
            "created_at": "2024-01-01T00:00:00Z",
        }
        for l in LOCALES:
            g[f"title_{l}"] = det[l]["title"] or lst[l]["title"]
            g[f"series_{l}"] = lst[l]["series"] or det[l]["series"]
            g[f"description_{l}"] = lst[l]["desc"]
            g[f"genre_{l}"] = GENRES.get(slug, {}).get(l, [])
        games.append(g)
        # 섹션: ko 를 기준 순서로, en/ja 는 같은 id 로 병합
        by_loc = {l: {s["id"]: s for s in det[l]["sections"]} for l in LOCALES}
        for i, s in enumerate(k["sections"], start=1):
            row = {
                "id": s["id"],
                "game_id": gid,
                "section_type": s["section_type"],
                "display_order": i,
                "is_visible": True,
            }
            for l in LOCALES:
                ls = by_loc[l].get(s["id"])
                if not ls:
                    continue
                row[f"title_{l}"] = ls["title"]
                if "content" in ls:
                    row[f"content_{l}"] = ls["content"]
            if "video_url" in s:
                row["video_url"] = s["video_url"]
            if "images" in s:
                row["images"] = [local_image(u) for u in s["images"]]
            if "store_links" in s:
                row["store_links"] = s["store_links"]
            if "credits" in s:
                row["credits"] = s["credits"]
            if "timeline_items" in s:
                items = []
                for j, it in enumerate(s["timeline_items"]):
                    item = {"date": it["date"], "event_ko": it["text"]}
                    for l in ("en", "ja"):
                        lsec = by_loc[l].get(s["id"])
                        if lsec and j < len(lsec.get("timeline_items", [])):
                            item[f"event_{l}"] = lsec["timeline_items"][j]["text"]
                    items.append(item)
                row["timeline_items"] = items
            sections.append(row)
    return games, sections


def build_timeline():
    out = {}
    for l in LOCALES:
        s = soup(f"/{l}/about")
        main = s.find("main")
        h2 = [h for h in main.find_all("h2") if h.get_text(strip=True) == "History"][0]
        wrap = h2.find_next("div", class_=re.compile("border-l-2"))
        items = []
        for d in wrap.find_all("div", class_=re.compile(r"relative pl-8")):
            date = d.find("span", class_=re.compile("font-bold"))
            title = d.find("h3")
            items.append((txt(date).strip(), txt(title).strip()))
        out[l] = items
    rows = []
    for i, (date, title) in enumerate(out["ko"], start=1):
        row = {
            "id": str(uuid.uuid5(NS, f"timeline:{i}")),
            "date_label": date,
            "title_ko": title,
            "icon": "flag",
            "is_active": True,
            "show_on_home": date in ("2022.09", "2024.04", "2025.04"),
            "display_order": i,
            "created_at": "2024-01-01T00:00:00Z",
        }
        for l in ("en", "ja"):
            if i - 1 < len(out[l]):
                row[f"title_{l}"] = out[l][i - 1][1]
        rows.append(row)
    return rows


def build_team():
    s = soup("/ko/about")
    slugs = []
    for a in s.select('main a[href*="/team/"]'):
        slug = a["href"].rstrip("/").split("/")[-1]
        if slug not in slugs:
            slugs.append(slug)
    members, sections = [], []
    for i, slug in enumerate(slugs, start=1):
        row = {"slug": slug, "is_active": True, "display_order": i, "created_at": "2024-01-01T00:00:00Z"}
        mid = str(uuid.uuid5(NS, "team:" + slug))
        row["id"] = mid
        for l in LOCALES:
            t = soup(f"/{l}/team/{slug}").find("main")
            h1 = t.find("h1")
            row[f"name_{l}"] = txt(h1).strip()
            row[f"role_{l}"] = txt(h1.find_next("p")).strip()
            if l == "ko":
                links = [a["href"] for a in t.select("a[target=_blank]")]
                for u in links:
                    if "x.com" in u or "twitter.com" in u:
                        row["twitter_url"] = u
                    elif "instagram" in u:
                        row["instagram_url"] = u
                n = 0
                for h2 in t.find_all("h2"):
                    title = h2.get_text(strip=True)
                    body = h2.find_next(class_=re.compile("prose"))
                    if not body or title.lower() == "ddad":  # 운영 DB의 테스트 입력값은 제외
                        continue
                    n += 1
                    sections.append({
                        "id": str(uuid.uuid5(NS, f"teamsec:{slug}:{n}")),
                        "team_member_id": mid,
                        "section_type": "text",
                        "title_ko": title,
                        "content_ko": txt(body.find("p")).strip(),
                        "display_order": n,
                        "is_visible": True,
                    })
        members.append(row)
    return members, sections


def build_settings():
    home = soup("/ko")
    logo = "/snapshot/company_settings/2de92d57-7a42-40f6-a99e-783411918a3c.webp"
    rows = [
        ("logo_image", "/snapshot/company_settings/2de92d57-7a42-40f6-a99e-783411918a3c.webp"),
        ("logo_mark_dark", "/snapshot/company_settings/e629855f-84ad-4052-af3c-5b9283412489.webp"),
        ("hero_image", "/snapshot/company_settings/bc794a86-e714-4942-8acf-9930e12b5a5d.webp"),
        ("about_image", "/snapshot/company_settings/6fb9f596-30a8-418d-9621-4e97574e59ca.webp"),
        ("vision_image", "/snapshot/company_settings/e629855f-84ad-4052-af3c-5b9283412489.webp"),
    ]
    del logo
    settings = [{"key": k, "value_ko": v, "value_en": v, "value_ja": v} for k, v in rows]
    for _, v in rows:
        IMAGE_MANIFEST[v] = f"{BASE}/uploads/company_settings/{Path(v).stem}.png"

    vision = {}
    for l in LOCALES:
        main = soup(f"/{l}").find("main")
        ps = []
        for h2 in main.find_all("h2"):
            pass
        sec = [s for s in main.find_all("section") if s.find("h2") and s.find("h4")]
        vision[l] = sec[0] if sec else None
    for l in LOCALES:
        sec = vision[l]
        title = txt(sec.find("h2")).strip() if sec else ""
        body = "\n\n".join(txt(p).strip() for p in sec.find_all("p")) if sec else ""
        for key, val in (("vision_title", title), ("vision_description", body)):
            r = next((x for x in settings if x["key"] == key), None)
            if not r:
                r = {"key": key}
                settings.append(r)
            r[f"value_{l}"] = val
    footer = soup("/ko")
    mailto = footer.select_one('a[href^="mailto:"]')["href"].replace("mailto:", "")
    links = {"twitter_url": None, "youtube_url": None, "instagram_url": None}
    for a in footer.find_all("a", href=True):
        h = a["href"]
        if "x.com/" in h:
            links["twitter_url"] = h
        elif "youtube.com" in h:
            links["youtube_url"] = h
        elif "instagram.com" in h:
            links["instagram_url"] = h
    settings.append({"key": "contact_email", "value_ko": mailto, "value_en": mailto, "value_ja": mailto})
    for k, v in links.items():
        if v:
            settings.append({"key": k, "value_ko": v, "value_en": v, "value_ja": v})
    for k, v in (
        ("stat_year_value", "2022"), ("stat_projects_value", "3+"), ("stat_released_value", "2"),
        ("stat_global_value", "Global"), ("funding_percentage", "1347%"),
        ("news_display_mode", "widget"), ("news_widget_x_handle", "_StudioElysian"),
    ):
        settings.append({"key": k, "value_ko": v, "value_en": v, "value_ja": v})
    priv = {}
    for l in LOCALES:
        m = soup(f"/{l}/privacy").find("main")
        priv[l] = m.get_text("\n", strip=False)
    return settings, priv


def build_press():
    m = soup("/ko/press").find("main")
    rows = []
    for i, a in enumerate(m.select("a[href]"), start=1):
        h3 = a.find("h3")
        if not h3:
            continue
        href = a["href"]
        if "example.com" in href:  # 운영 DB의 자리표시자 URL
            continue
        rows.append({
            "id": str(uuid.uuid5(NS, f"press:{i}")),
            "title_ko": txt(h3).strip(),
            "description_ko": txt(a.find("p")).strip(),
            "file_url": href,
            "display_order": i,
            "is_published": True,
            "created_at": "2024-01-01T00:00:00Z",
        })
    return rows


def main():
    global cache_dir
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", type=Path, default=None)
    args = ap.parse_args()
    cache_dir = args.cache
    OUT.mkdir(parents=True, exist_ok=True)

    games, sections = build_games()
    timeline = build_timeline()
    team, team_sections = build_team()
    settings, privacy = build_settings()
    press = build_press()

    def dump(name, data):
        (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{name}: {len(data) if hasattr(data, '__len__') else ''}")

    dump("games.json", games)
    dump("game_sections.json", sections)
    dump("timeline_events.json", timeline)
    dump("team_members.json", team)
    dump("team_member_sections.json", team_sections)
    dump("company_settings.json", settings)
    dump("press_kits.json", press)
    dump("news.json", [])
    dump("privacy.json", privacy)
    (OUT / "images.manifest.json").write_text(json.dumps(IMAGE_MANIFEST, indent=2) + "\n", encoding="utf-8")
    print(f"images.manifest.json: {len(IMAGE_MANIFEST)}")


if __name__ == "__main__":
    sys.exit(main())
