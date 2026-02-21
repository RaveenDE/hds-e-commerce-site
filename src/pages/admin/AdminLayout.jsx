import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

const nav = [
  { to: '/admin', end: true, label: 'Dashboard' },
  { to: '/admin/products', end: false, label: 'Products' },
  { to: '/admin/orders', end: false, label: 'Orders' },
  { to: '/admin/inventory', end: false, label: 'Inventory' },
  { to: '/admin/customers', end: false, label: 'Customers' },
]

export default function AdminLayout() {
  const location = useLocation()
  const { loading, user, logout } = useAuth()

  const returnTo = `${location.pathname}${location.search || ''}`

  if (loading) {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <div style={{ padding: 24 }}>Loading…</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="admin-sidebar-title">HDS Admin</h1>
          <a href="/" className="admin-sidebar-back">← Site</a>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
            Signed in as {user.email}
          </div>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={logout}>
            Logout
          </button>
          {!user.admin && (
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 8 }}>
              Your account is not an admin. Add it to <code>ADMIN_EMAILS</code> on the backend.
            </div>
          )}
        </div>
        <nav className="admin-nav">
          {nav.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        {user.admin ? <Outlet /> : <div style={{ padding: 24 }}>Forbidden</div>}
      </main>
    </div>
  )
}
