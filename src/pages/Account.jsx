import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { loading, user, logout } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search || ''}`
    return <Navigate to={`/account/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ marginTop: 0 }}>My account</h1>
      <p style={{ opacity: 0.85 }}>
        Signed in as <strong>{user.email}</strong>
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
        <button className="btn btn-primary" type="button" onClick={logout}>
          Logout
        </button>
        <Link className="btn" to="/shop">
          Continue shopping
        </Link>
      </div>

      <div style={{ marginTop: 28, opacity: 0.8 }}>
        Order history can be added next (requires checkout to save orders to the backend).
      </div>
    </div>
  )
}

