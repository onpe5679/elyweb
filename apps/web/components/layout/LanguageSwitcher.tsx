'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {ChangeEvent, useTransition} from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  return (
    <div className="relative">
        <select
        defaultValue={locale}
        onChange={onSelectChange}
        disabled={isPending}
        className="appearance-none bg-transparent pl-2 pr-6 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary transition-colors"
        >
        <option value="ko" className="text-black">KR</option>
        <option value="en" className="text-black">EN</option>
        <option value="ja" className="text-black">JP</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <i className="fa-solid fa-chevron-down text-xs"></i>
        </div>
    </div>
  );
}
