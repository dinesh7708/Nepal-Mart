import { MembershipTier } from './types';

export const CATEGORIES = [
  { id: 'fruits-veg', name: 'Fruits & Vegetables', icon: 'Apple', image: 'https://images.unsplash.com/photo-1610832958506-aa5619897681?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'dairy-bread', name: 'Dairy, Bread & Eggs', icon: 'Milk', image: 'https://images.unsplash.com/photo-1550583724-125581cc258b?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'munchies', name: 'Munchies & Snacks', icon: 'Cookie', image: 'https://images.unsplash.com/photo-1599490659223-e1539e7af924?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'beverages', name: 'Cold Drinks & Juices', icon: 'CupSoda', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'meats', name: 'Chicken, Meat & Fish', icon: 'Beef', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'household', name: 'Household Essentials', icon: 'Home', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'nepali-khana', name: 'Nepali Khana', icon: 'Utensils', image: 'https://images.unsplash.com/photo-1541518763669-27f90491753b?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'burgers', name: 'Burgers & Pizzas', icon: 'Pizza', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&h=200&auto=format&fit=crop' },
];

export const MOCK_PRODUCTS = [
  // ... grocery products ...
  {
    id: 'p1',
    name: 'Fresh Cow Milk (DDC)',
    description: 'Fresh and pasteurized cow milk for your daily needs.',
    price: 105,
    unit: '500 ml',
    category: 'dairy-bread',
    image: 'https://images.unsplash.com/photo-1563636619-e9107da5a165?q=80&w=400&h=400&auto=format&fit=crop',
    storeId: 's1',
    stock: 50
  },
  {
    id: 'p2',
    name: 'Organic Cauliflower (Local)',
    description: 'Freshly harvested cauliflower from local farms.',
    price: 80,
    discountPrice: 65,
    unit: '1 kg',
    category: 'fruits-veg',
    image: 'https://images.unsplash.com/photo-1510627489930-0c1b0ba9448f?q=80&w=400&h=400&auto=format&fit=crop',
    storeId: 's1',
    stock: 20
  },
  {
    id: 'p3',
    name: 'Real Mixed Fruit Juice',
    description: 'Healthy and refreshing mixed fruit juice.',
    price: 250,
    unit: '1 L',
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=400&h=400&auto=format&fit=crop',
    storeId: 's2',
    stock: 15
  },
  {
    id: 'p4',
    name: 'Wai Wai Noodles (10 Pack)',
    description: 'The iconic taste of Nepal, ready in minutes.',
    price: 200,
    discountPrice: 185,
    unit: '10 pcs',
    category: 'munchies',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&h=400&auto=format&fit=crop',
    storeId: 's1',
    stock: 100
  },
  // Food items
  {
    id: 'p-food-1',
    name: 'Classic Chicken MoMo',
    description: 'Authentic steamed chicken dumplings served with spicy tomato chutney.',
    price: 220,
    unit: '10 pcs',
    category: 'nepali-khana',
    image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=400&h=400&auto=format&fit=crop',
    storeId: 's3',
    stock: 999,
    isVeg: false,
    preparationTime: 20
  },
  {
    id: 'p-food-2',
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy cottage cheese curry with authentic spices.',
    price: 450,
    unit: 'Serving',
    category: 'nepali-khana',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400&h=400&auto=format&fit=crop',
    storeId: 's3',
    stock: 999,
    isVeg: true,
    preparationTime: 25
  },
  {
    id: 'p-food-3',
    name: 'Crunchy Chicken Burger',
    description: 'Zesty crispy chicken patty with fresh lettuce and secret mayo.',
    price: 320,
    unit: 'Pcs',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&h=400&auto=format&fit=crop',
    storeId: 's4',
    stock: 999,
    isVeg: false,
    preparationTime: 15
  }
];

export const MOCK_STORES = [
  {
    id: 's1',
    name: 'Kathmandu Daily Mart',
    category: 'Grocery',
    type: 'grocery' as const,
    address: 'Jawalakhel, Lalitpur',
    location: { lat: 27.6732, lng: 85.3123 },
    logo: 'https://images.unsplash.com/photo-1534723452862-4c874e70d98a?q=80&w=100&h=100&auto=format&fit=crop',
    rating: 4.8,
    reviewsCount: 124,
    deliveryTime: '20-30 mins',
    deliveryCharge: 40,
    deliveryRadius: 5,
    status: 'approved' as const
  },
  {
    id: 's2',
    name: 'Everest Cold Store',
    category: 'Meats & Beverages',
    type: 'grocery' as const,
    address: 'Baneshwor, Kathmandu',
    location: { lat: 27.6896, lng: 85.3400 },
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100&h=100&auto=format&fit=crop',
    rating: 4.5,
    reviewsCount: 89,
    deliveryTime: '30-45 mins',
    deliveryCharge: 60,
    deliveryRadius: 8,
    status: 'approved' as const
  },
  {
    id: 's3',
    name: 'The Nepali Kitchen',
    category: 'Authentic Nepali',
    type: 'restaurant' as const,
    address: 'Thamel, Kathmandu',
    location: { lat: 27.7172, lng: 85.3240 },
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=100&h=100&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 256,
    deliveryTime: '30-40 mins',
    deliveryCharge: 50,
    deliveryRadius: 6,
    status: 'approved' as const
  },
  {
    id: 's4',
    name: 'Bakers Hill Cafe',
    category: 'Fast Food & Bakery',
    type: 'restaurant' as const,
    address: 'Durbar Marg, Kathmandu',
    location: { lat: 27.7100, lng: 85.3160 },
    logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=100&h=100&auto=format&fit=crop',
    rating: 4.7,
    reviewsCount: 167,
    deliveryTime: '25-35 mins',
    deliveryCharge: 45,
    deliveryRadius: 4,
    status: 'approved' as const
  },
  {
    id: 's5',
    name: 'Fresh Farm Groceries',
    category: 'Vegetables',
    type: 'grocery' as const,
    address: 'Koteshwor, Kathmandu',
    location: { lat: 27.6756, lng: 85.3478 },
    logo: 'https://images.unsplash.com/photo-1488459711612-da3072228392?q=80&w=100&h=100&auto=format&fit=crop',
    rating: 4.4,
    reviewsCount: 45,
    deliveryTime: '15-25 mins',
    deliveryCharge: 30,
    deliveryRadius: 3,
    status: 'approved' as const
  }
];

export const LOYALTY_TIERS: MembershipTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minSpend: 0,
    pointsMultiplier: 1,
    benefits: ['Earn 1 point for every Rs. 100 spent', 'Standard delivery fees'],
    color: '#CD7F32'
  },
  {
    id: 'silver',
    name: 'Silver',
    minSpend: 5000,
    pointsMultiplier: 1.5,
    benefits: ['Earn 1.5 points for every Rs. 100 spent', '5% discount on fruits & vegetables', 'Priority support'],
    color: '#C0C0C0'
  },
  {
    id: 'gold',
    name: 'Gold',
    minSpend: 15000,
    pointsMultiplier: 2,
    benefits: ['Earn 2 points for every Rs. 100 spent', 'Free delivery on orders above Rs. 500', '10% discount on munchies', 'Early access to sales'],
    color: '#FFD700'
  }
];

export const POINTS_CONVERSION_RATE = 100; // 1 point per Rs. 100
export const REDEMPTION_VALUE = 1; // 1 point = Rs. 1
export const REFERRAL_DISCOUNT = 150; // Rs. 150 discount for referral

export const APP_THEME = {
  primary: '#0C831F', // Fresh green
  secondary: '#FFFAEB', // Light cream
  accent: '#DC3545', // Nepal flag red
};
