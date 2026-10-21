import {createElement, forwardRef, type ComponentProps} from 'react';
import {defineRouting} from 'next-intl/routing';
import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko'
});

const navigation = createSharedPathnamesNavigation(routing);

export const {redirect, usePathname, useRouter} = navigation;

// 정적 미리보기(PREVIEW_EXPORT)에는 서버가 없어 RSC 프리페치가 항상 실패하므로 그때만 프리페치를 끈다.
const NO_PREFETCH = process.env.NEXT_PUBLIC_STATIC_PREVIEW === '1';
type LinkProps = ComponentProps<typeof navigation.Link>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return createElement(navigation.Link, { ...props, ref, prefetch: NO_PREFETCH ? false : props.prefetch } as LinkProps);
});
