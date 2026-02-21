import './env.js'
import express from 'express'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { productsRouter } from './routes/products.js'
import { ordersRouter } from './routes/orders.js'
import { customersRouter } from './routes/customers.js'
import { promosRouter } from './routes/promos.js'
import { inquiriesRouter } from './routes/inquiries.js'
import { authRouter } from './routes/auth.js'
import { connectAndSeedMongo } from './db/init.js'

const app = express()
const PORT = process.env.PORT || 3001

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.set('trust proxy', 1)
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
app.use(express.json())

app.use(
  session({
    name: 'hds.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })
)

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/customers', customersRouter)
app.use('/api/promos', promosRouter)
app.use('/api/inquiries', inquiriesRouter)

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'HDS backend running' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  await connectAndSeedMongo()
  app.listen(PORT, () => {
    console.log(`HDS backend listening on http://localhost:${PORT}`)
  })
}

start().catch((e) => {
  console.error('Failed to start backend:', e)
  process.exit(1)
})
