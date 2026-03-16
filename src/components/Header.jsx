import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = useMemo(() => [
    { to: '/', label: 'Home' },
    { to: '/#services', label: 'Services' },
    { to: '/#about', label: 'About Us' },
    { to: '/inquiry', label: 'Contact Us' },
  ], [])

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
                (to === '/' && location.pathname === '/' && !location.hash) ||
                (to === '/#services' && location.pathname === '/' && location.hash === '#services') ||
                (to === '/#about' && location.pathname === '/' && location.hash === '#about') ||
                (to === '/inquiry' && location.pathname === '/inquiry')
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
        </nav>
      </div>
    </header>
  )
}
