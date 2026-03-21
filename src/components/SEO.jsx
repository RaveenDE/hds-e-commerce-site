import { Helmet } from 'react-helmet-async'
import { SITE_NAME } from '../config/site'

/**
 * Per-route SEO: title, description, canonical, Open Graph, Twitter, optional JSON-LD.
 * Set VITE_SITE_URL in .env (e.g. https://www.yourdomain.com) for correct canonicals in production.
 */
export default function SEO({
  title,
  /** When set, used as the exact &lt;title&gt; (e.g. home page). */
  fullTitle,
  description,
  path = '/',
  noindex = false,
  jsonLd = null,
}) {
  const base = (() => {
    const env = import.meta.env.VITE_SITE_URL
    if (env && String(env).trim()) return String(env).replace(/\/$/, '')
    if (typeof window !== 'undefined') return window.location.origin
    return ''
  })()
  const pathNorm = path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`
  const canonical = base ? `${base}${pathNorm}` : ''
  const pageTitle = fullTitle ?? `${title} | ${SITE_NAME}`
  const ogImage = base ? `${base}/logo.png` : ''

  return (
    <Helmet>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large" />
          {canonical ? <link rel="canonical" href={canonical} /> : null}
        </>
      )}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  )
}
