import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const services = [
    'Stainless Steel Fabrication',
    'Hotel & Bakery Equipment',
    'Steel Fabrication',
    'Elevator Renovation',
    'Elevator Interior Solution',
    'Railing & Balustrade',
  ]

  return (
    <footer className="footer">
      <div className="container">
        <section className="footer-contact">
          <h2 className="footer-contact-title">Contact Us</h2>
          <p className="footer-contact-subtitle">
            Get in touch for quotes, project discussions, or general inquiries.
          </p>
          <div className="footer-contact-grid">
            <div className="footer-contact-card">
              <span className="footer-contact-icon" aria-hidden="true">📍</span>
              <h3 className="footer-contact-card-title">Address</h3>
              <p className="footer-contact-card-text">
                7/11,Dhammananda Mawatha,Walana<br />
                Panadura, Sri Lanka
              </p>
            </div>  
            <div className="footer-contact-card">
              <span className="footer-contact-icon" aria-hidden="true">📞</span>
              <h3 className="footer-contact-card-title">Phone</h3>
              <p className="footer-contact-card-text">
                <a href="tel:+94 70 264 0929">+94 70 264 0929</a>
              </p>
            </div>
            <div className="footer-contact-card">
              <span className="footer-contact-icon" aria-hidden="true">✉️</span>
              <h3 className="footer-contact-card-title">Email</h3>
              <p className="footer-contact-card-text">
                <a href="mailto:info@hds.com">hamiltonsons@gmail.com</a>
              </p>
            </div>
            <div className="footer-contact-card">
              <span className="footer-contact-icon" aria-hidden="true">🕐</span>
              <h3 className="footer-contact-card-title">Hours</h3>
              <p className="footer-contact-card-text">
                Mon – Sat: 8:00 AM – 5:00 PM<br />
                Sat: By appointment
              </p>
            </div>
          </div>
        </section>
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
              <li><Link to="/elevator-interior-solution">Elevator Interior Solution</Link></li>
              <li><Link to="/railing-balustrade">Railing & Balustrade</Link></li>
              <li><Link to="/inquiry">Send Inquiry</Link></li>
              <li><Link to="/#services">Services</Link></li>
              <li><Link to="/#about">About</Link></li>
            </ul>
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
