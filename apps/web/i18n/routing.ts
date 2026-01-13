import {defineRouting} from 'next-intl/routing';
import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko'
});

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation(routing);
