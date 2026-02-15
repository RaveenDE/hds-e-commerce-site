/**
 * Format price in Sri Lankan Rupees (LKR).
 * @param {number} amount - Price amount
 * @returns {string} Formatted string e.g. "Rs. 15,700"
 */
export function formatLKR(amount) {
  if (amount == null || isNaN(amount)) return 'Rs. 0'
  return 'Rs. ' + Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
