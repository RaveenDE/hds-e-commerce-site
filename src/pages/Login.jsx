import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function safeReturnTo(value) {
  if (!value || typeof value !== 'string') return '/admin'
  if (!value.startsWith('/')) return '/admin'
  if (value.startsWith('//')) return '/admin'
  return value
}

export default function Login() {
  const { loading, user, loginWithGoogle, logout } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const returnTo = useMemo(() => safeReturnTo(params.get('returnTo')), [params])

  useEffect(() => {
    if (loading) return
    if (user?.admin) navigate(returnTo, { replace: true })
  }, [loading, user, returnTo, navigate])

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Admin login</h1>
        <p className="login-subtitle">
          Use your Google account to sign in.
        </p>

        {!user && (
          <button className="btn btn-primary login-btn" type="button" onClick={() => loginWithGoogle(returnTo)}>
            Continue with Google
          </button>
        )}

        {user && (
          <>
            <div className="login-user">
              Signed in as <strong>{user.email}</strong>
            </div>

            {user.admin ? (
              <button className="btn btn-primary login-btn" type="button" onClick={() => navigate(returnTo)}>
                Continue
              </button>
            ) : (
              <div className="login-warning">
                Your account is not an admin. Add it to <code>ADMIN_EMAILS</code> on the backend.
              </div>
            )}

            <button className="btn login-btn-secondary" type="button" onClick={logout}>
              Logout
            </button>
          </>
        )}

        <div className="login-footer">
          <Link to="/">Back to site</Link>
        </div>
      </div>
    </div>
  )
}

