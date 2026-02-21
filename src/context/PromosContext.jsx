import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { hdsApi } from '../api/hdsApi'

const PromosContext = createContext(null)

const FALLBACK = {
  PROMO_CODES: {},
  FREE_SHIPPING_THRESHOLD: 25000,
  DEFAULT_SHIPPING_COST: 500,
}

export function PromosProvider({ children }) {
  const [data, setData] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const promos = await hdsApi.getPromos()
      setData({
        PROMO_CODES: promos?.PROMO_CODES || {},
        FREE_SHIPPING_THRESHOLD:
          promos?.FREE_SHIPPING_THRESHOLD ?? FALLBACK.FREE_SHIPPING_THRESHOLD,
        DEFAULT_SHIPPING_COST:
          promos?.DEFAULT_SHIPPING_COST ?? FALLBACK.DEFAULT_SHIPPING_COST,
      })
    } catch (e) {
      setError(e)
      setData(FALLBACK)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(() => {
    return {
      ...data,
      loading,
      error,
      reload: load,
    }
  }, [data, loading, error, load])

  return <PromosContext.Provider value={value}>{children}</PromosContext.Provider>
}

export function usePromos() {
  const ctx = useContext(PromosContext)
  if (!ctx) throw new Error('usePromos must be used within PromosProvider')
  return ctx
}

