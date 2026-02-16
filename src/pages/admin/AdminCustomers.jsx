import { useAdminStore } from '../../context/AdminStoreContext'
import { formatLKR } from '../../utils/formatCurrency'
import './AdminCustomers.css'

export default function AdminCustomers() {
  const { customers, blockCustomer, unblockCustomer } = useAdminStore()

  return (
    <div className="admin-customers">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Customer Management</h1>
      </header>

      <div className="admin-card">
        <div className="admin-card-header">Customers ({customers.length})</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Order count</th>
                <th>Total value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.orderCount}</td>
                  <td>{formatLKR(c.totalSpent)}</td>
                  <td>
                    {c.blocked ? (
                      <span className="admin-badge admin-badge-refunded">Blocked</span>
                    ) : (
                      <span className="admin-badge admin-badge-delivered">Active</span>
                    )}
                  </td>
                  <td>
                    {c.blocked ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => unblockCustomer(c.id)}
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => blockCustomer(c.id)}
                      >
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">Order frequency & value</div>
        <p className="admin-card-note">
          Order count and total value are derived from order history. Block suspicious users to prevent them from placing new orders.
        </p>
      </div>
    </div>
  )
}
