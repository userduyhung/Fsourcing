/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  // Thêm các biến môi trường khác ở đây
  // readonly VITE_EMAILJS_SERVICE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
