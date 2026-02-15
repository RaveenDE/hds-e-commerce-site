import { Link } from 'react-router-dom'
import './ProductCard.css'
import { formatLKR } from '../utils/formatCurrency'

export default function ProductCard({ product }) {
  const { id, name, category, price, image, description } = product
  const productUrl = `/shop/product/${id}`

  return (
    <article className="product-card">
      <Link to={productUrl} className="product-card-image-wrap">
        <img
          src={image}
          alt=""
          className="product-card-image"
          loading="lazy"
        />
        <span className="product-card-category">{category}</span>
        <span className="product-card-quick-add">View details</span>
      </Link>
      <div className="product-card-body">
        <Link to={productUrl} className="product-card-name-link">
          <h3 className="product-card-name">{name}</h3>
        </Link>
        <p className="product-card-desc">{description}</p>
        <div className="product-card-footer">
          <span className="product-card-price">{formatLKR(price)}</span>
          <Link to={productUrl} className="btn btn-primary btn-sm">
            View details
          </Link>
        </div>
      </div>
    </article>
  )
}
