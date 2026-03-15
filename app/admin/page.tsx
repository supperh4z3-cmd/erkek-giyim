"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/admin/Skeleton";
import {
    Package,
    FolderTree,
    Crown,
    Megaphone,
    TrendingUp,
    Activity,
    AlertCircle,
    ShoppingCart,
    Users,
    AlertTriangle,
    Eye,
    BarChart3,
    Star,
    RefreshCw,
    ArrowDownRight,
    ArrowUpRight
} from "lucide-react";

interface DashboardStats {
    totalProducts: number;
    newSeasonCount: number;
    bestSellerCount: number;
    itemsOnSale: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    uniqueCustomers: number;
    lowStockCount: number;
    outOfStockCount: number;
}

interface LowStockProduct {
    id: string;
    name: string;
    totalStock: number;
    category: string;
}

interface RecentOrder {
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
}

interface MonthlySales {
    month: string;
    revenue: number;
}

interface TopSeller {
    name: string;
    quantity: number;
    revenue: number;
}

interface PeriodComparison {
    todayOrders: number;
    yesterdayOrders: number;
    todayRevenue: number;
    yesterdayRevenue: number;
    thisWeekOrders: number;
    lastWeekOrders: number;
    thisWeekRevenue: number;
    lastWeekRevenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
    const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [periodComp, setPeriodComp] = useState<PeriodComparison | null>(null);

    const fetchData = useCallback(async (isInitial = false) => {
        if (!isInitial) setRefreshing(true);
        try {
            const [products, orders] = await Promise.all([
                fetch("/api/products").then(r => r.json()),
                fetch("/api/orders").then(r => r.json()),
            ]);

                const customerEmails = new Set(orders.map((o: { customerEmail?: string }) => o.customerEmail).filter(Boolean));

                const lowStock = products
                    .filter((p: { totalStock?: number }) => (p.totalStock ?? 0) < 5)
                    .map((p: { id: string; name: string; totalStock?: number; category?: string }) => ({
                        id: p.id,
                        name: p.name,
                        totalStock: p.totalStock ?? 0,
                        category: p.category || "",
                    }))
                    .sort((a: LowStockProduct, b: LowStockProduct) => a.totalStock - b.totalStock);

                setLowStockProducts(lowStock);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sortedOrders = [...orders].sort((a: any, b: any) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                ).slice(0, 5);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setRecentOrders(sortedOrders.map((o: any) => ({
                    id: o.id,
                    customerName: o.customerName || "—",
                    total: o.total || 0,
                    status: o.status || "pending",
                    createdAt: o.createdAt || "",
                    itemCount: o.items?.length || 0,
                })));

                setStats({
                    totalProducts: products.length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    newSeasonCount: products.filter((p: any) => p.isNewSeason).length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    bestSellerCount: products.filter((p: any) => p.isBestSeller).length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    itemsOnSale: products.filter((p: any) => p.badge === "sale").length,
                    totalOrders: orders.length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pendingOrders: orders.filter((o: any) => o.status === "pending").length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
                    uniqueCustomers: customerEmails.size,
                    lowStockCount: lowStock.filter((p: LowStockProduct) => p.totalStock > 0).length,
                    outOfStockCount: lowStock.filter((p: LowStockProduct) => p.totalStock === 0).length,
                });
                setLoading(false);

                // Aylık satış verileri (son 6 ay)
                const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
                const now = new Date();
                const monthlyMap = new Map<string, number>();
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    monthlyMap.set(key, 0);
                }
                for (const o of orders) {
                    if (o.date) {
                        const d = new Date(o.date);
                        const key = `${d.getFullYear()}-${d.getMonth()}`;
                        if (monthlyMap.has(key)) {
                            monthlyMap.set(key, (monthlyMap.get(key) || 0) + (o.total || 0));
                        }
                    }
                }
                const salesData: MonthlySales[] = [];
                for (const [key, revenue] of monthlyMap) {
                    const [, monthIdx] = key.split("-");
                    salesData.push({ month: monthNames[parseInt(monthIdx)], revenue });
                }
                setMonthlySales(salesData);

                // Top 5 en çok satan ürünler
                const productSales = new Map<string, { quantity: number; revenue: number }>();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                for (const o of orders) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    for (const item of (o.items || [])) {
                        const existing = productSales.get(item.name) || { quantity: 0, revenue: 0 };
                        existing.quantity += item.quantity || 1;
                        existing.revenue += (item.price || 0) * (item.quantity || 1);
                        productSales.set(item.name, existing);
                    }
                }
                const topList = Array.from(productSales.entries())
                    .map(([name, data]) => ({ name, ...data }))
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5);
                setTopSellers(topList);

                // Dönem karşılaştırma hesaplamaları
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const startOfWeek = new Date(today);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
                const startOfLastWeek = new Date(startOfWeek);
                startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

                let todayOrders = 0, yesterdayOrders = 0, todayRevenue = 0, yesterdayRevenue = 0;
                let thisWeekOrders = 0, lastWeekOrders = 0, thisWeekRevenue = 0, lastWeekRevenue = 0;

