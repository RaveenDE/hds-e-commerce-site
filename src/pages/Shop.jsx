import { useState } from 'react'
import { useAdminStore } from '../context/AdminStoreContext'
import ProductCard from '../components/ProductCard'
import './Shop.css'

export default function Shop() {
  const { products, loading } = useAdminStore()
  const [filter, setFilter] = useState('All')
  const categories = ['All', ...new Set(products.map((p) => p.category))]
  const filtered =
    filter === 'All' ? products : products.filter((p) => p.category === filter)

  if (loading && products.length === 0) {
    return (
      <main className="shop">
        <section className="shop-hero">
          <div className="container">
            <h1 className="shop-hero-title">Stainless Steel Kitchenware</h1>
            <p className="shop-hero-subtitle">Loading products…</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="shop">
      <section className="shop-hero">
        <div className="container">
          <h1 className="shop-hero-title">Stainless Steel Kitchenware</h1>
          <p className="shop-hero-subtitle">
            Professional-grade stainless steel products for kitchens, hotels, and bakeries. Built to last.
          </p>
        </div>
      </section>

      <section className="shop-content">
        <div className="container">
          <div className="shop-toolbar">
            <p className="shop-count">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="shop-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="shop-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
