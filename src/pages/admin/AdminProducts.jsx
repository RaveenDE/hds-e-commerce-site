import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../context/AdminStoreContext'
import { formatLKR } from '../../utils/formatCurrency'
import AdminProductForm from '../../components/admin/AdminProductForm'
import './AdminProducts.css'

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminStore()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  const categories = [...new Set(products.map((p) => p.category))].sort()
  const allTags = [...new Set(products.flatMap((p) => p.tags || []))].sort()

  const handleSave = (data) => {
    if (editingId) {
      updateProduct(editingId, data)
      setEditingId(null)
    } else {
      const id = addProduct(data)
      navigate(`/admin/products?edit=${id}`, { replace: true })
    }
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this product?')) deleteProduct(id)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="admin-products">
      <header className="admin-page-header admin-page-header-flex">
        <h1 className="admin-page-title">Product Management</h1>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setEditingId(null)
            setShowForm(true)
          }}
        >
          + Add product
        </button>
      </header>

      {showForm && (
        <div className="admin-card">
          <div className="admin-card-header">
            {editingId ? 'Edit product' : 'New product'}
          </div>
          <div className="admin-card-body">
            <AdminProductForm
              product={editingId ? products.find((p) => p.id === editingId) : null}
              categories={categories}
              allTags={allTags}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              onDelete={editingId ? () => handleDelete(editingId) : null}
            />
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">All products ({products.length})</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.images?.[0] || p.image}
                      alt=""
                      className="admin-product-thumb"
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{formatLKR(p.price)}</td>
                  <td>{p.discount ? `${p.discount}%` : '—'}</td>
                  <td>{p.stock}</td>
                  <td>{p.featured ? <span className="admin-badge admin-badge-featured">Yes</span> : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => {
                        setEditingId(p.id)
                        setShowForm(true)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
