import { pickTokenFromResponse } from '@/lib/auth'

const base = () => (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const loginPath = () => import.meta.env.VITE_LOGIN_PATH ?? '/api/auth/login'

export type LoginResult = {
  raw: unknown
  token: string | null
}

export async function loginRequest(username: string, password: string): Promise<LoginResult> {
  const url = `${base()}${loginPath().startsWith('/') ? '' : '/'}${loginPath()}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const text = await res.text()
  let raw: unknown = text
  try {
    raw = text ? JSON.parse(text) : null
  } catch {
    /* 非 JSON 时保留原文 */
  }

  if (!res.ok) {
    const msg =
      typeof raw === 'object' && raw !== null && 'message' in raw
        ? String((raw as { message: unknown }).message)
        : text || res.statusText
    throw new Error(msg || `请求失败 (${res.status})`)
  }

  return { raw, token: pickTokenFromResponse(raw) }
}
