/** Public site name (used in titles and schema). */
export const SITE_NAME = 'HDS Engineering & Contractors'

/** Base URL for canonical/OG when VITE_SITE_URL is set at build; otherwise uses window.origin in the browser. */
export function getCanonicalBase() {
  const env = import.meta.env.VITE_SITE_URL
  if (env && String(env).trim()) {
    return String(env).replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}
