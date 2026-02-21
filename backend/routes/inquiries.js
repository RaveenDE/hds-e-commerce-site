import { Router } from 'express'
import { Inquiry } from '../db/models.js'
import { requireAdmin } from '../middleware/auth.js'

export const inquiriesRouter = Router()

// Public: submit inquiry
inquiriesRouter.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, company, service, message } = req.body
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ error: 'Name, email, and message are required' })
    }
    const id = `inq-${Date.now()}`
    await Inquiry.create({
      _id: id,
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      service: service?.trim() || '',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id, message: 'Inquiry received' })
  } catch (e) {
    next(e)
  }
})

// Admin: list inquiries (optional, for future admin UI)
inquiriesRouter.get('/', requireAdmin, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean()
    res.json(inquiries)
  } catch (e) {
    next(e)
  }
})
