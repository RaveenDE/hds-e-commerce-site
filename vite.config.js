import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'node:path'
import { normalizeInquiryApiBaseUrl } from './src/utils/inquiryUrl.js'

/** Marketing URLs to list in sitemap (no cart/checkout). */
const SITEMAP_PATHS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/stainless-steel-fabrication', changefreq: 'monthly', priority: '0.9' },
  { loc: '/elevator-interior-solution', changefreq: 'monthly', priority: '0.9' },
  { loc: '/railing-balustrade', changefreq: 'monthly', priority: '0.9' },
  { loc: '/inquiry', changefreq: 'monthly', priority: '0.85' },
  { loc: '/careers', changefreq: 'weekly', priority: '0.85' },
]

/** Dev-only: proxy POST /api/inquiries → API Gateway so the form works without CORS and without Mongo on 3001. */
function inquiryLambdaProxyFromEnv(env) {
  const base = normalizeInquiryApiBaseUrl(env.VITE_INQUIRY_API_URL)
  if (!base) return null
  try {
    const u = new URL(base)
    const origin = u.origin
    const prefix = (u.pathname || '').replace(/\/$/, '') || ''
    return {
      target: origin,
      changeOrigin: true,
      secure: true,
      rewrite: (path) => {
        if (path === '/api/inquiries' || path.startsWith('/api/inquiries?')) {
          const q = path.includes('?') ? path.slice(path.indexOf('?')) : ''
          return `${prefix}/api/inquiries${q}`
        }
        return path
      },
    }
  } catch (e) {
    console.warn('[vite] Invalid VITE_INQUIRY_API_URL:', e.message)
    return null
  }
}

function logInquiryProxyStartup(env) {
  const base = normalizeInquiryApiBaseUrl(env.VITE_INQUIRY_API_URL)
  if (!base) return
  try {
    const u = new URL(base)
    const stagePath = (u.pathname || '').replace(/\/$/, '') || ''
    console.log(
      `\n[vite] Inquiry dev proxy → ${u.origin}${stagePath}/api/inquiries\n` +
        `[vite] If you see ENOTFOUND / "Non-existent domain", the API id in the URL is wrong or the API was deleted.\n` +
        `[vite] Fix: AWS Console → API Gateway → your HTTP API → copy the Invoke URL → set VITE_INQUIRY_API_URL to that host + stage (use %24default for a $default stage).\n`
    )
  } catch {
    /* ignore */
  }
}

function seoStaticFilesPlugin(mode) {
  return {
    name: 'seo-static-files',
    closeBundle() {
      const env = loadEnv(mode, process.cwd(), '')
      const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '') || 'https://YOUR-DOMAIN.com'
      const dist = path.resolve(process.cwd(), 'dist')
      if (!fs.existsSync(dist)) return

      const lastmod = new Date().toISOString().split('T')[0]
      const urlEntries = SITEMAP_PATHS.map(
        ({ loc, changefreq, priority }) => `
  <url>
    <loc>${siteUrl}${loc === '/' ? '/' : loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
      ).join('')

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`
      fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap.trimStart(), 'utf8')

      const robots = `User-agent: *
Allow: /

# Transactional pages — avoid indexing duplicate/thin URLs
Disallow: /cart
Disallow: /checkout

Sitemap: ${siteUrl}/sitemap.xml
`
      fs.writeFileSync(path.join(dist, 'robots.txt'), robots, 'utf8')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const inquiryProxy = inquiryLambdaProxyFromEnv(env)
  if (mode === 'development') {
    logInquiryProxyStartup(env)
  }

  return {
    plugins: [react(), seoStaticFilesPlugin(mode)],
    server: {
      proxy: {
        // Must be before `/api` so /api/inquiries hits API Gateway, not Express.
        ...(inquiryProxy ? { '/api/inquiries': inquiryProxy } : {}),
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
