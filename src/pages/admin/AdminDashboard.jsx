import { useAdminStore } from '../../context/AdminStoreContext'

export default function AdminDashboard() {
  const { products, orders, customers } = useAdminStore()
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length
  const lowStock = products.filter((p) => p.stock <= (p.lowStockThreshold ?? 10)).length
  const totalRevenue = orders.filter((o) => !['Returned', 'Refunded'].includes(o.status)).reduce((s, o) => s + o.total, 0)

  return (
    <div className="admin-dashboard">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
      </header>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-value">{products.length}</span>
          <span className="admin-stat-label">Products</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{orders.length}</span>
          <span className="admin-stat-label">Orders</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{pendingOrders}</span>
          <span className="admin-stat-label">Pending orders</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{lowStock}</span>
          <span className="admin-stat-label">Low stock alerts</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{customers.length}</span>
          <span className="admin-stat-label">Customers</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">Rs. {totalRevenue.toLocaleString()}</span>
          <span className="admin-stat-label">Revenue (excl. returns)</span>
        </div>
      </div>
    </div>
  )
}
