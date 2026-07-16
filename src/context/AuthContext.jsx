import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const apiBase = useMemo(
    () =>
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? 'http://localhost:3001' : ''),
    []
  )

  // Auth is intentionally disabled for this deployment.
  const [state, setState] = useState({
    loading: false,
    user: { email: 'guest@local', admin: true },
  })

  const refresh = useCallback(async () => {
    // Auth disabled: keep a static admin user in state and skip network calls.
    setState({ loading: false, user: { email: 'guest@local', admin: true } })
    return { email: 'guest@local', admin: true }
  }, [apiBase])

  useEffect(() => {
    refresh()
  }, [refresh])

  const loginWithGoogle = useCallback(
    (_returnTo = '/admin') => {},
    [apiBase]
  )

  const logout = useCallback(async () => {
    // Auth disabled: no-op logout keeps local static session.
    setState({ loading: false, user: { email: 'guest@local', admin: true } })
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

