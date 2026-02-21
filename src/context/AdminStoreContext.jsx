import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { hdsApi } from '../api/hdsApi'

const AdminStoreContext = createContext(null)

export function AdminStoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, o, c] = await Promise.all([
        hdsApi.listProducts(),
        hdsApi.listOrders(),
        hdsApi.listCustomers(),
      ])
      setProducts(p)
      setOrders(o)
      setCustomers(c)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const addProduct = useCallback(async (product) => {
    const res = await hdsApi.createProduct(product)
    if (res?.product) setProducts((prev) => [...prev, res.product])
    return res?.id
  }, [])

  const updateProduct = useCallback(async (id, updates) => {
    const updated = await hdsApi.updateProduct(id, updates)
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)))
  }, [])

  const deleteProduct = useCallback(async (id) => {
    await hdsApi.deleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const bulkUpdateInventory = useCallback(async (updates) => {
    await hdsApi.bulkUpdateInventory(updates)
    const p = await hdsApi.listProducts()
    setProducts(p)
  }, [])

  const addOrder = useCallback(async (order) => {
    const res = await hdsApi.placeOrder(order)
    if (res?.order) setOrders((prev) => [res.order, ...prev])
    return res?.id
  }, [])

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const updated = await hdsApi.updateOrderStatus(orderId, status)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
    )
  }, [])

  const blockCustomer = useCallback(async (id) => {
    const updated = await hdsApi.blockCustomer(id)
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }, [])

  const unblockCustomer = useCallback(async (id) => {
    const updated = await hdsApi.unblockCustomer(id)
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }, [])

  const value = useMemo(() => {
    return {
      products,
      orders,
      customers,
      loading,
      error,
      reload,
      addProduct,
      updateProduct,
      deleteProduct,
      addOrder,
      updateOrderStatus,
      blockCustomer,
      unblockCustomer,
      bulkUpdateInventory,
    }
  }, [
    products,
    orders,
    customers,
    loading,
    error,
    reload,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrderStatus,
    blockCustomer,
    unblockCustomer,
    bulkUpdateInventory,
  ])

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  )
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext)
  if (!ctx) throw new Error('useAdminStore must be used within AdminStoreProvider')
  return ctx
}
