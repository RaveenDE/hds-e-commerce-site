import { Link } from 'react-router-dom'
import './Careers.css'

export default function Careers() {
  return (
    <main className="page careers-page">
      <section className="careers-hero">
        <div className="container">
          <h1 className="careers-hero-title">Careers</h1>
          <p className="careers-hero-subtitle">
            Join HDS Engineering & Contractors. We are always looking for skilled people in fabrication, engineering, and project delivery.
          </p>
        </div>
      </section>

      <section className="careers-vacancies section">
        <div className="container">
          <h2 className="careers-section-title">Current Vacancies</h2>
          <article className="careers-vacancy-card">
            <div className="careers-vacancy-poster">
              <img
                src="/careers/welder-vacancy.png"
                alt="Job vacancy: Welder at HDS Engineering & Contractors - Panadura, Full-Time"
                className="careers-vacancy-image"
              />
            </div>
            <div className="careers-vacancy-details">
              <h3 className="careers-vacancy-title">Welder</h3>
              <ul className="careers-vacancy-meta">
                <li><strong>Location:</strong> Panadura</li>
                <li><strong>Employment Type:</strong> Full-Time</li>
                <li><strong>Field:</strong> Engineering</li>
              </ul>
              <h4 className="careers-vacancy-heading">Key skills</h4>
              <ul className="careers-vacancy-list">
                <li>MIG, TIG &amp; Arc Welding</li>
                <li>Read Blueprints &amp; Drawings</li>
                <li>Metal Fabrication &amp; Inspection</li>
              </ul>
              <h4 className="careers-vacancy-heading">Requirements</h4>
              <ul className="careers-vacancy-list">
                <li>Qualification from a recognized Vocational Training Institute (NAITA, VTA, CGTI, CGR-TTI) related to NVQ level 3 Welder or similar.</li>
                <li>2–4 years industrial experience as a Welder.</li>
              </ul>
              <h4 className="careers-vacancy-heading">We offer</h4>
              <ul className="careers-vacancy-list">
                <li>Competitive pay</li>
                <li>Overtime available</li>
                <li>Career growth</li>
                <li>Supportive team</li>
              </ul>
              <div className="careers-vacancy-apply">
                <p className="careers-vacancy-apply-title">Apply now</p>
                <p>
                  <strong>Send your CV to:</strong>{' '}
                  <a href="mailto:hamiltonsons@gmail.com">hamiltonsons@gmail.com</a>
                </p>
                <p>
                  <strong>Call:</strong>{' '}
                  <a href="tel:+94702640929">+94 70 264 0929</a>
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="careers-content section">
        <div className="container container-narrow">
          <p className="careers-intro">
            If you are interested in working with us, send your CV and a short note to our email. We will get back to you when a suitable role is available.
          </p>
          <p className="careers-contact">
            <strong>Email:</strong>{' '}
            <a href="mailto:hamiltonsons@gmail.com">hamiltonsons@gmail.com</a>
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  )
}
