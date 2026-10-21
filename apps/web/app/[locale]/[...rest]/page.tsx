import { notFound } from 'next/navigation';

/**
 * 정의되지 않은 주소(/ko/없는-경로)를 받아 [locale]/not-found.tsx 의 브랜드 404 로 보낸다.
 * (이 파일이 없으면 locale 레이아웃 밖의 기본 404 가 나온다.)
 */
export default function CatchAllPage() {
  notFound();
}

// 정적 내보내기(output: 'export')는 동적 경로에 경로가 하나 이상 있어야 한다. 자리표시 하나만 두고 곧바로 404 로 보낸다.
export function generateStaticParams() {
  return [{ rest: ['_'] }];
}
