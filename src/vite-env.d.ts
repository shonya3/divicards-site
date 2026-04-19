/// <reference types="vite-plus/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
}
