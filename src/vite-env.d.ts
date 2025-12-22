/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  // 他の環境変数もここに追加できます
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
