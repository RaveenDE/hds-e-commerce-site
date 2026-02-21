import { Router } from 'express'
import { startGoogleLogin, finishGoogleLogin } from '../auth/googleOidc.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.get('/google/start', startGoogleLogin)
authRouter.get('/google/callback', finishGoogleLogin)

authRouter.get('/me', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ authenticated: false })
  res.json({ authenticated: true, user: req.session.user })
})

authRouter.post('/logout', requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)
    res.clearCookie('hds.sid', { path: '/' })
    res.json({ ok: true })
  })
})

