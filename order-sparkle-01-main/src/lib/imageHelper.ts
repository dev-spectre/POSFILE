/**
 * Helper to get optimized food images based on item name and category.
 * Uses Unsplash Source API for dynamic, relevant images.
 */

const CATEGORY_IMAGES: Record<string, string> = {
  'Pizza': 'pizza',
  'Burger': 'burger',
  'Drinks': 'beverages',
  'Beverages': 'beverages',
  'Desserts': 'sweets',
  'South Indian': 'dosa',
  'Main Course': 'meals',
  'Appetizers': 'starter',
  'Fresh Juice': 'fruitjuice',
  'Pasta': 'pasta',
  'Salad': 'salad',
  'Snacks': 'snacks',
  'Bakery': 'pastry'
};

export const getFoodImage = (itemName: string = '', category: string = '') => {
  const name = itemName.toLowerCase();
  
  // Specific item logic
  if (name.includes('biryani')) return `https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('coffee')) return `https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('tea')) return `https://images.unsplash.com/photo-1544787210-22bb84065de7?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('burger')) return `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('pizza')) return `https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('dosa')) return `https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('idli')) return `https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('pasta')) return `https://images.unsplash.com/photo-1563379926898-05f4fa752c02?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('sandwich')) return `https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('cake')) return `https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop`;
  if (name.includes('juice')) return `https://images.unsplash.com/photo-1622597467836-f30a570433d1?q=80&w=800&auto=format&fit=crop`;

  // Fallback to category mapping
  const categoryKey = Object.keys(CATEGORY_IMAGES).find(key => 
    category.toLowerCase().includes(key.toLowerCase())
  );

  if (categoryKey) {
    const keyword = CATEGORY_IMAGES[categoryKey];
    return `https://source.unsplash.com/featured/800x600?${keyword},food`;
  }

  // Default fallback
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop`;
};
