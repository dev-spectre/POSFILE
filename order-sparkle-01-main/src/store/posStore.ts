import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Restaurant {
  _id?: string;
  restaurantName: string;
  adminUsername: string;
  adminEmail: string;
  phoneNumber: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  cuisineType?: string;
}

export interface MenuItem {
  _id?: string;
  name: string;
  price: number;
  finalPrice: number;
  category: string;
  image?: string;
  discountPercentage?: number;
  description?: string;
  isVeg?: boolean;
  preparationTime?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  itemTotal?: number;
}

export interface Order {
  _id?: string;
  orderId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  customerPhone: string;
  customerName?: string;
  paymentMethod: 'upi' | 'card' | 'cash' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  restaurant: Restaurant | null;
  setAuth: (token: string, restaurant: Restaurant) => void;
  logout: () => void;
}

interface POSState {
  cart: CartItem[];
  discount: number;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

interface CombinedState extends AuthState, POSState {}

export const useStore = create<CombinedState>()(
  persist(
    (set, get) => ({
      // Auth state - demo restaurant loaded by default
      isAuthenticated: true,
      token: 'demo-token-no-auth',
      restaurant: {
        restaurantName: 'Demo Restaurant',
        adminUsername: 'demo',
        adminEmail: 'demo@restaurant.com',
        phoneNumber: '9999999999',
        address: 'Demo Address, Demo City',
        city: 'Demo City',
        state: 'Demo State',
        zipCode: '000000',
        cuisineType: 'Multi-cuisine',
      },

      setAuth: (token: string, restaurant: Restaurant) =>
        set({
          isAuthenticated: true,
          token,
          restaurant,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          restaurant: null,
          cart: [],
        }),

      // POS state
      cart: [],
      discount: 0,

      addToCart: (item: MenuItem) =>
        set((state) => {
          const existing = state.cart.find((c) => c._id === item._id);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),

      removeFromCart: (id: string) =>
        set((state) => ({
          cart: state.cart.filter((c) => c._id !== id),
        })),

      updateQuantity: (id: string, quantity: number) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c._id === id ? { ...c, quantity: Math.max(1, quantity) } : c
          ),
        })),

      clearCart: () =>
        set({
          cart: [],
          discount: 0,
        }),

      setDiscount: (discount: number) => set({ discount }),

      getSubtotal: () => {
        return get().cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0);
      },

      getTax: () => {
        return Math.round(get().getSubtotal() * 0.05);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax();
        const discount = get().discount;
        return subtotal + tax - discount;
      },
    }),
    {
      name: 'pos-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        restaurant: state.restaurant,
        cart: state.cart,
        discount: state.discount,
      }),
    }
  )
);

// Backward compatibility export
export const usePOSStore = useStore;
