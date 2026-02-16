import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { PROMO_CODES, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from '../data/promos'

const CART_STORAGE_KEY = 'hds-cart'

const initialState = {
  items: [], // { productId, qty }
  promoCode: null, // applied code string
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return initialState
    const data = JSON.parse(raw)
    if (Array.isArray(data.items)) return { ...initialState, items: data.items, promoCode: data.promoCode || null }
    return initialState
  } catch {
    return initialState
  }
}

function saveCart(state) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: state.items, promoCode: state.promoCode }))
  } catch (e) {
    console.warn('Cart: could not save', e)
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload }
    case 'ADD_ITEM': {
      const { productId, qty = 1 } = action.payload
      const existing = state.items.find((i) => i.productId === productId)
      const items = existing
        ? state.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i))
        : [...state.items, { productId, qty }]
      return { ...state, items }
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.productId !== action.payload)
      return { ...state, items }
    }
    case 'UPDATE_QTY': {
      const { productId, qty } = action.payload
      if (qty < 1) return { ...state, items: state.items.filter((i) => i.productId !== productId) }
      const items = state.items.map((i) =>
        i.productId === productId ? { ...i, qty } : i
      )
      return { ...state, items }
    }
    case 'SET_PROMO':
      return { ...state, promoCode: action.payload }
    case 'CLEAR_PROMO':
      return { ...state, promoCode: null }
    case 'CLEAR_CART':
      return initialState
    default:
      return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    dispatch({ type: 'LOAD', payload: loadCart() })
  }, [])

  useEffect(() => {
    saveCart(state)
  }, [state.items, state.promoCode])

  const addItem = useCallback((productId, qty = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { productId, qty } })
  }, [])

  const removeItem = useCallback((productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }, [])

  const updateQty = useCallback((productId, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { productId, qty } })
  }, [])

  const setPromoCode = useCallback((code) => {
    dispatch({ type: 'SET_PROMO', payload: code })
  }, [])

  const clearPromoCode = useCallback(() => {
    dispatch({ type: 'CLEAR_PROMO' })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0)

  const value = {
    items: state.items,
    promoCode: state.promoCode,
    addItem,
    removeItem,
    updateQty,
    setPromoCode,
    clearPromoCode,
    clearCart,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

/** Subtotal (before shipping & promo), shipping amount, discount amount, total */
export function useCartTotals(getProductPrice) {
  const { items, promoCode } = useCart()
  const subtotal = items.reduce((sum, i) => sum + (getProductPrice(i.productId) || 0) * i.qty, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST
  const promo = PROMO_CODES[promoCode]
  let discount = 0
  if (promo) {
    if (promo.type === 'percent') discount = Math.round((subtotal * promo.value) / 100)
    else discount = Math.min(promo.value, subtotal)
  }
  const total = Math.max(0, subtotal + shipping - discount)
  return { subtotal, shipping, discount, total, promoCode, promo }
}
