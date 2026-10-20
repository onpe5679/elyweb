"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";
export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  return (
    <select
      className="language-select"
      aria-label={locale === "ko" ? "언어 선택" : "Select language"}
      value={locale}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as "ko" | "en" | "ja";
        startTransition(() => router.replace(pathname, { locale: next }));
      }}
    >
      <option value="ko">KR</option>
      <option value="en">EN</option>
      <option value="ja">JP</option>
    </select>
  );
}
