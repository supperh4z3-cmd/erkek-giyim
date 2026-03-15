"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    created_at?: string;
}

interface AuthContextType {
    customer: Customer | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshCustomer = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/customer/me");
            const data = await res.json();
            setCustomer(data.customer || null);
        } catch {
            setCustomer(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCustomer();
    }, [refreshCustomer]);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch("/api/auth/customer/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            setCustomer(data.customer);
            return { success: true };
        } catch {
            return { success: false, error: "Bağlantı hatası" };
        }
    };

    const register = async (name: string, email: string, phone: string, password: string) => {
        try {
            const res = await fetch("/api/auth/customer/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, password }),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error };
            setCustomer(data.customer);
            return { success: true };
        } catch {
            return { success: false, error: "Bağlantı hatası" };
        }
    };

    const logout = async () => {
        await fetch("/api/auth/customer/logout", { method: "POST" });
        setCustomer(null);
    };

    return (
        <AuthContext.Provider value={{ customer, loading, login, register, logout, refreshCustomer }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