                for (const o of orders) {
                    const d = new Date(o.date || 0);
                    d.setHours(0, 0, 0, 0);
                    const total = o.total || 0;
                    if (d.getTime() === today.getTime()) { todayOrders++; todayRevenue += total; }
                    if (d.getTime() === yesterday.getTime()) { yesterdayOrders++; yesterdayRevenue += total; }
                    if (d >= startOfWeek) { thisWeekOrders++; thisWeekRevenue += total; }
                    if (d >= startOfLastWeek && d < startOfWeek) { lastWeekOrders++; lastWeekRevenue += total; }
                }
                setPeriodComp({ todayOrders, yesterdayOrders, todayRevenue, yesterdayRevenue, thisWeekOrders, lastWeekOrders, thisWeekRevenue, lastWeekRevenue });
        } catch {
            // silent
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLastUpdated(new Date());
        }
    }, []);

    // İlk yükleme
    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    // 30 saniyede bir otomatik yenileme + Page Visibility API
    useEffect(() => {
        const startPolling = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => fetchData(), 30000);
        };
        const stopPolling = () => {
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        };

        const handleVisibility = () => {
            if (document.hidden) { stopPolling(); } else { fetchData(); startPolling(); }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibility);
        return () => { stopPolling(); document.removeEventListener("visibilitychange", handleVisibility); };
    }, [fetchData]);

    if (loading || !stats) return <DashboardSkeleton />;
    

    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: "Bekliyor", color: "text-yellow-500 bg-yellow-500/10" },
        processing: { label: "Hazırlanıyor", color: "text-blue-500 bg-blue-500/10" },
        shipped: { label: "Kargoda", color: "text-purple-500 bg-purple-500/10" },
        delivered: { label: "Teslim", color: "text-green-500 bg-green-500/10" },
        cancelled: { label: "İptal", color: "text-red-500 bg-red-500/10" },
    };

    const statCards = [
        { label: "Toplam Ürün", value: stats.totalProducts, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Yeni Sezon", value: stats.newSeasonCount, icon: Crown, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Çok Satanlar", value: stats.bestSellerCount, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "İndirimdekiler", value: stats.itemsOnSale, icon: AlertCircle, color: "text-danger", bg: "bg-danger/10" },
        { label: "Toplam Sipariş", value: stats.totalOrders, icon: ShoppingCart, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        { label: "Bekleyen Sipariş", value: stats.pendingOrders, icon: Activity, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Toplam Gelir", value: `${stats.totalRevenue.toLocaleString("tr-TR")} ₺`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Müşteri Sayısı", value: stats.uniqueCustomers, icon: Users, color: "text-pink-500", bg: "bg-pink-500/10" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-4xl uppercase tracking-tighter text-white mb-2">Sistem Aktif</h1>
                    <p className="text-white/50 text-sm font-mono tracking-widest uppercase">
                        Durum: <span className="text-green-500">AKTİF</span> {`//`} Veri Kaynağı: API Sistemi
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                            Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
                        </span>
                    )}
                    <button
                        onClick={() => fetchData()}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Yenileniyor" : "Yenile"}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#111111] border border-white/5 rounded-lg p-6 flex flex-col justify-between aspect-[4/3] relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className={`w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center ${stat.bg} ${stat.color} mb-4`}>
                                <Icon className="w-6 h-6" />
                            </div>

                            <div>
                                <div className="text-4xl font-display font-medium text-white mb-2 tracking-tighter">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/40">
                                    {stat.label}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Period Comparison */}
            {periodComp && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Bugün Sipariş", current: periodComp.todayOrders, prev: periodComp.yesterdayOrders, prevLabel: "Dün" },
                        { label: "Bugün Gelir", current: periodComp.todayRevenue, prev: periodComp.yesterdayRevenue, prevLabel: "Dün", isCurrency: true },
                        { label: "Bu Hafta Sipariş", current: periodComp.thisWeekOrders, prev: periodComp.lastWeekOrders, prevLabel: "Geçen Hafta" },
                        { label: "Bu Hafta Gelir", current: periodComp.thisWeekRevenue, prev: periodComp.lastWeekRevenue, prevLabel: "Geçen Hafta", isCurrency: true },
                    ].map((item) => {
                        const diff = item.prev > 0 ? ((item.current - item.prev) / item.prev) * 100 : item.current > 0 ? 100 : 0;
                        const isUp = diff >= 0;
                        return (
                            <div key={item.label} className="bg-[#111111] border border-white/5 rounded-lg p-5">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">{item.label}</div>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-display font-bold text-white tracking-tighter">
                                        {item.isCurrency ? `${item.current.toLocaleString("tr-TR")} ₺` : item.current}
                                    </span>
                                    <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                        {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                        {Math.abs(diff).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="text-[10px] text-white/30 mt-2">
                                    {item.prevLabel}: {item.isCurrency ? `${item.prev.toLocaleString("tr-TR")} ₺` : item.prev}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Sales Chart + Top Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Revenue Chart */}
                <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="border-b border-white/5 px-6 py-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-emerald-500" />
                            Aylık Gelir (Son 6 Ay)
                        </h3>
                    </div>
                    <div className="p-6">
                        {monthlySales.length > 0 ? (() => {
                            const maxRevenue = Math.max(...monthlySales.map(s => s.revenue), 1);
                            return (
                                <div className="flex items-end gap-3 h-[180px]">
                                    {monthlySales.map((s, idx) => {
                                        const height = (s.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                                <span className="text-[10px] text-white/40 font-mono">
                                                    {s.revenue > 0 ? `${(s.revenue / 1000).toFixed(0)}K` : "0"}
                                                </span>
                                                <div className="w-full flex-1 flex flex-col justify-end">
                                                    <div
                                                        className="w-full rounded-t-sm transition-all duration-500"
                                                        style={{
                                                            height: `${Math.max(height, 3)}%`,
                                                            background: `linear-gradient(to top, rgba(16,185,129,0.3), rgba(16,185,129,0.8))`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                                                    {s.month}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })() : (
                            <p className="text-white/30 text-sm text-center py-8 font-mono">Veri yok</p>
                        )}
                    </div>
                </div>

                {/* Top 5 Best Sellers */}
                <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="border-b border-white/5 px-6 py-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            En Çok Satanlar
                        </h3>
                    </div>
                    <div className="p-4">
                        {topSellers.length === 0 ? (
                            <p className="text-white/30 text-sm text-center py-8 font-mono">Satış verisi yok</p>
                        ) : (
                            <div className="space-y-3">
                                {topSellers.map((item, idx) => {
                                    const maxQty = topSellers[0].quantity;
                                    const barWidth = (item.quantity / maxQty) * 100;
                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white text-sm font-medium truncate flex-1 mr-3">
                                                    <span className="text-white/30 font-mono text-xs mr-2">#{idx + 1}</span>
                                                    {item.name}
                                                </span>
                                                <span className="text-white/50 text-xs font-mono whitespace-nowrap">
                                                    {item.quantity} adet · ₺{item.revenue.toLocaleString("tr-TR")}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-yellow-500/50 to-yellow-400"
                                                    style={{ width: `${barWidth}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

                {/* Düşük Stok Uyarıları */}
                <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            Stok Uyarıları
                        </h3>
                        {lowStockProducts.length > 0 && (
                            <span className="text-xs font-mono text-danger bg-danger/10 px-2 py-1 rounded">
                                {lowStockProducts.length}
                            </span>
                        )}
                    </div>
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                        {lowStockProducts.length === 0 ? (
                            <p className="text-white/30 text-sm text-center py-4 font-mono">Tüm stoklar yeterli ✓</p>
                        ) : (
                            <div className="space-y-2">
                                {lowStockProducts.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={`/admin/products/${p.id}/edit`}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white text-sm font-medium truncate group-hover:text-danger transition-colors">
                                                {p.name}
                                            </p>
                                            <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest">{p.category}</p>
                                        </div>
                                        <span className={`ml-3 text-xs font-bold font-mono px-2 py-1 rounded ${
                                            p.totalStock === 0
                                                ? "text-red-400 bg-red-500/20"
                                                : "text-yellow-400 bg-yellow-500/20"
                                        }`}>
                                            {p.totalStock === 0 ? "TÜKENDİ" : `${p.totalStock} adet`}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Son Siparişler */}
                <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-cyan-500" />
                            Son Siparişler
                        </h3>
                        <Link href="/admin/orders" className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Tümü
                        </Link>
                    </div>
                    <div className="p-4">
                        {recentOrders.length === 0 ? (
                            <p className="text-white/30 text-sm text-center py-4 font-mono">Henüz sipariş yok</p>
                        ) : (
                            <div className="space-y-2">
                                {recentOrders.map((o) => {
                                    const st = statusMap[o.status] || statusMap.pending;
                                    return (
                                        <div key={o.id} className="flex items-center justify-between px-3 py-2.5 rounded-md bg-white/[0.02]">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white text-sm font-medium truncate">{o.customerName}</p>
                                                <p className="text-white/30 text-[10px] font-mono">
                                                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("tr-TR") : "—"} · {o.itemCount} ürün
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${st.color}`}>
                                                    {st.label}
                                                </span>
                                                <span className="text-white font-mono text-sm font-bold">
                                                    ₺{o.total.toLocaleString("tr-TR")}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="border-b border-white/5 px-6 py-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-white/80">
                            Hızlı Eylemler
                        </h3>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <Link href="/admin/products/new" className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors border border-white/5 flex items-center gap-3">
                            <Package className="w-4 h-4 opacity-50" />
                            Yeni Ürün Ekle
                        </Link>
                        <Link href="/admin/orders" className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors border border-white/5 flex items-center gap-3">
                            <ShoppingCart className="w-4 h-4 opacity-50" />
                            Siparişleri Yönet
                        </Link>
                        <Link href="/admin/pages/campaigns" className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors border border-white/5 flex items-center gap-3">
                            <Megaphone className="w-4 h-4 opacity-50" />
                            Kampanya Düzenle
                        </Link>
                        <Link href="/admin/categories" className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors border border-white/5 flex items-center gap-3">
                            <FolderTree className="w-4 h-4 opacity-50" />
                            Koleksiyonları Sırala
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
