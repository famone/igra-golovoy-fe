/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_MOCK_TELEGRAM?: string;
  readonly VITE_YANDEX_API_KEY?: string;
  readonly VITE_YANDEX_FOLDER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
