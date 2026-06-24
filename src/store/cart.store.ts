import { create } from "zustand";
import type { CartWithItems } from "@/types/cart";

interface CartStore {
  cart: CartWithItems | null;
  isOpen: boolean;
  setCart: (cart: CartWithItems | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isOpen: false,
  setCart: (cart) => set({ cart }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  itemCount: () => {
    const { cart } = get();
    if (!cart?.cart_items) return 0;
    return cart.cart_items.reduce((sum, item) => sum + item.quantity, 0);
  },
  total: () => {
    const { cart } = get();
    if (!cart?.cart_items) return 0;
    return cart.cart_items.reduce(
      (sum, item) => sum + item.quantity * item.products.price,
      0
    );
  },
}));
