/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WEB_API_URL?: string;
  /** '1' 이면 스냅샷 데이터로 동작하는 미리보기 어드민 */
  readonly VITE_ADMIN_PREVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
