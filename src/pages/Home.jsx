import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { SITE_NAME, getCanonicalBase } from '../config/site'
import './Home.css'

const HOME_DESCRIPTION =
  'Stainless steel fabrication, hotel & bakery equipment, steel fabrication, elevator renovation, bespoke elevator interiors, and custom railings. HDS Engineering & Contractors delivers precision manufacturing and installation.'

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
  {
    id: 'railing',
    title: 'Railing & Balustrade',
    description: 'Custom metal and wood railings for stairs, decks, and platforms. Stainless steel, powder-coated steel, and integrated wood-and-metal systems.',
    icon: '▤',
  },
]

const showcaseImages = [
  {
    id: 'fab-work-table',
    image: '/fabrication/work-table.png',
    alt: 'Stainless steel work table',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-double-sink-unit',
    image: '/fabrication/double-sink-unit.png',
    alt: 'Double-basin stainless steel sink unit',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-sink-refrigeration-unit',
    image: '/fabrication/sink-refrigeration-unit.png',
    alt: 'Sink and refrigeration unit',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-cabinet-storage',
    image: '/fabrication/cabinet-storage.png',
    alt: 'Mobile stainless steel storage cabinet',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-cabinet-shelving',
    image: '/fabrication/cabinet-shelving.png',
    alt: 'Stainless steel shelving and holding unit',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-sink-unit',
    image: '/fabrication/sink-unit.png',
    alt: 'Commercial stainless steel sink unit',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-cooktop-station',
    image: '/fabrication/cooktop-station.png',
    alt: 'Stainless steel cooktop station',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-prep-unit',
    image: '/fabrication/prep-unit.png',
    alt: 'Prep and warming unit',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-exhaust-hood',
    image: '/fabrication/exhaust-hood.png',
    alt: 'Stainless steel commercial exhaust hood',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'fab-wall-sink',
    image: '/fabrication/wall-sink.png',
    alt: 'Wall-mounted stainless steel sink',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'elev-control-panel',
    image: '/elevator/interior-control-panel.png',
    alt: 'Elevator interior control panel and stainless steel wall panels',
    to: '/elevator-interior-solution',
  },
  {
    id: 'elev-checkered',
    image: '/elevator/interior-checkered.png',
    alt: 'Elevator interior with checkered flooring and brushed metal walls',
    to: '/elevator-interior-solution',
  },
  {
    id: 'elev-marble-wood',
    image: '/elevator/interior-marble-wood.png',
    alt: 'Elevator interior with marble and wood finishes',
    to: '/elevator-interior-solution',
  },
  {
    id: 'elev-blue-led',
    image: '/elevator/interior-blue-led.png',
    alt: 'Elevator interior with blue LED accents',
    to: '/elevator-interior-solution',
  },
  {
    id: 'elev-luxury-gold',
    image: '/elevator/interior-luxury-gold.png',
    alt: 'Luxury elevator interior with gold and marble finishes',
    to: '/elevator-interior-solution',
  },
  {
    id: 'railing-1',
    image: '/railing/railing-1.png',
    alt: 'Modern stainless steel staircase railing with geometric balusters',
    to: '/railing-balustrade',
  },
  {
    id: 'railing-2',
    image: '/railing/railing-2.png',
    alt: 'Open-tread staircase with wood handrails and black metal balusters',
    to: '/railing-balustrade',
  },
  {
    id: 'railing-3',
    image: '/railing/railing-3.png',
    alt: 'Wood and stainless steel railing with horizontal rod infill',
    to: '/railing-balustrade',
  },
  {
    id: 'railing-4',
    image: '/railing/railing-4.png',
    alt: 'Deck and stair railing with wood and metal combination',
    to: '/railing-balustrade',
  },
]

