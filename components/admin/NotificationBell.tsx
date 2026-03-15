"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, ShoppingCart, UserPlus, AlertTriangle, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    created_at: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    new_order: <ShoppingCart className="w-4 h-4 text-cyan-400" />,
    new_customer: <UserPlus className="w-4 h-4 text-green-400" />,
    low_stock: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    order_status: <Check className="w-4 h-4 text-purple-400" />,
    system: <Settings className="w-4 h-4 text-white/40" />,
};

const BG_MAP: Record<string, string> = {
    new_order: "bg-cyan-500/10",
    new_customer: "bg-green-500/10",
    low_stock: "bg-yellow-500/10",
    order_status: "bg-purple-500/10",
    system: "bg-white/5",
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications?limit=15");
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {
            // silent
        }
    }, []);

    // Initial fetch + polling every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const markAsRead = async (id: string) => {
        await fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        await fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAllRead: true }),
        });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const timeAgo = useCallback((dateStr: string) => {
        const now = new Date().getTime();
        const diff = now - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Şimdi";
        if (mins < 60) return `${mins}dk`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}sa`;
        const days = Math.floor(hours / 24);
        return `${days}g`;
    }, []);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5"
                aria-label="Bildirimler"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-[#111] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-[100] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Bildirimler</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-mono bg-danger/20 text-danger px-1.5 py-0.5 rounded">
                                        {unreadCount} yeni
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[10px] text-white/30 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5 uppercase tracking-widest font-bold flex items-center gap-1"
                                    >
                                        <CheckCheck className="w-3 h-3" />
                                        Tümü Okundu
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 text-white/30 hover:text-white transition-colors rounded hover:bg-white/5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell className="w-8 h-8 text-white/10 mx-auto mb-3" />
                                    <p className="text-white/30 text-sm">Henüz bildirim yok</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/[0.03]">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => !n.read && markAsRead(n.id)}
                                            className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                                                n.read
                                                    ? "opacity-50 hover:opacity-70"
                                                    : "hover:bg-white/[0.03]"
                                            }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${BG_MAP[n.type] || "bg-white/5"}`}>
                                                {ICON_MAP[n.type] || ICON_MAP.system}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium leading-tight">{n.title}</p>
                                                <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                                            </div>

                                            {/* Time + Unread dot */}
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className="text-[10px] font-mono text-white/20">{timeAgo(n.created_at)}</span>
                                                {!n.read && (
                                                    <span className="w-2 h-2 rounded-full bg-danger" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
