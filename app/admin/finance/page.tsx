"use client";

import { useState, useEffect, useMemo } from "react";
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Loader2,
    BarChart3,
    Clock,
    XCircle,
    CheckCircle,
    Trophy,
    Layers,
    CalendarDays,
    Calendar,
    CalendarRange,
    Zap,
    ArrowUpRight,
    RotateCcw,
} from "lucide-react";

interface FinanceData {
    overview: {
        totalRevenue: number;
        completedRevenue: number;
        pendingRevenue: number;
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        totalOrders: number;
        todayOrders: number;
        weekOrders: number;
        monthOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        avgOrderValue: number;
        totalProducts: number;
        totalCustomers: number;
        uniqueOrderCustomers: number;
    };
    monthlySales: { month: string; revenue: number; orders: number; items: number }[];
    weeklySales: { label: string; revenue: number; orders: number }[];
    dailySales: { date: string; day: string; revenue: number; orders: number }[];
    topSellers: { name: string; quantity: number; revenue: number; image?: string }[];
    categoryBreakdown: { name: string; revenue: number; orders: number; quantity: number }[];
    recentOrders: { id: string; customerName: string; email: string; total: number; status: string; date: string; itemCount: number }[];
    statusCounts: Record<string, number>;
    paymentCounts: Record<string, number>;
    totalRefunds: number;
    returnCount: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Beklemede", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    processing: { label: "Hazırlanıyor", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    shipped: { label: "Kargoda", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    delivered: { label: "Teslim Edildi", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    cancelled: { label: "İptal", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const CATEGORY_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4", "#14b8a6", "#a855f7"];

function formatCurrency(val: number) {
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
}

type ChartPeriod = "daily" | "weekly" | "monthly";

