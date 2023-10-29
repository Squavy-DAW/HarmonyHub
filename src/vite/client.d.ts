/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WEBSOCKET: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }