import { useState } from 'react'
import { useAdminStore } from '../../context/AdminStoreContext'
import { formatLKR } from '../../utils/formatCurrency'
import './AdminOrders.css'

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Returned', 'Refunded']

function generateInvoice(order) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow popups to generate invoice.')
    return
  }
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${order.id}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
    h1 { font-size: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
    .total { font-weight: 700; font-size: 1.1rem; }
    .meta { color: #666; font-size: 0.875rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>HDS Engineering & Contractors</h1>
  <p>Invoice <strong>${order.id}</strong></p>
  <p>Date: ${order.date}</p>
  <p>Customer: ${order.customerName}</p>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
    <tbody>
      ${order.items.map((i) => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${formatLKR(i.price)}</td><td>${formatLKR(i.qty * i.price)}</td></tr>`).join('')}
    </tbody>
  </table>
  <p class="total">Total: ${formatLKR(order.total)}</p>
  <p class="meta">Status: ${order.status}</p>
  <p class="meta">Thank you for your business.</p>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>
  `)
  win.document.close()
}

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useAdminStore()
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase())
    : orders

  return (
    <div className="admin-orders">
      <header className="admin-page-header admin-page-header-flex">
        <h1 className="admin-page-title">Order Management</h1>
        <div className="admin-filter">
          <label htmlFor="order-status-filter">Status:</label>
          <select id="order-status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="admin-card">
        <div className="admin-card-header">Orders ({filtered.length})</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.customerName}</td>
                  <td>{order.date}</td>
                  <td>{formatLKR(order.total)}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="admin-select-inline"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => generateInvoice(order)}
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="admin-empty">No orders match the filter.</div>}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">Returns & refunds</div>
        <p className="admin-card-note">
          Change order status to <strong>Returned</strong> or <strong>Refunded</strong> using the status dropdown above.
          Refunded orders are excluded from revenue; returned items can be restocked manually in Inventory.
        </p>
      </div>
    </div>
  )
}
