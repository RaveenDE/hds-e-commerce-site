import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const services = [
    'Stainless Steel Fabrication',
    'Hotel & Bakery Equipment',
    'Steel Fabrication',
    'Elevator Renovation',
    'Elevator Interior Solution',
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="HDS Engineering & Contractors" className="footer-logo-img" />
            </Link>
            <p className="footer-tagline">
              Professional stainless steel fabrication, kitchen equipment, and elevator solutions.
            </p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/stainless-steel-fabrication">Stainless Steel Fabrication</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/elevator-interior-solution">Elevator Interior Solution</Link></li>
              <li><Link to="/inquiry">Send Inquiry</Link></li>
              <li><Link to="/#services">Services</Link></li>
              <li><Link to="/#about">About</Link></li>
            </ul>
            <Link to="/inquiry" className="btn btn-primary footer-inquiry-btn">
              Send Inquiry
            </Link>
          </div>
          <div className="footer-services">
            <h4>Our Services</h4>
            <ul>
              {services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HDS Engineering & Contractors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
