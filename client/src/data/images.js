// Central image library — real Unsplash photos (w=600, cropped).
// Fallback: if any URL 404s, the <RealImage> component shows SVG art.

export const IMAGE_MAP = {
  // Bases — different pizza styles
  'Thin Crust': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60',
  'Thick Crust': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=60',
  'Cheese Burst': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop&q=60',
  'Whole Wheat': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&auto=format&fit=crop&q=60',
  'Gluten-Free': 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&auto=format&fit=crop&q=60',

  // Sauces — sauce / pizza tint close-ups
  'Tomato Basil': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&auto=format&fit=crop&q=60',
  'BBQ': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&auto=format&fit=crop&q=60',
  'Pesto': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&auto=format&fit=crop&q=60',
  'Alfredo': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=60',
  'Peri Peri': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=60',

  // Cheeses
  'Mozzarella': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=60',
  'Cheddar': 'https://images.unsplash.com/photo-1634487359989-3e90c9432133?w=400&auto=format&fit=crop&q=60',
  'Vegan Cheese': 'https://images.unsplash.com/photo-1589881133825-bbb3ead48a3b?w=400&auto=format&fit=crop&q=60',

  // Vegetables
  'Capsicum': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&auto=format&fit=crop&q=60',
  'Onion': 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&auto=format&fit=crop&q=60',
  'Mushroom': 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&auto=format&fit=crop&q=60',
  'Olives': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=60',
  'Jalapeno': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&auto=format&fit=crop&q=60',

  // Generic fallbacks
  '_hero': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=700&auto=format&fit=crop&q=60',
  '_special_supreme': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
  '_special_cheese': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=60',
  '_special_bbq': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=60',
  '_combo': 'https://images.unsplash.com/photo-1604382355076-af4b54d39d93?w=700&auto=format&fit=crop&q=60',
};

export function getImage(name, fallback = IMAGE_MAP['_hero']) {
  return IMAGE_MAP[name] || fallback;
}
