/**
 * Promo codes (client-side validation only).
 * type: 'percent' = percentage off subtotal, 'fixed' = fixed amount off
 */
export const PROMO_CODES = {
  SAVE10: { type: 'percent', value: 10, label: '10% off' },
  SAVE20: { type: 'percent', value: 20, label: '20% off' },
  FLAT500: { type: 'fixed', value: 500, label: 'Rs. 500 off' },
  FLAT1000: { type: 'fixed', value: 1000, label: 'Rs. 1,000 off' },
}

export const FREE_SHIPPING_THRESHOLD = 25000
export const DEFAULT_SHIPPING_COST = 500
