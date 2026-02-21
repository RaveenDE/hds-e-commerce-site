const DEFAULT_BASE = ''

function getBaseUrl() {
  // If VITE_API_URL is set (e.g. https://api.example.com), use it.
  // Otherwise rely on same-origin (and Vite dev proxy for /api/*).
  const v = import.meta?.env?.VITE_API_URL
  if (!v) return DEFAULT_BASE
  return String(v).replace(/\/+$/, '')
}

async function request(path, options) {
  const base = getBaseUrl()
  const url = `${base}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })

  if (res.status === 204) return null

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && data.error) ||
      `Request failed: ${res.status}`
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
  listProducts: async () => normalizeArray(await request('/api/products')),
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
  listOrders: async () => normalizeArray(await request('/api/orders')),
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
  listCustomers: async () => normalizeArray(await request('/api/customers')),
  blockCustomer: async (id) =>
    normalizeId(await request(`/api/customers/${id}/block`, { method: 'POST' })),
  unblockCustomer: async (id) =>
    normalizeId(
      await request(`/api/customers/${id}/unblock`, { method: 'POST' })
    ),

  // Promos / config
  getPromos: async () => request('/api/promos'),

  // Inquiries
  submitInquiry: async (payload) =>
    request('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

