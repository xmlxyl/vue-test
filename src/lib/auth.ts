const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/** 从常见登录响应里取出 token，便于对接不同后端 */
export function pickTokenFromResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const candidates = ['access_token', 'token', 'accessToken', 'data']
  for (const key of candidates) {
    const v = o[key]
    if (typeof v === 'string' && v.length > 0) return v
    if (key === 'data' && v && typeof v === 'object') {
      const inner = pickTokenFromResponse(v)
      if (inner) return inner
    }
  }
  return null
}
