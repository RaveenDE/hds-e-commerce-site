import { useParams, Link, useNavigate } from 'react-router-dom'
import { products } from '../data/products'
import { formatLKR } from '../utils/formatCurrency'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import './Product.css'

function getRelatedProducts(currentProduct, limit = 4) {
  const sameCategory = products.filter(
    (p) => p.id !== currentProduct.id && p.category === currentProduct.category
  )
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)
  const others = products.filter(
    (p) => p.id !== currentProduct.id && !sameCategory.find((s) => s.id === p.id)
  )
  return [...sameCategory, ...others].slice(0, limit)
}

export default function Product() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const product = products.find((p) => p.id === productId)
  const relatedProducts = product ? getRelatedProducts(product) : []

  const handleAddToCart = () => {
    if (product) addItem(product.id, 1)
  }

  const handleBuyNow = () => {
    if (product) {
      addItem(product.id, 1)
      navigate('/checkout')
    }
  }

  if (!product) {
    return (
      <main className="page product-page">
        <div className="container product-not-found">
          <h1>Product not found</h1>
          <p>This product may have been removed or the link is incorrect.</p>
          <Link to="/shop" className="btn btn-primary">
            Back to Shop
          </Link>
        </div>
      </main>
    )
  }

  const {
    name,
    category,
    price,
    image,
    description,
    longDescription,
    specifications = [],
  } = product

  return (
    <main className="page product-page">
      <div className="container">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{name}</span>
        </nav>

        <article className="product-detail">
          <div className="product-detail-image-wrap">
            <img src={image} alt={name} className="product-detail-image" />
          </div>
          <div className="product-detail-info">
            <span className="product-detail-category">{category}</span>
            <h1 className="product-detail-name">{name}</h1>
            <p className="product-detail-price">{formatLKR(price)}</p>
            <p className="product-detail-desc product-detail-desc-short">{description}</p>

            <div className="product-delivery">
              <span className="product-delivery-label">Delivery</span>
              <p className="product-delivery-text">
                Colombo & suburbs: 2–3 business days · Island-wide: 4–7 business days. Free delivery on orders over Rs. 25,000.
              </p>
            </div>

            <div className="product-detail-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg btn-buy-now"
                onClick={handleBuyNow}
              >
                Buy it now
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={handleAddToCart}
              >
                Add to cart
              </button>
              <Link to="/shop" className="btn btn-outline btn-lg">
                Back to Shop
              </Link>
            </div>
          </div>
        </article>

        <div className="product-tabs">
          <section className="product-section product-description">
            <h2 className="product-section-title">Product description</h2>
            <p className="product-detail-desc">{longDescription || description}</p>
          </section>

          {specifications.length > 0 && (
            <section className="product-section product-specs">
              <h2 className="product-section-title">Product specification</h2>
              <table className="product-spec-table">
                <tbody>
                  {specifications.map(({ label, value }) => (
                    <tr key={label}>
                      <th>{label}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <section className="product-section product-related">
            <h2 className="product-section-title">You might also like</h2>
            <div className="product-related-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
