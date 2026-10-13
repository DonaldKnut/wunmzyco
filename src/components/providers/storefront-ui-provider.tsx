"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StorefrontUiContextValue = {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  cartBump: number;
  bumpCart: () => void;
};

const StorefrontUiContext = createContext<StorefrontUiContextValue | null>(null);

export function StorefrontUiProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartBump, setCartBump] = useState(0);

  const openCart = useCallback(() => {
    setSearchOpen(false);
    setCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const toggleCart = useCallback(() => {
    setSearchOpen(false);
    setCartOpen((v) => !v);
  }, []);

  const openSearch = useCallback(() => {
    setCartOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleSearch = useCallback(() => {
    setCartOpen(false);
    setSearchOpen((v) => !v);
  }, []);

  const bumpCart = useCallback(() => setCartBump((n) => n + 1), []);

  const value = useMemo(
    () => ({
      cartOpen,
      openCart,
      closeCart,
      toggleCart,
      searchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      cartBump,
      bumpCart,
    }),
    [
      cartOpen,
      openCart,
      closeCart,
      toggleCart,
      searchOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      cartBump,
      bumpCart,
    ],
  );

  return <StorefrontUiContext.Provider value={value}>{children}</StorefrontUiContext.Provider>;
}

export function useStorefrontUi() {
  const ctx = useContext(StorefrontUiContext);
  if (!ctx) {
    throw new Error("useStorefrontUi must be used within StorefrontUiProvider");
  }
  return ctx;
}
