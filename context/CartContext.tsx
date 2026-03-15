"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface CartItem {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    image: string;
    size: string;
    color: string;
}

interface CartContextType {
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    toggleCart: () => void;
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (id: string, size: string, color: string) => void;
    updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
}

const CART_STORAGE_KEY = "chase-chain-cart";

function loadCartFromStorage(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCartToStorage(items: CartItem[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch { /* quota exceeded etc */ }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        setItems(loadCartFromStorage());
        setIsHydrated(true);
    }, []);

    // Persist to localStorage on change (after hydration)
    useEffect(() => {
        if (isHydrated) {
            saveCartToStorage(items);
        }
    }, [items, isHydrated]);

    const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

    // Unique key for a cart item = id + size + color
    const getKey = (id: string, size: string, color: string) => `${id}-${size}-${color}`;

    const addItem = useCallback((newItem: Omit<CartItem, "quantity">, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(
                i => getKey(i.id, i.size, i.color) === getKey(newItem.id, newItem.size, newItem.color)
            );
            if (existing) {
                return prev.map(i =>
                    getKey(i.id, i.size, i.color) === getKey(newItem.id, newItem.size, newItem.color)
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...newItem, quantity }];
        });
        setIsCartOpen(true);
    }, []);

    const removeItem = useCallback((id: string, size: string, color: string) => {
        setItems(prev => prev.filter(i => getKey(i.id, i.size, i.color) !== getKey(id, size, color)));
    }, []);

    const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id, size, color);
            return;
        }
        setItems(prev =>
            prev.map(i =>
                getKey(i.id, i.size, i.color) === getKey(id, size, color)
                    ? { ...i, quantity }
                    : i
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{
            isCartOpen, setIsCartOpen, toggleCart,
            items, addItem, removeItem, updateQuantity, clearCart,
            totalItems, subtotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
