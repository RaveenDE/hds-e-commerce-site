import { useState, useRef } from 'react'

const emptySpec = { label: '', value: '' }

export default function AdminProductForm({ product, categories, allTags, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [categoryNew, setCategoryNew] = useState('')
  const [price, setPrice] = useState(product?.price ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [longDescription, setLongDescription] = useState(product?.longDescription ?? '')
  const [specifications, setSpecifications] = useState(
    product?.specifications?.length ? [...product.specifications] : [emptySpec]
  )
  const [images, setImages] = useState(product?.images?.length ? [...product.images] : [''])
  const [tags, setTags] = useState(product?.tags?.length ? product.tags.join(', ') : '')
  const [discount, setDiscount] = useState(product?.discount ?? 0)
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [sku, setSku] = useState(product?.sku ?? '')
  const [stock, setStock] = useState(product?.stock ?? 50)
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold ?? 10)
  const fileInputRef = useRef(null)

  const effectiveCategory = category || categoryNew
  const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  const addImage = () => setImages((prev) => [...prev, ''])
  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i))
  const setImageUrl = (i, url) => setImages((prev) => {
    const next = [...prev]
    next[i] = url
    return next
  })

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (!files?.length) return
    const newUrls = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const url = URL.createObjectURL(file)
      newUrls.push(url)
    }
    setImages((prev) => [...prev.filter(Boolean), ...newUrls])
    e.target.value = ''
  }

  const addSpec = () => setSpecifications((prev) => [...prev, { ...emptySpec }])
  const removeSpec = (i) => setSpecifications((prev) => prev.filter((_, idx) => idx !== i))
  const updateSpec = (i, field, value) => setSpecifications((prev) => {
    const next = [...prev]
    next[i] = { ...next[i], [field]: value }
    return next
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      category: effectiveCategory.trim(),
      price: Number(price) || 0,
      description: description.trim(),
      longDescription: longDescription.trim(),
      specifications: specifications.filter((s) => s.label.trim() && s.value.trim()),
      images: images.filter(Boolean),
      image: images[0] || '',
      tags: tagList,
      discount: Number(discount) || 0,
      featured: !!featured,
      sku: sku.trim() || undefined,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) ?? 10,
    }
    onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      <div className="admin-form-row">
        <div className="admin-form-group" style={{ flex: 2 }}>
          <label>Product name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="admin-form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">— Select or add new —</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="admin-form-group">
          <label>Or new category</label>
          <input value={categoryNew} onChange={(e) => setCategoryNew(e.target.value)} placeholder="New category" />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Price (LKR)</label>
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="admin-form-group">
          <label>Discount %</label>
          <input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div className="admin-form-group">
          <label>SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. SKU-001" />
        </div>
        <div className="admin-form-group">
          <label>Stock</label>
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div className="admin-form-group">
          <label>Low stock alert below</label>
          <input type="number" min="0" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
        </div>
        <div className="admin-form-group admin-form-group-checkbox">
          <label>
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured product
          </label>
        </div>
      </div>

      <div className="admin-form-group">
        <label>Short description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="admin-form-group">
        <label>Long description</label>
        <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
      </div>

      <div className="admin-form-group">
        <label>Tags (comma-separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kitchen, stainless, professional" />
        {allTags.length > 0 && (
          <p className="admin-form-hint">Existing: {allTags.slice(0, 10).join(', ')}{allTags.length > 10 ? '…' : ''}</p>
        )}
      </div>

      <div className="admin-form-group">
        <label>Images (URLs or upload)</label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="admin-form-file"
          aria-hidden
        />
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => fileInputRef.current?.click()}>
          Upload images
        </button>
        {images.map((url, i) => (
          <div key={i} className="admin-form-image-row">
            <input
              value={typeof url === 'string' && !url.startsWith('blob:') ? url : ''}
              onChange={(e) => setImageUrl(i, e.target.value)}
              placeholder="Image URL or leave blank for uploaded"
            />
            {url && (url.startsWith('blob:') ? (
              <img src={url} alt="" className="admin-form-preview" />
            ) : url ? (
              <img src={url} alt="" className="admin-form-preview" onError={(e) => e.target.style.display = 'none'} />
            ) : null)}
            <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => removeImage(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addImage}>+ Add image URL</button>
      </div>

      <div className="admin-form-group">
        <label>Specifications</label>
        {specifications.map((spec, i) => (
          <div key={i} className="admin-form-spec-row">
            <input
              placeholder="Label"
              value={spec.label}
              onChange={(e) => updateSpec(i, 'label', e.target.value)}
            />
            <input
              placeholder="Value"
              value={spec.value}
              onChange={(e) => updateSpec(i, 'value', e.target.value)}
            />
            <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => removeSpec(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addSpec}>+ Add spec</button>
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn-primary">Save product</button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel}>Cancel</button>
        {onDelete && (
          <button type="button" className="admin-btn admin-btn-danger" onClick={onDelete}>Delete product</button>
        )}
      </div>
    </form>
  )
}
