// Helper for safe, category-aware bamboo product imagery and fallbacks

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'interior-decor': '/products/bamboo-pendant-lamp.jpg',
  'traditional-crafts': '/products/bamboo-harvest-basket.jpg',
  'furniture': '/products/bamboo-coffee-table.jpg',
  'kitchen-household': '/products/bamboo-cutlery-organizer.jpg',
  'raw-structural': '/products/bamboo-poles-bundle.jpg',
  'thin-sticks': '/products/bamboo-craft-sticks.jpg',
  'vinayaka-chavithi': '/products/bamboo-poles-bundle.jpg',
  'pooja-essentials': '/products/bamboo-harvest-basket.jpg',
  'bamboo-home-lifestyle': '/products/bamboo-cutlery-organizer.jpg',
  'village-handicrafts': '/products/bamboo-winnowing-tray.jpg',
  'seasonal-festivals': '/products/bamboo-festival-sticks.jpg'
}

export const DEFAULT_BAMBOO_PRODUCT_IMAGE = '/products/bamboo-harvest-basket.jpg'

export const getCategoryFallbackImage = (categorySlug?: string): string => {
  if (!categorySlug) return DEFAULT_BAMBOO_PRODUCT_IMAGE
  return CATEGORY_FALLBACK_IMAGES[categorySlug] || DEFAULT_BAMBOO_PRODUCT_IMAGE
}

// Maps product keywords to authentic project-relative bamboo image assets
export const getMatchingBambooProductImage = (title: string, categorySlug?: string): string => {
  const t = title.toLowerCase()

  // Interior Decor & Lighting
  if (t.includes('pendant') || t.includes('shade') || t.includes('hanging lamp')) {
    return '/products/bamboo-pendant-lamp.jpg'
  }
  if (t.includes('floor lamp') || t.includes('standing lamp') || t.includes('cylindrical')) {
    return '/products/bamboo-floor-lamp.jpg'
  }
  if (t.includes('mirror') || t.includes('sunburst')) {
    return '/products/bamboo-sunburst-mirror.jpg'
  }
  if (t.includes('wall panel') || t.includes('wall art') || t.includes('hexagonal') || t.includes('lattice')) {
    return '/products/bamboo-wall-panel.jpg'
  }
  if (t.includes('planter') || t.includes('tripod') || t.includes('pot') || t.includes('plant')) {
    return '/products/bamboo-planter-stand.jpg'
  }
  if (t.includes('lamp') || t.includes('light')) {
    return '/products/bamboo-pendant-lamp.jpg'
  }

  // Traditional Village-Made Products
  if (t.includes('basket') || t.includes('harvest')) {
    return '/products/bamboo-harvest-basket.jpg'
  }
  if (t.includes('winnowing') || t.includes('cheta') || t.includes('soop')) {
    return '/products/bamboo-winnowing-tray.jpg'
  }
  if (t.includes('fan') || t.includes('visanakarra')) {
    return '/products/bamboo-hand-fan.jpg'
  }
  if (t.includes('mat') || t.includes('chapa') || t.includes('rollable')) {
    return '/products/bamboo-floor-mat.jpg'
  }

  // Furniture
  if (t.includes('shelf') || t.includes('rack') || t.includes('tier') || t.includes('book')) {
    return '/products/bamboo-tier-shelf.jpg'
  }
  if (t.includes('table') || t.includes('coffee')) {
    return '/products/bamboo-coffee-table.jpg'
  }
  if (t.includes('stool') || t.includes('chair') || t.includes('seating') || t.includes('lounge')) {
    return '/products/bamboo-lounge-stool.jpg'
  }

  // Kitchen & Household
  if (t.includes('coaster')) {
    return '/products/bamboo-table-coasters.jpg'
  }
  if (t.includes('serving tray') || (t.includes('tray') && !t.includes('winnowing'))) {
    return '/products/bamboo-serving-tray.jpg'
  }
  if (t.includes('cutlery') || t.includes('organizer') || t.includes('spoon') || t.includes('utensil')) {
    return '/products/bamboo-cutlery-organizer.jpg'
  }

  // Raw Bamboo & Structural Materials
  if (t.includes('culm') || t.includes('strictus') || t.includes('raw dendrocalamus')) {
    return '/products/bamboo-raw-culms.jpg'
  }
  if (t.includes('pole') || t.includes('pandiri') || t.includes('canop')) {
    return '/products/bamboo-poles-bundle.jpg'
  }
  if (t.includes('trellis') || t.includes('lath')) {
    return '/products/bamboo-trellis-laths.jpg'
  }
  if (t.includes('strip') || t.includes('ribbon') || t.includes('weaving strip') || t.includes('sliver')) {
    return '/products/bamboo-weaving-strips.jpg'
  }

  // Thin Bamboo Sticks & Craft Material
  if (t.includes('festival') || t.includes('bouquet')) {
    return '/products/bamboo-festival-sticks.jpg'
  }
  if (t.includes('incense') || t.includes('diffuser')) {
    return '/products/bamboo-incense-sticks.jpg'
  }
  if (t.includes('precision') || t.includes('dowel') || t.includes('architectural')) {
    return '/products/bamboo-precision-sticks.jpg'
  }
  if (t.includes('stick') || t.includes('craft')) {
    return '/products/bamboo-craft-sticks.jpg'
  }

  return getCategoryFallbackImage(categorySlug)
}