const featuredStatic = [
  {
    id: 'feat-1',
    image: '/featured/featured-1.png',
    title: 'Stainless Steel Stair Railing',
    description: 'Modern staircase with stainless steel handrail and horizontal rod balustrade. Clean lines and durable construction for interior or exterior use.',
    to: '/railing-balustrade',
  },
  {
    id: 'feat-2',
    image: '/featured/featured-2.png',
    title: 'L-Shaped Kitchen Counter',
    description: 'Custom stainless steel L-shaped counter with integrated sink, gas hob, and range hood. Ideal for commercial kitchens and hotel installations.',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'feat-3',
    image: '/featured/featured-3.png',
    title: 'Dual-Sink Unit',
    description: 'Professional dual-basin stainless steel sink unit with backsplash and gooseneck faucets. Built for heavy-duty commercial use.',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'feat-4',
    image: '/featured/featured-4.png',
    title: 'Modular Stainless Cabinetry',
    description: 'Upper and lower cabinets with tall utility unit. Brushed stainless steel, minimal handles, suitable for kitchens and labs.',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'feat-5',
    image: '/featured/featured-5.png',
    title: 'Commercial Kitchen Setup',
    description: 'L-shaped base cabinets with continuous countertop and wall-mounted stainless steel shelving. Full commercial kitchen fit-out.',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'feat-6',
    image: '/featured/featured-6.png',
    title: 'Gas Burner Workstation',
    description: 'Stainless steel workstation with integrated two-burner gas stove. Professional-grade for hotels, bakeries, and restaurants.',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'feat-7',
    image: '/featured/featured-7.png',
    title: 'Mobile Storage Cabinet',
    description: 'Tall stainless steel cabinet on casters with double doors. Easy to move for flexible kitchen and workshop layouts.',
    to: '/stainless-steel-fabrication',
  },
  {
    id: 'feat-8',
    image: '/featured/featured-8.png',
    title: 'Luxury Elevator Interior',
    description: 'Elevator cab with marble-style panels, gold trim, and premium finishes. Bespoke design and installation.',
    to: '/elevator-interior-solution',
  },
]

export default function Home() {
  useEffect(() => {
    if (window.location.hash === '#services') {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
    }
    if (window.location.hash === '#about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }
    if (window.location.hash === '#contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const organizationJsonLd = useMemo(() => {
    const url = getCanonicalBase()
    if (!url) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      description: HOME_DESCRIPTION,
      url,
    }
  }, [])

  return (
    <main className="home">
      <SEO
        fullTitle="HDS Engineering & Contractors | Stainless Steel & Kitchen Equipment"
        description={HOME_DESCRIPTION}
        path="/"
        jsonLd={organizationJsonLd}
      />
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
            <a href="#services" className="btn btn-primary btn-lg">
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
                ) : s.id === 'railing' ? (
                  <Link to="/railing-balustrade" className="service-card-inner">
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
            <h2 className="section-title">Featured Work</h2>
            <p className="section-subtitle">
              A quick look at our stainless steel fabrication, elevator interiors, and railing work.
            </p>
          </header>

          <div className="featured-static-grid" aria-label="Featured work highlights">
            {featuredStatic.map((item) => (
              <article key={item.id} className="featured-static-card">
                <div className="featured-static-card-image-wrap">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="featured-static-card-image"
                    loading="lazy"
                  />
                </div>
                <div className="featured-static-card-body">
                  <h3 className="featured-static-card-title">{item.title}</h3>
                  <p className="featured-static-card-desc">{item.description}</p>
                  <div className="featured-static-card-actions">
                    <Link to={item.to} className="btn featured-static-btn-view">
                      View More +
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="showcase-marquee" aria-label="Featured work image gallery">
            <div className="showcase-track">
              {[...showcaseImages, ...showcaseImages].map((item, idx) => (
                <Link
                  key={`${item.id}-${idx}`}
                  to={item.to}
                  className="showcase-slide"
                  aria-label={`View ${item.to === '/stainless-steel-fabrication' ? 'stainless steel fabrication' : item.to === '/elevator-interior-solution' ? 'elevator interior' : item.to === '/railing-balustrade' ? 'railing' : 'examples'} examples`}
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="showcase-slide-image"
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section about">
        <div className="container about-inner">
          <div className="about-content">
            <h2 className="section-title">About Us</h2>
            <p className="about-lead">
              Hamilton De Silva & Sons (HDS Engineering & Contractors) is a Sri Lankan engineering company established in 1996, specializing in stainless steel fabrication, hotel and bakery equipment, elevator renovations, elevator interior solutions, and construction interior work.
            </p>
            <p className="about-text">
              With decades of industry experience, we are committed to delivering high-quality, durable, and customized engineering solutions through skilled craftsmanship and professional service.
            </p>
          </div>
          <div className="about-visual">
            <img
              src="/about-hds.png"
              alt="HDS Engineering & Contractors - cityscape"
              className="about-visual-image"
            />
          </div>
        </div>
      </section>

      <section className="section cta">
        <div className="container cta-inner">
          <h2 className="cta-title">Ready to Start Your Project?</h2>
          <p className="cta-text">
            Get a quote for fabrication, equipment, or elevator renovation. Our team will respond within 24 hours.
          </p>
        </div>
      </section>
    </main>
  )
}
