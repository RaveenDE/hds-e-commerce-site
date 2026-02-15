import { Link } from 'react-router-dom'
import './ElevatorInteriorSolution.css'

const gallery = [
  {
    id: 'control-panel',
    image: '/elevator/interior-control-panel.png',
    title: 'Stainless Steel Control Panels',
    description: 'Brushed stainless steel control panel columns with digital display, floor selection, and directional indicators. Paired with textured wall panels and horizontal stainless accents.',
  },
  {
    id: 'checkered',
    image: '/elevator/interior-checkered.png',
    title: 'Modern Brushed Metal Interiors',
    description: 'Clean design with black and white checkered flooring, brushed metal walls, and integrated LED strip lighting from floor to ceiling for a contemporary look.',
  },
  {
    id: 'marble-wood',
    image: '/elevator/interior-marble-wood.png',
    title: 'Marble & Wood Door Finishes',
    description: 'Dark gray marble walls with white veining, two-tone doors with wood lower panels, stainless handrails, and warm LED lighting along the door frame.',
  },
  {
    id: 'blue-led',
    image: '/elevator/interior-blue-led.png',
    title: 'LED-Accent Interiors',
    description: 'Sleek cabins with cool blue LED strips in the corners, reflective ceiling, brushed metal handrails and control panel. Minimalist and modern.',
  },
  {
    id: 'luxury-gold',
    image: '/elevator/interior-luxury-gold.png',
    title: 'Luxury Gold & Marble',
    description: 'Light marble walls with integrated warm LED lighting, polished gold ceiling and handrails, and speckled floor with gold trim for upscale buildings.',
  },
]

export default function ElevatorInteriorSolution() {
  return (
    <main className="page elevator-page">
      <section className="elevator-hero">
        <div className="container">
          <h1 className="elevator-hero-title">Elevator Interior Solution</h1>
          <p className="elevator-hero-subtitle">
            Bespoke elevator interiors in stainless steel, glass, marble, wood, and premium finishes. Design, manufacture, and install for commercial and residential buildings.
          </p>
        </div>
      </section>

      <section className="elevator-intro section">
        <div className="container">
          <p className="elevator-intro-text">
            From classic checkered floors and brushed metal to luxury marble and gold accents, we deliver elevator cabin interiors that match your building’s aesthetic and meet strict safety and durability standards.
          </p>
        </div>
      </section>

      <section className="elevator-gallery section">
        <div className="container">
          <div className="elevator-grid">
            {gallery.map((item) => (
              <article key={item.id} className="elevator-card">
                <div className="elevator-card-image-wrap">
                  <img
                    src={item.image}
                    alt=""
                    className="elevator-card-image"
                  />
                </div>
                <div className="elevator-card-body">
                  <h2 className="elevator-card-title">{item.title}</h2>
                  <p className="elevator-card-desc">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="elevator-cta section">
        <div className="container">
          <p className="elevator-cta-text">
            Planning an elevator renovation or new cab interior? We provide design, materials, and installation.
          </p>
          <a href="mailto:info@hds.com" className="btn btn-primary btn-lg">
            Get a Quote
          </a>
        </div>
      </section>
    </main>
  )
}
