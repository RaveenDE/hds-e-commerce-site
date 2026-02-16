import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { products } from '../data/products'
import { useCart, useCartTotals } from '../context/CartContext'
import { useAdminStore } from '../context/AdminStoreContext'
import { formatLKR } from '../utils/formatCurrency'
import { PROMO_CODES, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from '../data/promos'
import {
  getSavedAddresses,
  addSavedAddress,
  deleteSavedAddress,
} from '../utils/addressStorage'
import './Checkout.css'

function getProduct(id) {
  return products.find((p) => p.id === id)
}

function getProductPrice(productId) {
  const p = getProduct(productId)
  return p ? p.price : 0
}

const emptyAddress = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  postal: '',
  country: 'Sri Lanka',
  phone: '',
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, promoCode, setPromoCode, clearPromoCode, clearCart } = useCart()
  const { addOrder } = useAdminStore()
  const getPrice = (id) => getProductPrice(id)
  const { subtotal, shipping, discount, total, promo } = useCartTotals(getPrice)

  const [checkoutType, setCheckoutType] = useState('guest') // 'guest' | 'account'
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [address, setAddress] = useState(emptyAddress)
  const [saveAddress, setSaveAddress] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    setSavedAddresses(getSavedAddresses())
  }, [])

  useEffect(() => {
    if (selectedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId)
      if (addr) setAddress({ ...emptyAddress, ...addr })
    }
  }, [selectedAddressId, savedAddresses])

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

  const handlePlaceOrder = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      alert('Please enter your email.')
      return
    }
    if (!address.fullName?.trim() || !address.line1?.trim() || !address.city?.trim()) {
      alert('Please fill in required address fields.')
      return
    }
    setPlacing(true)
    const orderId = `ord-${Date.now()}`
    const orderItems = items.map(({ productId, qty }) => {
      const p = getProduct(productId)
      return {
        productId: p?.id,
        name: p?.name || 'Product',
        qty,
        price: p?.price || 0,
      }
    })
    const order = {
      id: orderId,
      customerId: checkoutType === 'account' ? `guest-${email}` : null,
      customerName: address.fullName.trim(),
      customerEmail: email.trim(),
      items: orderItems,
      total,
      subtotal,
      shipping,
      discount: discount || 0,
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
      shippingAddress: { ...address },
    }
    addOrder(order)
    if (saveAddress) {
      addSavedAddress(address)
    }
    clearCart()
    setPlacing(false)
    navigate(`/checkout/confirmation/${orderId}`)
  }

  if (items.length === 0 && !placing) {
    navigate('/cart')
    return null
  }

  return (
    <main className="page checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <div className="checkout-main">
            {/* Checkout type */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">Checkout as</h2>
              <div className="checkout-type-toggle">
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="checkoutType"
                    checked={checkoutType === 'guest'}
                    onChange={() => setCheckoutType('guest')}
                  />
                  <span>Guest checkout</span>
                </label>
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="checkoutType"
                    checked={checkoutType === 'account'}
                    onChange={() => setCheckoutType('account')}
                  />
                  <span>Use saved address</span>
                </label>
              </div>
            </section>

            {/* Contact */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">Contact</h2>
              <div className="checkout-fields">
                <div className="checkout-field">
                  <label htmlFor="checkout-email">Email *</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="checkout-phone">Phone</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07X XXX XXXX"
                  />
                </div>
              </div>
            </section>

            {/* Shipping address */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">Shipping address</h2>
              {checkoutType === 'account' && savedAddresses.length > 0 && (
                <div className="checkout-address-select">
                  <label htmlFor="checkout-address">Saved addresses</label>
                  <select
                    id="checkout-address"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <option value="">Select or add new below</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName}, {a.line1}, {a.city}
                      </option>
                    ))}
                  </select>
                  {selectedAddressId && (
                    <button
                      type="button"
                      className="checkout-remove-addr"
                      onClick={() => {
                        deleteSavedAddress(selectedAddressId)
                        setSavedAddresses(getSavedAddresses())
                        setSelectedAddressId('')
                        setAddress(emptyAddress)
                      }}
                    >
                      Remove this address
                    </button>
                  )}
                </div>
              )}
              <div className="checkout-fields">
                <div className="checkout-field">
                  <label htmlFor="addr-fullName">Full name *</label>
                  <input
                    id="addr-fullName"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}
                    placeholder="Nimal Perera"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="addr-line1">Address line 1 *</label>
                  <input
                    id="addr-line1"
                    required
                    value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    placeholder="Street, building"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="addr-line2">Address line 2</label>
                  <input
                    id="addr-line2"
                    value={address.line2}
                    onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="checkout-field-row">
                  <div className="checkout-field">
                    <label htmlFor="addr-city">City *</label>
                    <input
                      id="addr-city"
                      required
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      placeholder="Colombo"
                    />
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="addr-postal">Postal code</label>
                    <input
                      id="addr-postal"
                      value={address.postal}
                      onChange={(e) => setAddress((a) => ({ ...a, postal: e.target.value }))}
                      placeholder="10100"
                    />
                  </div>
                </div>
                <div className="checkout-field">
                  <label htmlFor="addr-country">Country</label>
                  <input
                    id="addr-country"
                    value={address.country}
                    onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="addr-phone">Phone (for delivery)</label>
                  <input
                    id="addr-phone"
                    type="tel"
                    value={address.phone || phone}
                    onChange={(e) => {
                      setAddress((a) => ({ ...a, phone: e.target.value }))
                      setPhone(e.target.value)
                    }}
                    placeholder="07X XXX XXXX"
                  />
                </div>
              </div>
              <label className="checkout-checkbox">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                <span>Save this address for future orders</span>
              </label>
            </section>
          </div>

          <aside className="checkout-summary">
            <h2 className="checkout-summary-title">Order summary</h2>
            <div className="checkout-summary-items">
              {items.map(({ productId, qty }) => {
                const product = getProduct(productId)
                if (!product) return null
                return (
                  <div key={productId} className="checkout-summary-row">
                    <span className="checkout-summary-name">
                      {product.name} × {qty}
                    </span>
                    <span>{formatLKR(product.price * qty)}</span>
                  </div>
                )
              })}
            </div>
            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Shipping</span>
                <span>
                  {shipping === 0
                    ? 'Free'
                    : formatLKR(shipping) + (subtotal < FREE_SHIPPING_THRESHOLD ? ` (free over ${formatLKR(FREE_SHIPPING_THRESHOLD)})` : '')}
                </span>
              </div>
              {promo && (
                <div className="checkout-summary-row checkout-summary-discount">
                  <span>Discount ({promo.label})</span>
                  <span>−{formatLKR(discount)}</span>
                </div>
              )}
            </div>
            <div className="checkout-promo">
              <input
                type="text"
                className="checkout-promo-input"
                placeholder="Promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={applyPromo}>
                Apply
              </button>
              {promoCode && (
                <span className="checkout-promo-applied">
                  {promoCode}{' '}
                  <button type="button" className="checkout-promo-remove" onClick={clearPromoCode}>
                    Remove
                  </button>
                </span>
              )}
              {promoError && <p className="checkout-promo-error">{promoError}</p>}
            </div>
            <div className="checkout-summary-total">
              <span>Total</span>
              <span>{formatLKR(total)}</span>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg checkout-submit"
              disabled={placing}
            >
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </aside>
        </form>
      </div>
    </main>
  )
}
