import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { products as initialProducts } from '../data/products'

const STORAGE_KEY = 'hds-admin-data'

function extendProduct(p, index) {
  return {
    ...p,
    sku: p.sku || `SKU-${String(p.id).padStart(3, '0')}`,
    stock: p.stock ?? 50,
    lowStockThreshold: p.lowStockThreshold ?? 10,
    featured: p.featured ?? false,
    discount: p.discount ?? 0,
    tags: p.tags || [],
    images: p.images || (p.image ? [p.image] : []),
  }
}

function defaultData() {
  const products = initialProducts.map((p, i) => extendProduct(p, i))
  const customers = [
    { id: 'c1', name: 'Nimal Perera', email: 'nimal@example.com', blocked: false, orderCount: 5, totalSpent: 125000 },
    { id: 'c2', name: 'Kamala Silva', email: 'kamala@example.com', blocked: false, orderCount: 2, totalSpent: 44100 },
    { id: 'c3', name: 'Sunil Fernando', email: 'sunil@example.com', blocked: false, orderCount: 1, totalSpent: 25300 },
    { id: 'c4', name: 'Anura Bandara', email: 'anura@example.com', blocked: true, orderCount: 0, totalSpent: 0 },
  ]
  const orders = [
    { id: 'ord-001', customerId: 'c1', customerName: 'Nimal Perera', items: [{ productId: '1', name: 'Stainless Steel Cutlery Set', qty: 2, price: 15700 }], total: 31400, status: 'Delivered', date: '2025-02-10' },
    { id: 'ord-002', customerId: 'c2', customerName: 'Kamala Silva', items: [{ productId: '3', name: 'Stainless Steel Pot with Glass Lid', qty: 1, price: 25300 }, { productId: '5', name: 'Stainless Steel Frying Pan', qty: 1, price: 18900 }], total: 44200, status: 'Shipped', date: '2025-02-12' },
    { id: 'ord-003', customerId: 'c1', customerName: 'Nimal Perera', items: [{ productId: '4', name: 'Stainless Steel Stockpot', qty: 1, price: 28500 }], total: 28500, status: 'Pending', date: '2025-02-14' },
    { id: 'ord-004', customerId: 'c3', customerName: 'Sunil Fernando', items: [{ productId: '3', name: 'Stainless Steel Pot with Glass Lid', qty: 1, price: 25300 }], total: 25300, status: 'Delivered', date: '2025-02-08' },
    { id: 'ord-005', customerId: 'c1', customerName: 'Nimal Perera', items: [{ productId: '2', name: 'Stainless Steel Food Container', qty: 3, price: 10200 }], total: 30600, status: 'Returned', date: '2025-02-01' },
  ]
  return { products, customers, orders }
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.products) data.products = data.products.map(extendProduct)
    return data
  } catch {
    return null
  }
}

function saveStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('AdminStore: could not save', e)
  }
}

const initialState = (() => {
  const stored = loadStored()
  if (stored && stored.products?.length) return stored
  return defaultData()
})()

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }
    case 'SET_ORDERS':
      return { ...state, orders: action.payload }
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload }
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, extendProduct(action.payload)] }
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? extendProduct({ ...p, ...action.payload }) : p)),
      }
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) }
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] }
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.payload.id ? { ...o, status: action.payload.status } : o)),
      }
    case 'BLOCK_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload ? { ...c, blocked: true } : c)),
      }
    case 'UNBLOCK_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload ? { ...c, blocked: false } : c)),
      }
    case 'BULK_UPDATE_INVENTORY':
      return {
        ...state,
        products: state.products.map((p) => {
          const update = action.payload.find((u) => u.sku === p.sku || u.id === p.id)
          if (!update) return p
          return { ...p, stock: update.stock ?? p.stock, sku: update.sku ?? p.sku }
        }),
      }
    default:
      return state
  }
}

const AdminStoreContext = createContext(null)

export function AdminStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    saveStored(state)
  }, [state])

  const addProduct = useCallback((product) => {
    const id = String(Date.now())
    dispatch({ type: 'ADD_PRODUCT', payload: { ...product, id } })
    return id
  }, [])

  const updateProduct = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, ...updates } })
  }, [])

  const deleteProduct = useCallback((id) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
  }, [])

  const addOrder = useCallback((order) => {
    dispatch({ type: 'ADD_ORDER', payload: order })
  }, [])

  const updateOrderStatus = useCallback((orderId, status) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: orderId, status } })
  }, [])

  const blockCustomer = useCallback((id) => {
    dispatch({ type: 'BLOCK_CUSTOMER', payload: id })
  }, [])

  const unblockCustomer = useCallback((id) => {
    dispatch({ type: 'UNBLOCK_CUSTOMER', payload: id })
  }, [])

  const bulkUpdateInventory = useCallback((updates) => {
    dispatch({ type: 'BULK_UPDATE_INVENTORY', payload: updates })
  }, [])

  const value = {
    ...state,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrderStatus,
    blockCustomer,
    unblockCustomer,
    bulkUpdateInventory,
  }

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext)
  if (!ctx) throw new Error('useAdminStore must be used within AdminStoreProvider')
  return ctx
}
