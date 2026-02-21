import { useParams, Link } from 'react-router-dom'
import { useAdminStore } from '../context/AdminStoreContext'
import { formatLKR } from '../utils/formatCurrency'
import './CheckoutConfirmation.css'

export default function CheckoutConfirmation() {
  const { orderId } = useParams()
  const { orders, loading } = useAdminStore()
  const order = orders.find((o) => o.id === orderId)

  if (loading && !order) {
    return (
      <main className="page confirmation-page">
        <div className="container">
          <div className="confirmation-card confirmation-not-found">
            <h1>Loading order…</h1>
            <p>Please wait.</p>
          </div>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="page confirmation-page">
        <div className="container">
          <div className="confirmation-card confirmation-not-found">
            <h1>Order not found</h1>
            <p>This order may not exist or the link is incorrect.</p>
            <Link to="/shop" className="btn btn-primary">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const addr = order.shippingAddress || {}

  return (
    <main className="page confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <div className="confirmation-success" aria-hidden="true">
            ✓
          </div>
          <h1 className="confirmation-title">Thank you for your order</h1>
          <p className="confirmation-id">
            Order ID: <strong>{order.id}</strong>
          </p>
          <p className="confirmation-email">
            A confirmation email will be sent to {order.customerEmail || 'you'}.
          </p>

          <div className="confirmation-details">
            <h2>Order details</h2>
            <ul className="confirmation-items">
              {order.items.map((item, i) => (
                <li key={i}>
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatLKR(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="confirmation-total">
              <span>Total</span>
              <span>{formatLKR(order.total)}</span>
            </div>
          </div>

          {(addr.line1 || addr.city) && (
            <div className="confirmation-shipping">
              <h2>Shipping to</h2>
              <p>
                {addr.fullName}<br />
                {addr.line1}
                {addr.line2 && <><br />{addr.line2}</>}
                <br />
                {addr.city}
                {addr.postal && ` ${addr.postal}`}
                {addr.country && <><br />{addr.country}</>}
              </p>
            </div>
          )}

          <div className="confirmation-actions">
            <Link to="/shop" className="btn btn-primary">
              Continue shopping
            </Link>
            <Link to="/" className="btn btn-outline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
