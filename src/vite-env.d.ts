/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_PREFIX: string;
  readonly VITE_PROXY_TARGET: string;
  readonly VITE_ROUTE_PREFIX: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_AUTH_STORAGE_STRATEGY: "memory-refresh" | "legacy-localStorage";
  readonly VITE_TRUST_MENU_PERMISSIONS: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
