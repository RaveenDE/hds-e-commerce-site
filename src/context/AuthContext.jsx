import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:3001',
    []
  )

  const [state, setState] = useState({ loading: true, user: null })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, { credentials: 'include' })
      if (!res.ok) {
        setState({ loading: false, user: null })
        return null
      }
      const data = await res.json()
      setState({ loading: false, user: data.user || null })
      return data.user || null
    } catch {
      setState({ loading: false, user: null })
      return null
    }
  }, [apiBase])

  useEffect(() => {
    refresh()
  }, [refresh])

  const loginWithGoogle = useCallback(
    (returnTo = '/admin') => {
      window.location.href = `${apiBase}/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`
    },
    [apiBase]
  )

  const logout = useCallback(async () => {
    try {
      await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setState({ loading: false, user: null })
    }
  }, [apiBase])

  const value = useMemo(
    () => ({
      apiBase,
      loading: state.loading,
      user: state.user,
      refresh,
      loginWithGoogle,
      logout,
    }),
    [apiBase, state.loading, state.user, refresh, loginWithGoogle, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

