import { Link } from 'react-router-dom'
import './StainlessSteelFabrication.css'

const gallery = [
  {
    id: 'work-table',
    image: '/fabrication/work-table.png',
    title: 'Stainless Steel Work Tables',
    description: 'Two-tier utility tables with flat top surface and lower storage shelf. Brushed stainless steel, square-profile legs with adjustable feet. Ideal for prep, assembly, and commercial kitchens.',
  },
  {
    id: 'double-sink-unit',
    image: '/fabrication/double-sink-unit.png',
    title: 'Double-Basin Sink Units',
    description: 'Commercial-grade freestanding sink unit with two deep rectangular basins and dual gooseneck faucets. Integrated backsplash and sturdy open-frame stand with square tubing.',
  },
  {
    id: 'sink-refrigeration-unit',
    image: '/fabrication/sink-refrigeration-unit.png',
    title: 'Sink & Refrigeration Units',
    description: 'Combination sink with integrated under-counter refrigeration or chilling unit. Single-basin sink, drainboard, digital temperature display, and mobile base with casters.',
  },
  {
    id: 'cabinet-storage',
    image: '/fabrication/cabinet-storage.png',
    title: 'Mobile Storage Cabinets',
    description: 'Freestanding stainless steel cabinets on casters for commercial kitchens and workshops. Two-door design with durable brushed finish.',
  },
  {
    id: 'cabinet-shelving',
    image: '/fabrication/cabinet-shelving.png',
    title: 'Shelving & Holding Units',
    description: 'Tall storage units with adjustable shelves and tray rails. Ideal for holding pans, sheet trays, and ingredients in professional kitchens.',
  },
  {
    id: 'sink-unit',
    image: '/fabrication/sink-unit.png',
    title: 'Commercial Sink Units',
    description: 'Dual-basin stainless steel sink units with backsplash and multiple faucets. Built on sturdy frames with lower storage shelf.',
  },
  {
    id: 'cooktop-station',
    image: '/fabrication/cooktop-station.png',
    title: 'Gas Cooktop Stations',
    description: 'Custom stainless steel workstations with integrated gas burners and backsplash. For commercial kitchens and heavy-duty cooking.',
  },
  {
    id: 'prep-unit',
    image: '/fabrication/prep-unit.png',
    title: 'Prep & Warming Units',
    description: 'Compact stainless steel units with recessed top surface for prep, holding, or insert fit. Single-door storage, sturdy legs with non-slip feet.',
  },
  {
    id: 'exhaust-hood',
    image: '/fabrication/exhaust-hood.png',
    title: 'Commercial Exhaust Hoods',
    description: 'Polished stainless steel exhaust hoods with grease baffle filters. Designed for ceiling mounting in professional kitchens.',
  },
  {
    id: 'wall-sink',
    image: '/fabrication/wall-sink.png',
    title: 'Wall-Mounted Sink Units',
    description: 'Single-basin stainless steel sink with integrated backsplash and chrome faucet. For utility, hand-wash, or compact commercial use.',
  },
]

export default function StainlessSteelFabrication() {
  return (
    <main className="page fabrication-page">
      <section className="fabrication-hero">
        <div className="container">
          <h1 className="fabrication-hero-title">Stainless Steel Fabrication</h1>
          <p className="fabrication-hero-subtitle">
            Custom fabrication for commercial kitchens, food processing, and industrial applications. Precision-cut, welded, and finished to your specs.
          </p>
        </div>
      </section>

      <section className="fabrication-intro section">
        <div className="container">
          <p className="fabrication-intro-text">
            From mobile cabinets and sink units to cooktop stations and shelving, we design and fabricate stainless steel equipment that meets the highest standards for hygiene, durability, and performance.
          </p>
        </div>
      </section>

      <section className="fabrication-gallery section">
        <div className="container">
          <div className="fabrication-grid">
            {gallery.map((item) => (
              <article key={item.id} className="fabrication-card">
                <div className="fabrication-card-image-wrap">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="fabrication-card-image"
                  />
                </div>
                <div className="fabrication-card-body">
                  <h2 className="fabrication-card-title">{item.title}</h2>
                  <p className="fabrication-card-desc">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fabrication-cta section">
        <div className="container">
          <p className="fabrication-cta-text">
            Need a custom quote or design? We work with hotels, bakeries, restaurants, and industrial facilities.
          </p>
          <div className="fabrication-cta-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop Kitchenware
            </Link>
            <a href="mailto:info@hds.com" className="btn btn-secondary btn-lg">
              Get a Quote
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
