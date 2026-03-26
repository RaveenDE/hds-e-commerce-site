/**
 * Normalize VITE_INQUIRY_API_URL. dotenv-expand may turn .../$$default into .../$
 * when $default is expanded as an empty variable — API Gateway needs .../$default.
 * In .env you can also use %24default instead of $$default to avoid expansion.
 */
export function normalizeInquiryApiBaseUrl(raw) {
  let s = String(raw || '').trim().replace(/\/+$/, '')
  if (!s) return ''
  if (s.endsWith('/$')) {
    return `${s}default`
  }
  return s
}
