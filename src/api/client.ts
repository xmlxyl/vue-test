import { getToken } from '@/lib/auth'

const base = () => (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function joinUrl(path: string): string {
  return `${base()}${path.startsWith('/') ? '' : '/'}${path}`
}

/** 带登录 Token 的请求（默认 JSON） */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = joinUrl(path)
  const token = getToken()
  const headers = new Headers(init.headers)
  if (init.body != null && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(url, { ...init, headers })
}

export async function parseJsonOrThrow(res: Response): Promise<unknown> {
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
  return raw
}
