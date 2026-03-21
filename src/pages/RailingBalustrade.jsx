import SEO from '../components/SEO'
import './RailingBalustrade.css'

const gallery = [
  {
    id: 'railing-1',
    image: '/railing/railing-1.png',
    title: 'Stainless Steel Stair Railing',
    description: 'Modern staircase railing with brushed stainless steel handrail and geometric balusters. Clean lines and durable construction for interior or exterior use.',
  },
  {
    id: 'railing-2',
    image: '/railing/railing-2.png',
    title: 'Wood & Black Metal Balustrade',
    description: 'Open-tread staircase with warm wood treads and handrails paired with slender black metal balusters. Contemporary look that suits residential and commercial spaces.',
  },
  {
    id: 'railing-3',
    image: '/railing/railing-3.png',
    title: 'Horizontal Rod Railing',
    description: 'Stainless steel railing with horizontal rod infill between square posts. Combines wood treads with a sleek metal guard for a modern, industrial aesthetic.',
  },
  {
    id: 'railing-4',
    image: '/railing/railing-4.png',
    title: 'Deck & Stair Railing System',
    description: 'Integrated railing for raised platforms and stairs. Dark metal balusters and handrails with wood newel posts—ideal for decks, terraces, and outdoor access.',
  },
]

export default function RailingBalustrade() {
  return (
    <main className="page railing-page">
      <SEO
        title="Railing & Balustrade"
        description="Custom metal and wood railings for stairs, decks, and platforms. Stainless steel, powder-coated steel, and integrated wood-and-metal systems built to code."
        path="/railing-balustrade"
      />
      <section className="railing-hero">
        <div className="container">
          <h1 className="railing-hero-title">Railing & Balustrade</h1>
          <p className="railing-hero-subtitle">
            Custom metal and wood railings for stairs, decks, and platforms. Stainless steel, powder-coated steel, and integrated wood-and-metal systems.
          </p>
        </div>
      </section>

      <section className="railing-intro section">
        <div className="container">
          <p className="railing-intro-text">
            From interior stair railings to deck and platform guards, we design and fabricate railings that meet code, last for decades, and match your aesthetic—whether modern metal, warm wood, or a combination of both.
          </p>
        </div>
      </section>

      <section className="railing-gallery section">
        <div className="container">
          <div className="railing-grid">
            {gallery.map((item) => (
              <article key={item.id} className="railing-card">
                <div className="railing-card-image-wrap">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="railing-card-image"
                  />
                </div>
                <div className="railing-card-body">
                  <h2 className="railing-card-title">{item.title}</h2>
                  <p className="railing-card-desc">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="railing-cta section">
        <div className="container">
          <p className="railing-cta-text">
            Need a custom railing design or quote? We work with builders, architects, and property owners for residential and commercial projects.
          </p>
        </div>
      </section>
    </main>
  )
}
