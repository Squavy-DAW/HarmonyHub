/// <reference types="vite/client" />

interface ImportMetaEnv {
  // more env variables...
  readonly VITE_WEBSOCKET: string,
  readonly VITE_HARMONYHUB: string,
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}