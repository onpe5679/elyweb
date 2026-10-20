// True only in the static design-preview export (see scripts/static-preview). That host cannot
// embed third-party frames or images, so video and X embeds become plain outbound links there.
export const IS_STATIC_PREVIEW = process.env.NEXT_PUBLIC_STATIC_PREVIEW === '1';
