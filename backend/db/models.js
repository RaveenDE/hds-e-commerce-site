import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const SpecificationSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
)

const ProductSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    longDescription: { type: String, default: '' },
    specifications: { type: [SpecificationSchema], default: [] },

    sku: { type: String, index: true },
    stock: { type: Number, default: 50 },
    lowStockThreshold: { type: Number, default: 10 },
    featured: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
)

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
)

const AddressSchema = new Schema(
  {
    fullName: String,
    line1: String,
    line2: String,
    city: String,
    postal: String,
    country: String,
    phone: String,
  },
  { _id: false }
)

const OrderSchema = new Schema(
  {
    _id: { type: String, required: true },
    customerId: { type: String, default: null },
    customerName: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    items: { type: [OrderItemSchema], default: [] },
    total: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    status: { type: String, default: 'Pending' },
    date: { type: String, default: '' }, // YYYY-MM-DD
    shippingAddress: { type: AddressSchema, default: null },
  },
  { timestamps: true }
)

const CustomerSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    blocked: { type: Boolean, default: false },
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const InquirySchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    service: { type: String, default: '' },
    message: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
)

const PromoSchema = new Schema(
  {
    _id: { type: String, required: true },
    PROMO_CODES: { type: Schema.Types.Mixed, default: {} },
    FREE_SHIPPING_THRESHOLD: { type: Number, default: 0 },
    DEFAULT_SHIPPING_COST: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Product = models.Product || model('Product', ProductSchema)
export const Order = models.Order || model('Order', OrderSchema)
export const Customer = models.Customer || model('Customer', CustomerSchema)
export const Inquiry = models.Inquiry || model('Inquiry', InquirySchema)
export const Promo = models.Promo || model('Promo', PromoSchema)

