const ADDRESSES_KEY = 'hds-saved-addresses'

export function getSavedAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveAddresses(addresses) {
  try {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses))
  } catch (e) {
    console.warn('addressStorage: could not save', e)
  }
}

export function addSavedAddress(address) {
  const list = getSavedAddresses()
  const id = `addr-${Date.now()}`
  const newAddr = { ...address, id }
  saveAddresses([...list, newAddr])
  return id
}

export function updateSavedAddress(id, updates) {
  const list = getSavedAddresses()
  const next = list.map((a) => (a.id === id ? { ...a, ...updates } : a))
  saveAddresses(next)
}

export function deleteSavedAddress(id) {
  saveAddresses(getSavedAddresses().filter((a) => a.id !== id))
}
