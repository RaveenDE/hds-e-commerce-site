import { Router } from 'express'
import { Product } from '../db/models.js'
import { normalizeProductForCreate } from '../seed/defaultData.js'
import { requireAdmin } from '../middleware/auth.js'

export const productsRouter = Router()

// Public: list products (for shop)
productsRouter.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().lean()
    res.json(products)
  } catch (e) {
    next(e)
  }
})

// Public: get single product
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (e) {
    next(e)
  }
})

// Admin: create product
productsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const id = String(Date.now())
    const doc = normalizeProductForCreate(req.body, id)
    await Product.create(doc)
    const product = await Product.findById(id).lean()
    res.status(201).json({ id, product })
  } catch (e) {
    next(e)
  }
})

// Admin: update product
productsRouter.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Product not found' })
    Object.assign(existing, req.body)
    await existing.save()
    res.json(existing.toObject())
  } catch (e) {
    next(e)
  }
})

// Admin: delete product
productsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Product not found' })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

// Admin: bulk update inventory
productsRouter.patch('/inventory', requireAdmin, async (req, res, next) => {
  try {
    const updates = req.body
    if (!Array.isArray(updates)) {
      return res
        .status(400)
        .json({ error: 'Expected array of { sku or id, stock }' })
    }

    const ops = updates
      .map((u) => {
        const filter = u.id
          ? { _id: String(u.id) }
          : u.sku
            ? { sku: String(u.sku) }
            : null
        if (!filter) return null

        const $set = {}
        if (u.stock != null) $set.stock = u.stock
        if (u.sku != null) $set.sku = u.sku
        if (Object.keys($set).length === 0) return null

        return { updateOne: { filter, update: { $set } } }
      })
      .filter(Boolean)

    if (ops.length) await Product.bulkWrite(ops, { ordered: false })

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})
