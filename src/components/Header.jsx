import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { itemCount } = useCart()
  const { user } = useAuth()

  const navLinks = useMemo(() => {
    const links = [
      { to: '/', label: 'Home' },
      { to: '/stainless-steel-fabrication', label: 'Stainless Steel' },
      { to: '/shop', label: 'Shop' },
      { to: '/elevator-interior-solution', label: 'Elevator Interior' },
      { to: '/#services', label: 'Services' },
      { to: '/#about', label: 'About' },
      { to: user ? '/account' : '/account/login', label: 'Account' },
      { to: '/admin', label: 'Admin' },
    ]
    return links
  }, [user])

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="HDS Engineering & Contractors - Home">
          <img src="/logo.png" alt="HDS Engineering & Contractors" className="logo-img" />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {navLinks.map(({ to, label }) => {
              const isActive =
                location.pathname === to ||
                (to === '/#services' && location.pathname === '/') ||
                (to === '/admin' && location.pathname.startsWith('/admin')) ||
                (to === '/account' && location.pathname.startsWith('/account')) ||
                (to === '/account/login' && location.pathname.startsWith('/account'))
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={isActive ? 'nav-link active' : 'nav-link'}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <Link
            to="/cart"
            className="header-cart-link"
            onClick={() => setMenuOpen(false)}
            aria-label={`Cart, ${itemCount} items`}
          >
            <span className="header-cart-icon" aria-hidden="true">🛒</span>
            <span className="header-cart-label">Cart</span>
            {itemCount > 0 && (
              <span className="header-cart-count">{itemCount}</span>
            )}
          </Link>
          <Link
            to="/shop"
            className="btn btn-primary header-cta"
            onClick={() => setMenuOpen(false)}
          >
            Shop Now
          </Link>
        </nav>
      </div>
    </header>
  )
}
