import { Router } from 'express'
import { Customer } from '../db/models.js'
import { requireAdmin } from '../middleware/auth.js'

export const customersRouter = Router()

// Admin: list customers
customersRouter.get('/', requireAdmin, async (req, res, next) => {
  try {
    const customers = await Customer.find().lean()
    res.json(customers)
  } catch (e) {
    next(e)
  }
})

// Admin: block customer
customersRouter.post('/:id/block', requireAdmin, async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: { blocked: true } },
      { new: true }
    ).lean()
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    res.json(customer)
  } catch (e) {
    next(e)
  }
})

// Admin: unblock customer
customersRouter.post('/:id/unblock', requireAdmin, async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: { blocked: false } },
      { new: true }
    ).lean()
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    res.json(customer)
  } catch (e) {
    next(e)
  }
})
