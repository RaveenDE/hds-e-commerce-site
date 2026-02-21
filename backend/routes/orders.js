import { Router } from 'express'
import { Order } from '../db/models.js'
import { requireAdmin } from '../middleware/auth.js'

export const ordersRouter = Router()

// Admin: list orders
ordersRouter.get('/', requireAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean()
    res.json(orders)
  } catch (e) {
    next(e)
  }
})

// Admin: get single order
ordersRouter.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (e) {
    next(e)
  }
})

// Public: place order (checkout)
ordersRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body
    if (!body.items?.length) {
      return res.status(400).json({ error: 'Order must have items' })
    }
    const orderId = String(body.id || `ord-${Date.now()}`)
    const order = {
      _id: orderId,
      customerId: body.customerId ?? null,
      customerName: body.customerName ?? '',
      customerEmail: body.customerEmail ?? '',
      items: body.items,
      total: body.total ?? 0,
      subtotal: body.subtotal ?? body.total ?? 0,
      shipping: body.shipping ?? 0,
      discount: body.discount ?? 0,
      status: 'Pending',
      date: body.date || new Date().toISOString().slice(0, 10),
      shippingAddress: body.shippingAddress ?? null,
    }
    await Order.create(order)
    res.status(201).json({ id: orderId, order })
  } catch (e) {
    next(e)
  }
})

// Admin: update order status
ordersRouter.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'status required' })
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    ).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (e) {
    next(e)
  }
})
