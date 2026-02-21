import * as client from 'openid-client'
import { Customer } from '../db/models.js'

let _configPromise = null

async function getGoogleConfig() {
  if (_configPromise) return _configPromise

  _configPromise = (async () => {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
      process.env

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error(
        'Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI'
      )
    }

    const server = new URL('https://accounts.google.com')
    return await client.discovery(server, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
  })()

  return _configPromise
}

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

function safeReturnTo(value) {
  if (!value || typeof value !== 'string') return '/admin'
  if (!value.startsWith('/')) return '/admin'
  if (value.startsWith('//')) return '/admin'
  return value
}

export async function startGoogleLogin(req, res, next) {
  try {
    const config = await getGoogleConfig()

    const state = client.randomState()
    const nonce = client.randomNonce()
    const code_verifier = client.randomPKCECodeVerifier()
    const code_challenge = await client.calculatePKCECodeChallenge(code_verifier)
    const returnTo = safeReturnTo(req.query.returnTo)

    req.session.oidc = { state, nonce, code_verifier, returnTo }

    const redirect_uri = process.env.GOOGLE_REDIRECT_URI
    const url = client.buildAuthorizationUrl(config, {
      redirect_uri,
      scope: 'openid email profile',
      state,
      nonce,
      code_challenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    })

    res.redirect(url.href)
  } catch (e) {
    next(e)
  }
}

export async function finishGoogleLogin(req, res, next) {
  try {
    const { state, nonce, code_verifier, returnTo } = req.session.oidc || {}
    if (!state || !nonce || !code_verifier) {
      return res.status(400).json({ error: 'Missing login session; try again.' })
    }

    const config = await getGoogleConfig()
    const currentUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: code_verifier,
      expectedState: state,
      expectedNonce: nonce,
      idTokenExpected: true,
    })

    const claims = tokens.claims() || {}
    const email = String(claims.email || '').toLowerCase()
    const emailVerified = Boolean(claims.email_verified)
    const name = String(claims.name || '').trim()

    if (!email || !emailVerified) {
      return res.status(403).json({ error: 'Email not verified for this account.' })
    }

    const admins = parseAdminEmails()
    const isAdmin = admins.size === 0 ? false : admins.has(email)

    // Customer record: used for client/account login and future order history
    let customerId = null
    try {
      const existing = await Customer.findOne({ email }).lean()
      if (existing?.blocked) {
        return res.status(403).json({ error: 'This customer account is blocked.' })
      }
      customerId = existing?._id || `cust-google-${claims.sub}`

      if (!existing) {
        await Customer.create({
          _id: customerId,
          name: name || email,
          email,
          blocked: false,
          orderCount: 0,
          totalSpent: 0,
        })
      } else {
        await Customer.updateOne(
          { _id: existing._id },
          { $set: { name: name || existing.name || email, email } }
        )
      }
    } catch (e) {
      // If customer persistence fails, still allow admin login to proceed.
      if (!isAdmin) throw e
    }

    req.session.user = {
      sub: claims.sub,
      email,
      name,
      picture: claims.picture || '',
      admin: isAdmin,
      customerId,
      provider: 'google',
    }
    delete req.session.oidc

    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
    res.redirect(`${frontendOrigin}${safeReturnTo(returnTo)}`)
  } catch (e) {
    next(e)
  }
}

