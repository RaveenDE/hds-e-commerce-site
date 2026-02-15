import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Inquiry.css'

const serviceOptions = [
  'Stainless Steel Fabrication',
  'Hotel & Bakery Equipment',
  'Steel Fabrication',
  'Elevator Renovation',
  'Elevator Interior Solution',
  'Kitchenware / Products',
  'Other',
]

export default function Inquiry() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production: send to API or mailto
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="page inquiry-page">
        <section className="inquiry-hero">
          <div className="container">
            <h1 className="inquiry-hero-title">Inquiry Sent</h1>
            <p className="inquiry-hero-subtitle">
              Thank you for contacting us. We will get back to you within 24 hours.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page inquiry-page">
      <section className="inquiry-hero">
        <div className="container">
          <h1 className="inquiry-hero-title">Send an Inquiry</h1>
          <p className="inquiry-hero-subtitle">
            Get a quote or ask about our services. Fill out the form below and we’ll respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="inquiry-form-section section">
        <div className="container container-narrow">
          <form className="inquiry-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="inquiry-name">Name *</label>
              <input
                id="inquiry-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>
            <div className="form-row">
              <label htmlFor="inquiry-email">Email *</label>
              <input
                id="inquiry-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>
            <div className="form-row">
              <label htmlFor="inquiry-phone">Phone</label>
              <input
                id="inquiry-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+94 XX XXX XXXX"
              />
            </div>
            <div className="form-row">
              <label htmlFor="inquiry-company">Company</label>
              <input
                id="inquiry-company"
                name="company"
                type="text"
                value={form.company}
                onChange={handleChange}
                placeholder="Company name (optional)"
              />
            </div>
            <div className="form-row">
              <label htmlFor="inquiry-service">Service of interest</label>
              <select
                id="inquiry-service"
                name="service"
                value={form.service}
                onChange={handleChange}
              >
                <option value="">Select a service</option>
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="inquiry-message">Message *</label>
              <textarea
                id="inquiry-message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your project or question..."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg">
                Send Inquiry
              </button>
              <Link to="/" className="btn btn-secondary btn-lg">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
