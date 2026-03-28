/**
 * Helper to get optimized food images based on item name and category.
 * Uses stable Unsplash photo IDs for reliable, relevant images.
 */

// Ordered by specificity — longer/more specific phrases first
const FOOD_KEYWORD_MAP: { keywords: string[]; url: string }[] = [
  // Biryani & Rice
  { keywords: ['chicken biryani'], url: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['mutton biryani', 'lamb biryani'], url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['veg biryani', 'vegetable biryani'], url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['biryani'], url: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['fried rice', 'egg rice'], url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['plain rice', 'steamed rice', 'jeera rice'], url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['pulao', 'pulav'], url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop' },

  // Chicken dishes
  { keywords: ['chilli chicken', 'chili chicken'], url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken tikka masala', 'tikka masala'], url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken tikka'], url: 'https://images.unsplash.com/photo-1599487488085-b2cbc8f8c471?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['butter chicken', 'murgh makhani'], url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken curry'], url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken lollipop', 'lollipop'], url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken wings', 'wings'], url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['grilled chicken'], url: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['tandoori chicken', 'tandoori'], url: 'https://images.unsplash.com/photo-1599487488085-b2cbc8f8c471?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken kebab', 'kebab', 'seekh kebab'], url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken'], url: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?q=80&w=800&auto=format&fit=crop' },

  // Mutton & Lamb
  { keywords: ['mutton curry', 'lamb curry'], url: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['mutton'], url: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?q=80&w=800&auto=format&fit=crop' },

  // Seafood
  { keywords: ['fish and chips', 'fish fry', 'fried fish'], url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['fish curry'], url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['prawn', 'shrimp'], url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['fish'], url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=800&auto=format&fit=crop' },

  // Paneer & Veg Curries
  { keywords: ['paneer tikka'], url: 'https://images.unsplash.com/photo-1567188040759-fb8a254b4376?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['paneer butter masala', 'paneer makhani'], url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['palak paneer', 'palak'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['paneer'], url: 'https://images.unsplash.com/photo-1567188040759-fb8a254b4376?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['dal makhani', 'dal fry', 'dal tadka', 'dal'], url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['rajma'], url: 'https://images.unsplash.com/photo-1545247181-516773cae754?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chole', 'chana masala', 'chole bhature'], url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['aloo gobi', 'aloo sabzi', 'aloo'], url: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8ad7?q=80&w=800&auto=format&fit=crop' },

  // South Indian
  { keywords: ['masala dosa'], url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['plain dosa', 'dosa'], url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['idli'], url: 'https://images.unsplash.com/photo-1610553373069-e29f4c080a92?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['vada', 'medu vada'], url: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8ad7?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['uttapam'], url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['pongal'], url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['sambar'], url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop' },

  // Chinese / Indo-Chinese
  { keywords: ['momos', 'momo', 'dimsum', 'dim sum'], url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['noodles', 'chow mein', 'hakka noodles'], url: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['manchurian'], url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['spring roll'], url: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['soup'], url: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop' },

  // Burgers
  { keywords: ['veg burger', 'veggie burger'], url: 'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chicken burger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['burger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },

  // Pizza
  { keywords: ['margherita pizza', 'margherita'], url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['pepperoni pizza', 'pepperoni'], url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['pizza'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop' },

  // Street Food & Snacks
  { keywords: ['vada pav'], url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['pav bhaji'], url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['pani puri', 'golgappa', 'puchka'], url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['samosa'], url: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8ad7?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['pakora', 'pakoda', 'bhajiya'], url: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8ad7?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['french fries', 'fries'], url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['sandwich'], url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['wrap', 'roll', 'kathi roll'], url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop' },

  // Pasta & Continental
  { keywords: ['pasta', 'spaghetti', 'penne'], url: 'https://images.unsplash.com/photo-1563379926898-05f4fa752c02?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['mac and cheese', 'macaroni'], url: 'https://images.unsplash.com/photo-1612884831073-e226f2f02d95?q=80&w=800&auto=format&fit=crop' },

  // Breads
  { keywords: ['naan'], url: 'https://images.unsplash.com/photo-1590887460806-5c5c2ba3e73c?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['paratha', 'roti', 'chapati'], url: 'https://images.unsplash.com/photo-1586798271654-0471bb1b0517?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['garlic bread'], url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800&auto=format&fit=crop' },

  // Desserts
  { keywords: ['gulab jamun'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['rasgulla', 'rasmalai'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['ice cream', 'icecream'], url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['chocolate cake', 'brownie'], url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['cake'], url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['kheer', 'payasam'], url: 'https://images.unsplash.com/photo-1568466023756-55e4f1e2a97e?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['kulfi'], url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['halwa'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop' },

  // Beverages
  { keywords: ['cold coffee', 'iced coffee'], url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['cappuccino', 'latte', 'espresso', 'coffee'], url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['green tea', 'masala tea', 'chai', 'tea'], url: 'https://images.unsplash.com/photo-1544787210-22bb84065de7?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['mango lassi', 'lassi'], url: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['milkshake', 'shake'], url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['mango juice', 'orange juice', 'juice'], url: 'https://images.unsplash.com/photo-1622597467836-f30a570433d1?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['lemonade', 'nimbu pani', 'lime'], url: 'https://images.unsplash.com/photo-1562445773-84d239f0dafc?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['water', 'mineral water'], url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['soda', 'cola', 'soft drink', 'pepsi', 'coke'], url: 'https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?q=80&w=800&auto=format&fit=crop' },

  // Salads
  { keywords: ['caesar salad', 'salad'], url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop' },
  { keywords: ['raita'], url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=800&auto=format&fit=crop' },

  // Egg items
  { keywords: ['egg', 'omelette', 'omelet', 'scrambled'], url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop' },
];

// Category fallback images using stable Unsplash photo IDs
const CATEGORY_FALLBACK: Record<string, string> = {
  'Pizza':        'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
  'Burger':       'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
  'Beverages':    'https://images.unsplash.com/photo-1622597467836-f30a570433d1?q=80&w=800&auto=format&fit=crop',
  'Desserts':     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
  'South Indian': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop',
  'Main Course':  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
  'Appetizers':   'https://images.unsplash.com/photo-1601050690117-94f5f6fa8ad7?q=80&w=800&auto=format&fit=crop',
  'Fresh Juice':  'https://images.unsplash.com/photo-1622597467836-f30a570433d1?q=80&w=800&auto=format&fit=crop',
  'Combos':       'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
  'Other':        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
};

export const getFoodImage = (itemName: string = '', category: string = '') => {
  const name = itemName.toLowerCase().trim();

  // Try to match item name against all keyword groups (specific first)
  for (const entry of FOOD_KEYWORD_MAP) {
    if (entry.keywords.some(kw => name.includes(kw))) {
      return entry.url;
    }
  }

  // Fallback: category-based image
  if (category && CATEGORY_FALLBACK[category]) {
    return CATEGORY_FALLBACK[category];
  }

  // Final default
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';
};
