'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'amantis.cart';
const STORAGE_VERSION = 1;

export type CartItem = {
  /** Stable line key — composed of productId + variantId so two variants of
   *  the same product live as separate lines. */
  lineId: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  qty: number;
  thumbnailKey: string | null;
};

type Persisted = {
  v: typeof STORAGE_VERSION;
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  /** Hydrated flag — false during SSR + first paint, true once localStorage
   *  has been read. Use this to suppress badge flicker. */
  hydrated: boolean;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readPersisted(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Persisted | unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'v' in parsed &&
      (parsed as Persisted).v === STORAGE_VERSION &&
      Array.isArray((parsed as Persisted).items)
    ) {
      return (parsed as Persisted).items;
    }
  } catch {
    // Corrupted payload — drop silently. Next write will overwrite it.
  }
  return [];
}

function writePersisted(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload: Persisted = { v: STORAGE_VERSION, items };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota / private mode — best-effort.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first client render. Doing this in an effect
  // (not useState initializer) keeps SSR output deterministic.
  useEffect(() => {
    setItems(readPersisted());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    writePersisted(items);
  }, [items, hydrated]);

  const add = useCallback<CartContextValue['add']>((item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.lineId === item.lineId);
      if (idx === -1) return [...prev, { ...item, qty }];
      const next = [...prev];
      const existing = next[idx]!;
      next[idx] = { ...existing, qty: existing.qty + qty };
      return next;
    });
  }, []);

  const setQty = useCallback<CartContextValue['setQty']>((lineId, qty) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((p) => p.lineId !== lineId);
      return prev.map((p) => (p.lineId === lineId ? { ...p, qty } : p));
    });
  }, []);

  const remove = useCallback<CartContextValue['remove']>((lineId) => {
    setItems((prev) => prev.filter((p) => p.lineId !== lineId));
  }, []);

  const clear = useCallback<CartContextValue['clear']>(() => {
    setItems([]);
  }, []);

  const count = useMemo(() => items.reduce((acc, i) => acc + i.qty, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, count, hydrated, add, setQty, remove, clear }),
    [items, count, hydrated, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
