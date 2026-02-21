import mongoose from 'mongoose'
import { Customer, Order, Product, Promo } from './models.js'
import {
  defaultCustomers,
  defaultOrders,
  defaultProducts,
  defaultPromos,
} from '../seed/defaultData.js'

export async function connectAndSeedMongo() {
  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hds_site'

  await mongoose.connect(uri)

  // Seed only if collections are empty. Keeps user data intact.
  const [productCount, customerCount, orderCount] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments(),
    Order.countDocuments(),
  ])

  if (productCount === 0) {
    await Product.insertMany(defaultProducts, { ordered: false })
  }
  if (customerCount === 0) {
    await Customer.insertMany(defaultCustomers, { ordered: false })
  }
  if (orderCount === 0) {
    await Order.insertMany(defaultOrders, { ordered: false })
  }

  const promo = await Promo.findById('default').lean()
  if (!promo) {
    await Promo.create(defaultPromos)
  }

  return mongoose.connection
}

