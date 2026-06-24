import { create } from "zustand";

interface WishlistStore {
  productIds: Set<string>;
  setProductIds: (ids: string[]) => void;
  addId: (id: string) => void;
  removeId: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  productIds: new Set(),
  setProductIds: (ids) => set({ productIds: new Set(ids) }),
  addId: (id) =>
    set((s) => ({ productIds: new Set([...s.productIds, id]) })),
  removeId: (id) =>
    set((s) => {
      const next = new Set(s.productIds);
      next.delete(id);
      return { productIds: next };
    }),
  isWishlisted: (id) => get().productIds.has(id),
}));
