/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_PREFIX: string;
  readonly VITE_PROXY_TARGET: string;
  readonly VITE_ROUTE_PREFIX: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_ENCRYPTION_ENABLED: string;
  readonly VITE_REQUEST_ENCRYPTION_KEY: string;
  readonly VITE_RESPONSE_ENCRYPTION_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
