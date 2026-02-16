import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/stainless-steel-fabrication', label: 'Stainless Steel' },
    { to: '/shop', label: 'Shop' },
    { to: '/elevator-interior-solution', label: 'Elevator Interior' },
    { to: '/#services', label: 'Services' },
    { to: '/#about', label: 'About' },
    { to: '/admin', label: 'Admin' },
  ]

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
              const isActive = location.pathname === to || (to === '/#services' && location.pathname === '/') || (to === '/admin' && location.pathname.startsWith('/admin'))
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
