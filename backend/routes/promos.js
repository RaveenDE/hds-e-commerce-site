import { Router } from 'express'
import { Promo } from '../db/models.js'
import { defaultPromos } from '../seed/defaultData.js'

export const promosRouter = Router()

// Public: get promo codes and shipping config (for checkout validation)
promosRouter.get('/', async (req, res, next) => {
  try {
    let promos = await Promo.findById('default').lean()
    if (!promos) {
      promos = (await Promo.create(defaultPromos)).toObject()
    }
    res.json(promos)
  } catch (e) {
    next(e)
  }
})
