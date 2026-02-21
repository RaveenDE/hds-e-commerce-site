function extendProduct(p) {
  const id = String(p._id ?? p.id ?? '')
  return {
    ...p,
    _id: id,
    sku: p.sku || `SKU-${id.padStart(3, '0')}`,
    stock: p.stock ?? 50,
    lowStockThreshold: p.lowStockThreshold ?? 10,
    featured: p.featured ?? false,
    discount: p.discount ?? 0,
    tags: p.tags || [],
    images: p.images || (p.image ? [p.image] : []),
  }
}

export const defaultProducts = [
  {
    _id: '1',
    name: 'Stainless Steel Cutlery Set',
    category: 'Cutlery',
    price: 15700,
    image: '/products/cutlery-set.png',
    description:
      'Four-piece set: dinner spoon, fork, knife, and teaspoon. Polished stainless steel, durable and dishwasher safe.',
    longDescription:
      'Our stainless steel cutlery set includes everything you need for everyday dining: a dinner spoon, four-tine fork, dinner knife, and teaspoon. Each piece is made from high-quality 18/0 stainless steel with a polished finish that resists tarnishing. Ergonomic handles ensure a comfortable grip. Dishwasher safe and built to last.',
    specifications: [
      { label: 'Material', value: '18/0 Stainless Steel' },
      { label: 'Pieces', value: '4 (spoon, fork, knife, teaspoon)' },
      { label: 'Finish', value: 'Polished' },
      { label: 'Dishwasher safe', value: 'Yes' },
    ],
  },
  {
    _id: '2',
    name: 'Stainless Steel Food Container',
    category: 'Storage',
    price: 10200,
    image: '/products/food-container.png',
    description:
      'Oval lunchbox with fitted lid, wire bail handle, and clip latches. Polished stainless steel for durable, hygienic storage.',
    longDescription:
      'Keep food fresh and secure with this oval stainless steel container. Features a snug-fitting lid, wire bail handle for easy carrying, and two side clip latches to keep the lid firmly in place. Ideal for lunch, leftovers, or pantry storage. Polished interior and exterior for easy cleaning.',
    specifications: [
      { label: 'Material', value: 'Stainless Steel' },
      { label: 'Closure', value: 'Clip latches' },
      { label: 'Handle', value: 'Wire bail' },
      { label: 'Finish', value: 'Polished' },
    ],
  },
  {
    _id: '3',
    name: 'Stainless Steel Pot with Glass Lid',
    category: 'Pots & Pans',
    price: 25300,
    image: '/products/stockpot.png',
    description:
      'Round stainless steel pot with clear glass lid and steam vent. Black heat-resistant handles. Ideal for everyday cooking.',
    longDescription:
      'A versatile cooking pot with a clear glass lid so you can monitor cooking without lifting the lid. The lid includes a steam vent. Black heat-resistant handles stay cool on the stovetop. Perfect for boiling, simmering, and one-pot meals.',
    specifications: [
      { label: 'Material', value: 'Stainless Steel' },
      { label: 'Lid', value: 'Tempered glass with steam vent' },
      { label: 'Handles', value: 'Heat-resistant' },
      { label: 'Induction', value: 'Compatible' },
    ],
  },
  {
    _id: '4',
    name: 'Stainless Steel Stockpot',
    category: 'Pots & Pans',
    price: 28500,
    image: '/products/stockpot.png',
    description:
      'Cylindrical stockpot with brushed finish and two loop handles. Great for soups, stocks, and boiling.',
    longDescription:
      'Heavy-duty stockpot with straight sides and a brushed stainless finish. Double loop handles on both sides for safe lifting when full. Ideal for making soups, stocks, pasta, and large batches. Even heat distribution for consistent results.',
    specifications: [
      { label: 'Material', value: 'Stainless Steel' },
      { label: 'Finish', value: 'Brushed' },
      { label: 'Handles', value: 'Double loop' },
      { label: 'Induction', value: 'Compatible' },
    ],
  },
  {
    _id: '5',
    name: 'Stainless Steel Frying Pan',
    category: 'Pots & Pans',
    price: 18900,
    image: '/products/frying-pan.png',
    description:
      'Skillet with flared sides and brushed interior. Ergonomic stainless handle with rivets. Oven and stovetop safe.',
    longDescription:
      'A versatile frying pan with flared sides for easy flipping and pouring. Brushed interior is durable and easy to clean. The long handle stays cool and is secured with rivets. Safe for stovetop and oven use.',
    specifications: [
      { label: 'Material', value: 'Stainless Steel' },
      { label: 'Finish', value: 'Brushed' },
      { label: 'Handle', value: 'Riveted, stay-cool' },
      { label: 'Oven safe', value: 'Yes' },
    ],
  },
  {
    _id: '6',
    name: 'Butterfly Stainless Steel Pot',
    category: 'Pots & Pans',
    price: 20800,
    image: '/products/butterfly-pot.png',
    description:
      'Polished stainless steel utility pot. Wide flared rim, deep body. Reliable for cooking and food prep.',
    longDescription:
      'A classic utility pot with a wide flared rim and deep body. Polished stainless steel construction for durability and easy cleaning. Suitable for boiling, steaming, and general kitchen use.',
    specifications: [
      { label: 'Material', value: 'Stainless Steel' },
      { label: 'Finish', value: 'Polished' },
      { label: 'Rim', value: 'Wide flared' },
    ],
  },
  {
    _id: '7',
    name: 'Stainless Steel Wok',
    category: 'Pots & Pans',
    price: 17600,
    image: '/products/wok-wood-handle.png',
    description:
      'Deep wok with rounded bottom and wooden handle. Polished stainless steel. Perfect for stir-fry and high-heat cooking.',
    longDescription:
      'Traditional wok design with a rounded bottom for even heat distribution and easy tossing. Wooden handle stays cool and provides a secure grip. Polished stainless steel construction for stir-frying, frying, and high-heat cooking.',
    specifications: [
      { label: 'Material', value: 'Stainless Steel' },
      { label: 'Handle', value: 'Wood' },
      { label: 'Base', value: 'Rounded' },
      { label: 'Diameter', value: 'Approx. 30 cm' },
    ],
  },
].map(extendProduct)

