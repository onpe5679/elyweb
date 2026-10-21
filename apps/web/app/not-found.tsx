import Link from 'next/link';
import Cells from '@/components/ui/Cells';
import './globals.css';

/**
 * 로케일 밖의 404(예: /foo, 잘못된 로케일 /xx/…, 정적 내보내기의 404.html).
 * 이 위치에는 루트 레이아웃이 없어 html/body 를 직접 그린다. 로케일을 알 수 없으므로 세 언어를 함께 보여 준다.
 * (로케일 안의 404 는 app/[locale]/not-found.tsx 가 Shell 과 함께 그린다.)
 */
const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Hahmlet:wght@400;600;800&family=Shippori+Mincho:wght@500;800' +
  '&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap';

const THEME_INIT = `try{var t=localStorage.getItem('se-theme');if(t==='night')document.documentElement.setAttribute('data-theme','night')}catch(e){}`;

const LANGS = [
  { id: 'ko', title: '페이지를 찾을 수 없습니다', body: '주소가 바뀌었거나 없어진 페이지예요.', home: '처음으로' },
  { id: 'en', title: 'Page not found', body: 'The address may have changed, or the page no longer exists.', home: 'Back to the cover' },
  { id: 'ja', title: 'ページが見つかりません', body: 'アドレスが変わったか、ページがなくなった可能性があります。', home: '表紙へ戻る' },
] as const;

export default function GlobalNotFound() {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 · Studio Elysian</title>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONT_CSS} rel="stylesheet" />
      </head>
      <body>
        <main id="main" className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden">
          <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-50" />
          <div className="mx-auto w-full max-w-page px-5 py-16 md:px-10">
            <p className="t-eyebrow">Studio Elysian · Error 404</p>
            <div aria-hidden className="mt-5">
              <Cells text="404" size="lg" filled />
            </div>
            <h1 className="mt-10 space-y-2">
              {LANGS.map((l) => (
                <span key={l.id} lang={l.id} className="t-display block break-keep text-[clamp(22px,3vw,36px)]">
                  {l.title}
                </span>
              ))}
            </h1>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {LANGS.map((l) => (
                <li key={l.id} lang={l.id} className="flex flex-col items-start">
                  <p className="mb-3 flex-1 break-keep font-serif text-[15px] leading-7 text-ink-2 [text-wrap:pretty]">{l.body}</p>
                  <Link href={`/${l.id}`} className="btn btn--ghost">
                    {l.home}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </body>
    </html>
  );
}
