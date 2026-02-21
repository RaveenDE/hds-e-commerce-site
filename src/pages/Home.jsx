import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../context/AdminStoreContext'
import ProductCard from '../components/ProductCard'
import './Home.css'

const services = [
  {
    id: 'stainless',
    title: 'Stainless Steel Fabrication',
    description: 'Custom fabrication for commercial kitchens, food processing, and industrial applications. Precision-cut, welded, and finished to your specs.',
    icon: '◆',
  },
  {
    id: 'hotel-bakery',
    title: 'Hotel & Bakery Equipment',
    description: 'Complete range of commercial kitchen and bakery equipment—worktables, ovens, shelving, and custom solutions for hospitality.',
    icon: '◇',
  },
  {
    id: 'steel',
    title: 'Steel Fabrication',
    description: 'Structural and architectural steel fabrication for buildings, machinery guards, and heavy-duty industrial installations.',
    icon: '▣',
  },
  {
    id: 'elevator-renovation',
    title: 'Elevator Renovation',
    description: 'Full elevator cabin and system modernization. Safety upgrades, door systems, and control panel replacements.',
    icon: '⬡',
  },
  {
    id: 'elevator-interior',
    title: 'Elevator Interior Solution',
    description: 'Bespoke elevator interiors in stainless steel, glass, and premium finishes. Design, manufacture, and install.',
    icon: '⬢',
  },
]

export default function Home() {
  const { products } = useAdminStore()
  const featuredProducts = products.slice(0, 6)

  useEffect(() => {
    if (window.location.hash === '#services') {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
    }
    if (window.location.hash === '#about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <img src="/hero-kitchen.jpg" alt="" className="hero-bg-image" />
        </div>
        <div className="container hero-inner">
          <h1 className="hero-title">
            <span className="hero-title-line">Engineering</span>
            <span className="hero-title-line accent"> & Contracting </span>
            <span className="hero-title-line">Excellence</span>
          </h1>
          <p className="hero-subtitle">
            Stainless steel fabrication, hotel & bakery equipment, steel fabrication, and elevator renovation—delivered with precision and reliability.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop
            </Link>
            <a href="#services" className="btn btn-secondary btn-lg">
              Our Services
            </a>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      <section id="services" className="section services">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">What We Do</h2>
            <p className="section-subtitle">
              From kitchen equipment to elevator interiors, we deliver end-to-end fabrication and contracting solutions.
            </p>
          </header>
          <div className="services-grid">
            {services.map((s) => (
              <article key={s.id} className="service-card">
                {s.id === 'stainless' ? (
                  <Link to="/stainless-steel-fabrication" className="service-card-inner">
                    <div className="service-icon">{s.icon}</div>
                    <h3 className="service-title">{s.title}</h3>
                    <p className="service-desc">{s.description}</p>
                    <span className="service-card-link">View examples →</span>
                  </Link>
                ) : s.id === 'elevator-interior' ? (
                  <Link to="/elevator-interior-solution" className="service-card-inner">
                    <div className="service-icon">{s.icon}</div>
                    <h3 className="service-title">{s.title}</h3>
                    <p className="service-desc">{s.description}</p>
                    <span className="service-card-link">View examples →</span>
                  </Link>
                ) : (
                  <>
                    <div className="service-icon">{s.icon}</div>
                    <h3 className="service-title">{s.title}</h3>
                    <p className="service-desc">{s.description}</p>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="section products-home">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">Featured Kitchenware</h2>
            <p className="section-subtitle">
              Professional stainless steel equipment for commercial kitchens, hotels, and bakeries.
            </p>
          </header>
          <div className="products-home-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="products-home-cta">
            <Link to="/shop" className="btn btn-primary btn-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="section about">
        <div className="container about-inner">
          <div className="about-content">
            <h2 className="section-title">Built on Quality & Trust</h2>
            <p className="about-lead">
              HDS Engineering & Contractors brings decades of expertise in stainless steel and steel fabrication, commercial kitchen equipment, and elevator solutions.
            </p>
            <p className="about-text">
              We work with hotels, bakeries, restaurants, and building owners to design, fabricate, and install equipment and interiors that meet the highest standards. Every project is backed by our commitment to durability, hygiene, and aesthetics.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Explore Products
            </Link>
          </div>
          <div className="about-visual">
            <div className="about-visual-block" />
            <div className="about-visual-block accent" />
          </div>
        </div>
      </section>

      <section className="section cta">
        <div className="container cta-inner">
          <h2 className="cta-title">Ready to Start Your Project?</h2>
          <p className="cta-text">
            Get a quote for fabrication, equipment, or elevator renovation. Our team will respond within 24 hours.
          </p>
          <div className="cta-actions">
            <Link to="/inquiry" className="btn btn-primary btn-lg">
              Send Inquiry
            </Link>
            <a href="mailto:info@hds.com" className="btn btn-secondary btn-lg">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
