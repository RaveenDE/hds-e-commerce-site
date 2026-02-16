import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { useCart, useCartTotals } from '../context/CartContext'
import { formatLKR } from '../utils/formatCurrency'
import { PROMO_CODES } from '../data/promos'
import './Cart.css'

function getProduct(id) {
  return products.find((p) => p.id === id)
}

function getProductPrice(productId) {
  const p = getProduct(productId)
  return p ? p.price : 0
}

export default function Cart() {
  const { items, removeItem, updateQty, setPromoCode, clearPromoCode, promoCode } = useCart()
  const getPrice = (id) => getProductPrice(id)
  const { subtotal, shipping, discount, total, promo } = useCartTotals(getPrice)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    setPromoError('')
    if (!code) return
    if (PROMO_CODES[code]) {
      setPromoCode(code)
      setPromoInput('')
    } else {
      setPromoError('Invalid promo code')
    }
  }

  if (items.length === 0) {
    return (
      <main className="page cart-page">
        <div className="container">
          <h1 className="cart-title">Your cart</h1>
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page cart-page">
      <div className="container">
        <h1 className="cart-title">Your cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(({ productId, qty }) => {
              const product = getProduct(productId)
              if (!product) return null
              return (
                <div key={productId} className="cart-row">
                  <Link to={`/shop/product/${productId}`} className="cart-row-image-wrap">
                    <img src={product.image} alt="" className="cart-row-image" />
                  </Link>
                  <div className="cart-row-details">
                    <Link to={`/shop/product/${productId}`} className="cart-row-name">
                      {product.name}
                    </Link>
                    <p className="cart-row-price">{formatLKR(product.price)}</p>
                    <div className="cart-row-actions">
                      <div className="qty-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(productId, qty - 1)}
                        >
                          −
                        </button>
                        <span className="qty-value" aria-live="polite">
                          {qty}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(productId, qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeItem(productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="cart-row-total">
                    {formatLKR(product.price * qty)}
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary-title">Order summary</h2>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatLKR(shipping)}</span>
              </div>
              {promo && (
                <div className="cart-summary-row cart-summary-discount">
                  <span>Discount ({promo.label})</span>
                  <span>−{formatLKR(discount)}</span>
                </div>
              )}
            </div>

            <div className="cart-promo">
              <label htmlFor="cart-promo-input" className="cart-promo-label">
                Promo code
              </label>
              <div className="cart-promo-input-wrap">
                <input
                  id="cart-promo-input"
                  type="text"
                  className="cart-promo-input"
                  placeholder="Enter code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={applyPromo}>
                  Apply
                </button>
              </div>
              {promoCode && (
                <p className="cart-promo-applied">
                  <span>{promoCode}</span>
                  <button type="button" className="cart-promo-remove" onClick={clearPromoCode}>
                    Remove
                  </button>
                </p>
              )}
              {promoError && <p className="cart-promo-error">{promoError}</p>}
            </div>

            <div className="cart-summary-total">
              <span>Total</span>
              <span>{formatLKR(total)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg cart-checkout-btn">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

