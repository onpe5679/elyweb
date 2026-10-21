// 루트 레이아웃: html/body 는 [locale]/layout.tsx(로케일 페이지)와 app/not-found.tsx(로케일 밖 404)가 각각 그린다.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
