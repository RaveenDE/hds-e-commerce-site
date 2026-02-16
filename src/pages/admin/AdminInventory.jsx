import { useState, useRef } from 'react'
import { useAdminStore } from '../../context/AdminStoreContext'
import './AdminInventory.css'

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (!lines.length) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    const row = {}
    headers.forEach((h, j) => { row[h] = values[j] ?? '' })
    rows.push(row)
  }
  return rows
}

export default function AdminInventory() {
  const { products, updateProduct, bulkUpdateInventory } = useAdminStore()
  const [showImport, setShowImport] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  const lowStockThreshold = (p) => p.lowStockThreshold ?? 10
  const lowStock = products.filter((p) => p.stock <= lowStockThreshold(p))

  const handleCSV = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result
      const rows = parseCSV(text)
      const updates = []
      const bySku = new Map(products.map((p) => [p.sku?.toLowerCase(), p]))
      const byId = new Map(products.map((p) => [p.id, p]))
      for (const row of rows) {
        const sku = (row.sku || row.id || '').toString().trim()
        const stock = parseInt(row.stock, 10)
        if (isNaN(stock)) continue
        const product = bySku.get(sku?.toLowerCase()) || byId.get(sku)
        if (product) updates.push({ sku: product.sku, id: product.id, stock })
      }
      if (updates.length) {
        bulkUpdateInventory(updates)
        setImportResult({ success: true, count: updates.length })
      } else {
        setImportResult({ success: false, message: 'No matching SKU/id found in CSV.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const exportCSV = () => {
    const headers = ['sku', 'id', 'name', 'stock', 'low_stock_threshold']
    const rows = products.map((p) => [p.sku, p.id, p.name, p.stock, p.lowStockThreshold ?? 10])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-inventory">
      <header className="admin-page-header admin-page-header-flex">
        <h1 className="admin-page-title">Inventory Management</h1>
        <div className="admin-inventory-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={exportCSV}>
            Export CSV
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setShowImport(true)
              setImportResult(null)
              setTimeout(() => fileInputRef.current?.click(), 0)
            }}
          >
            Bulk import (CSV)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSV}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          />
        </div>
      </header>

      {importResult && (
        <div className={`admin-alert ${importResult.success ? 'admin-alert-success' : 'admin-alert-error'}`}>
          {importResult.success ? `Updated ${importResult.count} product(s).` : importResult.message}
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="admin-card admin-card-warning">
          <div className="admin-card-header">Low stock alerts ({lowStock.length})</div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td><span className="admin-badge admin-badge-low">{p.stock}</span></td>
                    <td>{lowStockThreshold(p)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => {
                          const v = prompt('New stock level:', p.stock)
                          if (v !== null && !isNaN(Number(v))) updateProduct(p.id, { stock: Number(v) })
                        }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">SKU-level inventory</div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Low stock threshold</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.stock <= lowStockThreshold(p) ? 'admin-row-low' : ''}>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.stock}</td>
                  <td>{lowStockThreshold(p)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => {
                        const v = prompt('New stock level:', p.stock)
                        if (v !== null && !isNaN(Number(v))) updateProduct(p.id, { stock: Number(v) })
                      }}
                    >
                      Edit stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">CSV import format</div>
        <p className="admin-card-note">
          Upload a CSV with columns <code>sku</code> (or <code>id</code>) and <code>stock</code>. Example:
        </p>
        <pre className="admin-code">sku,stock
SKU-001,25
SKU-002,100</pre>
      </div>
    </div>
  )
}