// ─── Enhanced Bar Chart ───
function BarChart({ data, height = 200 }: { data: { label: string; value: number; secondary?: number }[]; height?: number }) {
    const max = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 w-14 flex flex-col justify-between text-right pr-2 pointer-events-none">
                <span className="text-[9px] text-white/20 font-mono">{formatCurrency(max)}</span>
                <span className="text-[9px] text-white/20 font-mono">{formatCurrency(max / 2)}</span>
                <span className="text-[9px] text-white/20 font-mono">0</span>
            </div>

            {/* Grid lines */}
            <div className="ml-14 relative" style={{ height }}>
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="border-b border-white/[0.03]" />
                    ))}
                </div>

                {/* Bars */}
                <div className="flex items-end gap-[2px] h-full relative z-10">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            <div
                                className="w-full rounded-t transition-all duration-300 group-hover:brightness-125 cursor-pointer min-h-[2px]"
                                style={{
                                    height: `${Math.max((d.value / max) * 100, 1)}%`,
                                    background: d.value > 0
                                        ? `linear-gradient(180deg, #ef4444 0%, #7f1d1d 100%)`
                                        : "#141414",
                                    borderRadius: data.length <= 12 ? "4px 4px 0 0" : "2px 2px 0 0",
                                }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none">
                                <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-2xl shadow-black/50 whitespace-nowrap">
                                    <div className="text-xs font-bold text-white">{formatCurrency(d.value)} TL</div>
                                    {d.secondary !== undefined && <div className="text-[10px] text-white/40 mt-0.5">{d.secondary} sipariş</div>}
                                    <div className="text-[10px] text-white/30 mt-0.5">{d.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* X-axis labels */}
            <div className="ml-14 flex justify-between mt-2 px-0.5">
                {data.length <= 15 ? (
                    data.map((d, i) => (
                        <span key={i} className="text-[8px] text-white/20 font-mono flex-1 text-center truncate">{d.label}</span>
                    ))
                ) : (
                    <>
                        <span className="text-[9px] text-white/20 font-mono">{data[0]?.label}</span>
                        <span className="text-[9px] text-white/20 font-mono">{data[Math.floor(data.length / 2)]?.label}</span>
                        <span className="text-[9px] text-white/20 font-mono">{data[data.length - 1]?.label}</span>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── KPI Card ───
function KpiCard({ label, value, prefix = "", suffix = "", subLabel, subValue, icon: Icon, color = "#ef4444" }: {
    label: string; value: string | number; prefix?: string; suffix?: string;
    subLabel?: string; subValue?: string;
    icon: typeof DollarSign; color?: string;
}) {
    return (
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" style={{ background: color }} />
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-[3px] font-bold">{label}</span>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                {prefix}{typeof value === "number" ? formatCurrency(value) : value}{suffix}
            </div>
            {subLabel && subValue && (
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider">{subLabel}:</span>
                    <span className="text-[10px] text-white/50 font-bold">{subValue}</span>
                </div>
            )}
        </div>
    );
}

export default function FinancePage() {
    const [data, setData] = useState<FinanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("daily");
    const [topSellerView, setTopSellerView] = useState<"revenue" | "quantity">("revenue");

    useEffect(() => {
        fetch("/api/finance")
            .then(r => r.json())
            .then(d => {
                // Finance data loaded
                setData(d);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const chartData = useMemo(() => {
        if (!data) return [];
        if (chartPeriod === "daily") {
            return data.dailySales.map(d => ({ label: d.day, value: d.revenue, secondary: d.orders }));
        }
        if (chartPeriod === "weekly") {
            return data.weeklySales.map(d => ({ label: d.label, value: d.revenue, secondary: d.orders }));
        }
        return data.monthlySales.map(d => ({ label: d.month, value: d.revenue, secondary: d.orders }));
    }, [data, chartPeriod]);

    const sortedTopSellers = useMemo(() => {
        if (!data) return [];
        return [...data.topSellers].sort((a, b) =>
            topSellerView === "revenue" ? b.revenue - a.revenue : b.quantity - a.quantity
        );
    }, [data, topSellerView]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-danger animate-spin" />
                    <span className="text-xs text-white/30 uppercase tracking-widest">Veriler yükleniyor</span>
                </div>
            </div>
        );
    }

    if (!data) return <div className="text-white/50 text-center py-20">Veri yüklenemedi.</div>;

    const { overview, categoryBreakdown, recentOrders, statusCounts } = data;
    const totalStatusOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-20">

            {/* ═══ HEADER ═══ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-5 h-5 text-danger" />
                        <h1 className="text-xl lg:text-2xl font-black uppercase tracking-widest text-white">Finans Paneli</h1>
                    </div>
                    <p className="text-white/30 text-xs">Satış analitiği, ciro raporu ve ürün performansı</p>
                </div>
            </div>

            {/* ═══ QUICK STATS ROW ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-red-500/10 to-red-900/5 border border-red-500/10 rounded-xl p-4 text-center">
                    <Zap className="w-5 h-5 text-red-400 mx-auto mb-2" />
                    <div className="text-lg font-black text-white">{formatCurrency(overview.todayRevenue)} TL</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Bugün</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{overview.todayOrders} sipariş</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/10 rounded-xl p-4 text-center">
                    <CalendarDays className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-lg font-black text-white">{formatCurrency(overview.weekRevenue)} TL</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Bu Hafta</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{overview.weekOrders} sipariş</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 border border-purple-500/10 rounded-xl p-4 text-center">
                    <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <div className="text-lg font-black text-white">{formatCurrency(overview.monthRevenue)} TL</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Bu Ay</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{overview.monthOrders} sipariş</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-900/5 border border-green-500/10 rounded-xl p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
                    <div className="text-lg font-black text-white">{formatCurrency(overview.totalRevenue)} TL</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Toplam Ciro</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{overview.totalOrders} sipariş</div>
                </div>
            </div>

            {/* ═══ KPI CARDS ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <KpiCard icon={DollarSign} label="Ort. Sepet" value={overview.avgOrderValue} suffix=" TL" color="#ef4444" />
                <KpiCard icon={ShoppingCart} label="Siparişler" value={String(overview.totalOrders)} color="#3b82f6"
                    subLabel="Tamamlanan" subValue={String(overview.completedOrders)} />
                <KpiCard icon={Users} label="Müşteriler" value={String(overview.totalCustomers)} color="#22c55e"
                    subLabel="Sipariş veren" subValue={String(overview.uniqueOrderCustomers)} />
                <KpiCard icon={Package} label="Ürünler" value={String(overview.totalProducts)} color="#8b5cf6" />
            </div>

            {/* ═══ REVENUE BREAKDOWN ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-white font-black text-lg">{formatCurrency(overview.completedRevenue)} TL</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-[3px]">Tamamlanan Ciro</div>
                    </div>
                </div>
                <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/15 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-white font-black text-lg">{formatCurrency(overview.pendingRevenue)} TL</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-[3px]">Bekleyen Ciro</div>
                    </div>
                </div>
                <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                        <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-white font-black text-lg">{overview.cancelledOrders} adet</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-[3px]">İptal Edilen</div>
                    </div>
                </div>
                <div className="bg-[#0d0d0d] border border-orange-500/10 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center shrink-0">
                        <RotateCcw className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-white font-black text-lg">{formatCurrency(data.totalRefunds)} TL</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-[3px]">İade Edilen ({data.returnCount})</div>
                    </div>
                </div>
            </div>

            {/* ═══ SALES CHART ═══ */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-3 sm:mb-0">
                        <BarChart3 className="w-4 h-4 text-danger" />
                        <span className="text-sm font-black text-white uppercase tracking-widest">Satış Grafiği</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-lg p-1">
                        {([
                            { key: "daily" as const, label: "Günlük", icon: CalendarDays },
                            { key: "weekly" as const, label: "Haftalık", icon: CalendarRange },
                            { key: "monthly" as const, label: "Aylık", icon: Calendar },
                        ]).map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setChartPeriod(opt.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${
                                    chartPeriod === opt.key
                                        ? "bg-danger text-white shadow-lg shadow-danger/20"
                                        : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                                }`}
                            >
                                <opt.icon className="w-3 h-3" />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-5 pt-4">
                    <BarChart data={chartData} height={200} />
                </div>
            </div>

            {/* ═══ TWO COLUMN: TOP SELLERS + CATEGORY ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">

                {/* Top Sellers — wider (3 cols) */}
                <div className="lg:col-span-3 bg-[#0d0d0d] border border-white/[0.06] rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-3 sm:mb-0">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-black text-white uppercase tracking-widest">En Çok Satanlar</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-lg p-1">
                            <button
                                onClick={() => setTopSellerView("revenue")}
                                className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${topSellerView === "revenue" ? "bg-danger text-white" : "text-white/40 hover:text-white/60"}`}
                            >
                                Ciroya Göre
                            </button>
                            <button
                                onClick={() => setTopSellerView("quantity")}
                                className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${topSellerView === "quantity" ? "bg-danger text-white" : "text-white/40 hover:text-white/60"}`}
                            >
                                Adete Göre
                            </button>
                        </div>
                    </div>
                    <div className="p-5 space-y-1.5">
                        {sortedTopSellers.length === 0 ? (
                            <p className="text-white/20 text-sm text-center py-12">Henüz satış verisi yok</p>
                        ) : (
                            sortedTopSellers.map((product, i) => {
                                const maxVal = topSellerView === "revenue"
                                    ? sortedTopSellers[0]?.revenue || 1
                                    : sortedTopSellers[0]?.quantity || 1;
                                const curVal = topSellerView === "revenue" ? product.revenue : product.quantity;
                                const pct = (curVal / maxVal) * 100;

                                return (
                                    <div key={i} className="flex items-center gap-3 py-2 group hover:bg-white/[0.015] rounded-lg px-2 -mx-2 transition-colors">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${i < 3 ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 text-yellow-500 border border-yellow-500/20" : "bg-white/[0.03] text-white/30 border border-white/[0.06]"}`}>
                                            {i + 1}
                                        </div>

                                        {product.image && (
                                            <img src={product.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-white/5 shrink-0" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs text-white font-bold truncate">{product.name}</span>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-[10px] text-white/30 font-mono">{product.quantity} adet</span>
                                                    <span className="text-xs text-white font-bold font-mono w-24 text-right">{formatCurrency(product.revenue)} TL</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden mt-1.5">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: i < 3
                                                            ? "linear-gradient(90deg, #ef4444, #dc2626)"
                                                            : "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Column (2 cols) */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">

                    {/* Category Breakdown */}
                    <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl">
                        <div className="p-5 border-b border-white/[0.04] flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-black text-white uppercase tracking-widest">Kategori Dağılımı</span>
                        </div>
                        <div className="p-5 space-y-3">
                            {categoryBreakdown.length === 0 ? (
                                <p className="text-white/20 text-sm text-center py-8">Henüz veri yok</p>
                            ) : (
                                <>
                                    {/* Stacked bar */}
                                    <div className="flex h-3 rounded-full overflow-hidden mb-4">
                                        {categoryBreakdown.map((cat, i) => {
                                            const total = categoryBreakdown.reduce((s, c) => s + c.revenue, 0) || 1;
                                            return (
                                                <div
                                                    key={i}
                                                    style={{ width: `${(cat.revenue / total) * 100}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                                                    title={`${cat.name}: ${formatCurrency(cat.revenue)} TL`}
                                                />
                                            );
                                        })}
                                    </div>
                                    {categoryBreakdown.map((cat, i) => {
                                        const totalCat = categoryBreakdown.reduce((s, c) => s + c.revenue, 0) || 1;
                                        const pct = ((cat.revenue / totalCat) * 100).toFixed(1);
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-white font-bold truncate">{cat.name}</span>
                                                        <span className="text-[10px] text-white/30 font-mono ml-2">{pct}%</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-white/40 font-mono shrink-0">{formatCurrency(cat.revenue)} TL</span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl">
                        <div className="p-5 border-b border-white/[0.04] flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-black text-white uppercase tracking-widest">Sipariş Durumu</span>
                        </div>
                        <div className="p-5">
                            {totalStatusOrders > 0 && (
                                <div className="flex h-2.5 rounded-full overflow-hidden mb-4">
                                    {Object.entries(statusCounts).map(([status, count]) => (
                                        <div key={status} style={{ width: `${(count / totalStatusOrders) * 100}%`, backgroundColor: STATUS_MAP[status]?.color || "#555" }} />
                                    ))}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(statusCounts).map(([status, count]) => {
                                    const info = STATUS_MAP[status] || { label: status, color: "#555", bg: "rgba(85,85,85,0.1)" };
                                    return (
                                        <div key={status} className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: info.bg }}>
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                                            <span className="text-[11px] text-white/60 flex-1">{info.label}</span>
                                            <span className="text-xs font-black text-white">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ RECENT ORDERS TABLE ═══ */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl">
                <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-danger" />
                        <span className="text-sm font-black text-white uppercase tracking-widest">Son Siparişler</span>
                    </div>
                    <span className="text-[10px] text-white/20 font-mono">{recentOrders.length} kayıt</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.04]">
                                <th className="text-left text-[9px] text-white/25 uppercase tracking-[3px] font-bold px-5 py-3">No</th>
                                <th className="text-left text-[9px] text-white/25 uppercase tracking-[3px] font-bold px-4 py-3 hidden sm:table-cell">Müşteri</th>
                                <th className="text-left text-[9px] text-white/25 uppercase tracking-[3px] font-bold px-4 py-3">Durum</th>
                                <th className="text-left text-[9px] text-white/25 uppercase tracking-[3px] font-bold px-4 py-3 hidden md:table-cell">Tarih</th>
                                <th className="text-right text-[9px] text-white/25 uppercase tracking-[3px] font-bold px-5 py-3">Tutar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr><td colSpan={5} className="text-center text-white/20 text-sm py-16">Henüz sipariş yok</td></tr>
                            ) : (
                                recentOrders.map(order => {
                                    const s = STATUS_MAP[order.status] || { label: order.status, color: "#555", bg: "rgba(85,85,85,0.1)" };
                                    return (
                                        <tr key={order.id} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-bold text-danger uppercase">{order.id}</span>
                                            </td>
                                            <td className="px-4 py-3.5 hidden sm:table-cell">
                                                <div className="text-xs text-white/80 font-semibold">{order.customerName}</div>
                                                <div className="text-[10px] text-white/25 font-mono">{order.itemCount} ürün</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 hidden md:table-cell">
                                                <span className="text-xs text-white/30 font-mono">{new Date(order.date).toLocaleDateString("tr-TR")}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className="text-sm font-black text-white">{formatCurrency(order.total)} TL</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