export const defaultCustomers = [
  {
    _id: 'c1',
    name: 'Nimal Perera',
    email: 'nimal@example.com',
    blocked: false,
    orderCount: 5,
    totalSpent: 125000,
  },
  {
    _id: 'c2',
    name: 'Kamala Silva',
    email: 'kamala@example.com',
    blocked: false,
    orderCount: 2,
    totalSpent: 44100,
  },
  {
    _id: 'c3',
    name: 'Sunil Fernando',
    email: 'sunil@example.com',
    blocked: false,
    orderCount: 1,
    totalSpent: 25300,
  },
  {
    _id: 'c4',
    name: 'Anura Bandara',
    email: 'anura@example.com',
    blocked: true,
    orderCount: 0,
    totalSpent: 0,
  },
]

export const defaultOrders = [
  {
    _id: 'ord-001',
    customerId: 'c1',
    customerName: 'Nimal Perera',
    items: [
      {
        productId: '1',
        name: 'Stainless Steel Cutlery Set',
        qty: 2,
        price: 15700,
      },
    ],
    total: 31400,
    status: 'Delivered',
    date: '2025-02-10',
  },
  {
    _id: 'ord-002',
    customerId: 'c2',
    customerName: 'Kamala Silva',
    items: [
      {
        productId: '3',
        name: 'Stainless Steel Pot with Glass Lid',
        qty: 1,
        price: 25300,
      },
      {
        productId: '5',
        name: 'Stainless Steel Frying Pan',
        qty: 1,
        price: 18900,
      },
    ],
    total: 44200,
    status: 'Shipped',
    date: '2025-02-12',
  },
  {
    _id: 'ord-003',
    customerId: 'c1',
    customerName: 'Nimal Perera',
    items: [
      {
        productId: '4',
        name: 'Stainless Steel Stockpot',
        qty: 1,
        price: 28500,
      },
    ],
    total: 28500,
    status: 'Pending',
    date: '2025-02-14',
  },
  {
    _id: 'ord-004',
    customerId: 'c3',
    customerName: 'Sunil Fernando',
    items: [
      {
        productId: '3',
        name: 'Stainless Steel Pot with Glass Lid',
        qty: 1,
        price: 25300,
      },
    ],
    total: 25300,
    status: 'Delivered',
    date: '2025-02-08',
  },
  {
    _id: 'ord-005',
    customerId: 'c1',
    customerName: 'Nimal Perera',
    items: [
      {
        productId: '2',
        name: 'Stainless Steel Food Container',
        qty: 3,
        price: 10200,
      },
    ],
    total: 30600,
    status: 'Returned',
    date: '2025-02-01',
  },
]

export const defaultPromos = {
  _id: 'default',
  PROMO_CODES: {
    SAVE10: { type: 'percent', value: 10, label: '10% off' },
    SAVE20: { type: 'percent', value: 20, label: '20% off' },
    FLAT500: { type: 'fixed', value: 500, label: 'Rs. 500 off' },
    FLAT1000: { type: 'fixed', value: 1000, label: 'Rs. 1,000 off' },
  },
  FREE_SHIPPING_THRESHOLD: 25000,
  DEFAULT_SHIPPING_COST: 500,
}

export function normalizeProductForCreate(input, id) {
  return extendProduct({ ...input, _id: String(id) })
}

