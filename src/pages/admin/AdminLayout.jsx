import { Outlet, NavLink } from 'react-router-dom'
import './AdminLayout.css'

const nav = [
  { to: '/admin', end: true, label: 'Dashboard' },
  { to: '/admin/products', end: false, label: 'Products' },
  { to: '/admin/orders', end: false, label: 'Orders' },
  { to: '/admin/inventory', end: false, label: 'Inventory' },
  { to: '/admin/customers', end: false, label: 'Customers' },
]

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="admin-sidebar-title">HDS Admin</h1>
          <a href="/" className="admin-sidebar-back">← Site</a>
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
        <Outlet />
      </main>
    </div>
  )
}
