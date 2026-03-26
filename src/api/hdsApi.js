import { normalizeInquiryApiBaseUrl } from '../utils/inquiryUrl.js'

const DEFAULT_BASE = ''

/** Dev only: `VITE_SKIP_LOCAL_API=1` skips /api/products, /orders, /customers, /promos when Express is off (no Vite proxy spam). Inquiry is never skipped. */
function skipBackendApi() {
  return import.meta.env.DEV && import.meta.env.VITE_SKIP_LOCAL_API === '1'
}

const PROMOS_STUB = {
  PROMO_CODES: {},
  FREE_SHIPPING_THRESHOLD: 25000,
  DEFAULT_SHIPPING_COST: 500,
}

function getBaseUrl() {
  // If VITE_API_URL is set (e.g. https://api.example.com), use it.
  // Otherwise rely on same-origin (and Vite dev proxy for /api/*).
  const v = import.meta?.env?.VITE_API_URL
  if (!v) return DEFAULT_BASE
  return String(v).replace(/\/+$/, '')
}

/** Base URL for POST /api/inquiries → API Gateway → Lambda. Prefer VITE_INQUIRY_API_URL so inquiry can target Lambda while other APIs use VITE_API_URL or the dev proxy. */
function getInquiryBaseUrl() {
  const inquiry = import.meta?.env?.VITE_INQUIRY_API_URL
  if (inquiry != null && String(inquiry).trim() !== '') {
    // In dev, same-origin /api/inquiries is proxied by Vite to API Gateway (see vite.config.js).
    if (import.meta.env.DEV) {
      return ''
    }
    return normalizeInquiryApiBaseUrl(String(inquiry))
  }
  return getBaseUrl()
}

/** Parse response body once; tolerate JSON with wrong Content-Type (e.g. some proxies). */
async function readResponsePayload(res) {
  const raw = await res.text()
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json') || ct.includes('text/json')) {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
  return raw
}

/** Best-effort message for failed requests (Lambda, Express, API Gateway). */
function messageFromErrorPayload(status, data) {
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim()
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim()
    if (typeof data.Message === 'string' && data.Message.trim()) return data.Message.trim()
  }
  if (typeof data === 'string' && data.trim()) {
    const t = data.trim()
    if (t.startsWith('{')) {
      try {
        return messageFromErrorPayload(status, JSON.parse(t))
      } catch {
        /* fall through */
      }
    }
    if (/<!DOCTYPE|<\s*html/i.test(t)) {
      return status >= 500
        ? 'The inquiry service returned an error. If this continues, contact us directly or check that the API is deployed.'
        : `Request failed (${status})`
    }
    return t.length > 280 ? `${t.slice(0, 280)}…` : t
  }
  return `Request failed (${status})`
}

async function request(path, options, baseOverride) {
  const base = baseOverride !== undefined ? baseOverride : getBaseUrl()
  const url = `${base}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })

  if (res.status === 204) return null

  const data = await readResponsePayload(res)

  if (!res.ok) {
    const msg = messageFromErrorPayload(res.status, data)
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

function normalizeId(doc) {
  if (!doc || typeof doc !== 'object') return doc
  if (doc.id) return doc
  if (doc._id != null) return { ...doc, id: String(doc._id) }
  return doc
}

function normalizeArray(arr) {
  return Array.isArray(arr) ? arr.map(normalizeId) : []
}

export const hdsApi = {
  // Health
  health: () => request('/api/health'),

  // Products
  listProducts: async () => {
    if (skipBackendApi()) return []
    return normalizeArray(await request('/api/products'))
  },
  getProduct: async (id) => normalizeId(await request(`/api/products/${id}`)),
  createProduct: async (payload) => {
    const res = await request('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { id: res?.id, product: normalizeId(res?.product) }
  },
  updateProduct: async (id, payload) =>
    normalizeId(
      await request(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    ),
  deleteProduct: async (id) =>
    request(`/api/products/${id}`, { method: 'DELETE' }),
  bulkUpdateInventory: async (updates) =>
    request('/api/products/inventory', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Orders
  listOrders: async () => {
    if (skipBackendApi()) return []
    return normalizeArray(await request('/api/orders'))
  },
  getOrder: async (id) => normalizeId(await request(`/api/orders/${id}`)),
  placeOrder: async (payload) => {
    const res = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { id: res?.id, order: normalizeId(res?.order) }
  },
  updateOrderStatus: async (id, status) =>
    normalizeId(
      await request(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    ),

  // Customers
  listCustomers: async () => {
    if (skipBackendApi()) return []
    return normalizeArray(await request('/api/customers'))
  },
  blockCustomer: async (id) =>
    normalizeId(await request(`/api/customers/${id}/block`, { method: 'POST' })),
  unblockCustomer: async (id) =>
    normalizeId(
      await request(`/api/customers/${id}/unblock`, { method: 'POST' })
    ),

  // Promos / config
  getPromos: async () => {
    if (skipBackendApi()) return { ...PROMOS_STUB }
    return request('/api/promos')
  },

  // Inquiries (API Gateway + Lambda when VITE_INQUIRY_API_URL or VITE_API_URL is set)
  submitInquiry: async (payload) =>
    request(
      '/api/inquiries',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      getInquiryBaseUrl()
    ),
}

