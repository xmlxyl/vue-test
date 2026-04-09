/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 接口根地址，如 https://api.example.com 或留空配合代理 */
  readonly VITE_API_BASE_URL?: string
  /** 登录路径，默认 /api/auth/login */
  readonly VITE_LOGIN_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
