import { apiFetch, parseJsonOrThrow } from '@/api/client'

/**
 * 对应后端 @RequestBody ShopifyStoreUpsertRequest
 * shop、accessToken 必填；apiVersion、setAsDefault 可选（JSON 中可省略）
 */
export type ShopifyStoreUpsertRequest = {
  shop: string
  accessToken: string
  apiVersion?: string
  setAsDefault?: boolean
}

/** 与后端 ShopifyStoreVO 对齐（列表展示） */
export type ShopifyStoreVO = {
  id: number
  shopHost: string
  apiVersion: string
  defaultStore: boolean
  accessTokenMasked?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type ShopifyStoreListItem = ShopifyStoreVO

export type SetAsDefaultMode = 'auto' | 'yes' | 'no'

function appendSetAsDefault(body: Record<string, unknown>, mode: SetAsDefaultMode): void {
  if (mode === 'yes') body.setAsDefault = true
  else if (mode === 'no') body.setAsDefault = false
  /* auto：不传 setAsDefault，由后端规则处理 */
}

/** 构建新增请求体（仅包含需要提交的字段） */
export function buildCreateUpsertBody(input: {
  shop: string
  accessToken: string
  apiVersion: string
  setAsDefaultMode: SetAsDefaultMode
}): Record<string, unknown> {
  const shop = input.shop.trim()
  if (!shop) throw new Error('shop 不能为空')
  const accessToken = input.accessToken.trim()
  if (!accessToken) throw new Error('accessToken 不能为空')
  const body: Record<string, unknown> = { shop, accessToken }
  const ver = input.apiVersion.trim()
  if (ver) body.apiVersion = ver
  appendSetAsDefault(body, input.setAsDefaultMode)
  return body
}

/** 构建更新请求体；accessToken 留空则不提交该字段 */
export function buildUpdateUpsertBody(input: {
  shop: string
  accessToken: string
  apiVersion: string
  setAsDefaultMode: SetAsDefaultMode
}): Record<string, unknown> {
  const shop = input.shop.trim()
  if (!shop) throw new Error('shop 不能为空')
  const body: Record<string, unknown> = { shop }
  const tok = input.accessToken.trim()
  if (tok) body.accessToken = tok
  const ver = input.apiVersion.trim()
  if (ver) body.apiVersion = ver
  appendSetAsDefault(body, input.setAsDefaultMode)
  return body
}

function normalizeStoreList(raw: unknown): ShopifyStoreListItem[] {
  if (Array.isArray(raw)) return raw as ShopifyStoreListItem[]
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const d = (raw as { data: unknown }).data
    if (Array.isArray(d)) return d as ShopifyStoreListItem[]
  }
  return []
}

/** GET /api/admin/shopify/stores */
export async function fetchShopifyStores(): Promise<ShopifyStoreListItem[]> {
  const res = await apiFetch('/api/admin/shopify/stores', { method: 'GET' })
  const raw = await parseJsonOrThrow(res)
  return normalizeStoreList(raw)
}

/** POST /api/admin/shopify/stores */
export async function createShopifyStore(body: Record<string, unknown>): Promise<unknown> {
  const res = await apiFetch('/api/admin/shopify/stores', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return parseJsonOrThrow(res)
}

/** PUT /api/admin/shopify/stores/:id */
export async function updateShopifyStore(id: string | number, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiFetch(`/api/admin/shopify/stores/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  return parseJsonOrThrow(res)
}

/** DELETE /api/admin/shopify/stores/:id */
export async function deleteShopifyStore(id: string | number): Promise<unknown> {
  const res = await apiFetch(`/api/admin/shopify/stores/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  })
  return parseJsonOrThrow(res)
}
