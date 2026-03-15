"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle2, Copy, Search, Filter, Eye, AlertCircle, CreditCard, Loader2, ArrowUpDown, Calendar, CheckSquare, RotateCcw } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/admin/Skeleton";

interface OrderItem {
    productId: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
}

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    date: string;
    status: string;
    paymentStatus: string;
    total: number;
    trackingNumber: string;
    carrier: string;
    items: OrderItem[];
}

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    returned: "bg-orange-500/10 text-orange-500 border-orange-500/20"
};

const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    processing: "Hazırlanıyor",
    shipped: "Kargoya Verildi",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    returned: "İade Edildi"
};

const paymentStatusStyles: Record<string, string> = {
    paid: "text-green-500 bg-green-500/10 border-green-500/20",
    unpaid: "text-red-500 bg-red-500/10 border-red-500/20",
    refunded: "text-gray-400 bg-gray-500/10 border-gray-500/20"
};

const paymentStatusLabels: Record<string, string> = {
    paid: "Ödendi",
    unpaid: "Ödenmedi",
    refunded: "İade Edildi"
};

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
    const [bulkStatus, setBulkStatus] = useState("");
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const [bulkError, setBulkError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"orders" | "returns">("orders");
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [returnsLoading, setReturnsLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Siparişler yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const fetchReturns = useCallback(async () => {
        setReturnsLoading(true);
        try {
            const res = await fetch("/api/returns");
            const data = await res.json();
            setReturns(Array.isArray(data) ? data : []);
        } catch {
            console.error("İade talepleri yüklenemedi");
        } finally {
            setReturnsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "returns" && returns.length === 0) fetchReturns();
    }, [activeTab, returns.length, fetchReturns]);

    const handleReturnStatusUpdate = async (returnId: string, newStatus: string, adminNote?: string) => {
        try {
            await fetch("/api/returns", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnId, status: newStatus, adminNote }),
            });
            setReturns(returns.map(r => r.id === returnId ? { ...r, status: newStatus, admin_note: adminNote || r.admin_note } : r));
        } catch {
            console.error("İade durumu güncellenemedi");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        const orderDate = new Date(order.date);
        const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || orderDate <= new Date(dateTo + "T23:59:59");
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        switch (sortBy) {
            case "date": return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
            case "total": return dir * (a.total - b.total);
            case "status": return dir * a.status.localeCompare(b.status);
            default: return 0;
        }
    });

    const totalPages = Math.ceil(sortedOrders.length / PAGE_SIZE);
    const paginatedOrders = sortedOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset page on filter change
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, dateFrom, dateTo, sortBy, sortDir]);

    // Dynamic stats
    const pendingCount = orders.filter(o => o.status === "pending").length;
    const processingCount = orders.filter(o => o.status === "processing").length;
    const shippedCount = orders.filter(o => o.status === "shipped").length;
    const deliveredCount = orders.filter(o => o.status === "delivered").length;
    const deliveredTotal = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (err) {
            console.error("Durum güncellenemedi:", err);
        }
    };

    const handleTrackingUpdate = async (orderId: string, trackingNumber: string, carrier: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackingNumber, carrier: carrier || undefined }),
            });
            setOrders(orders.map(o => o.id === orderId ? { ...o, trackingNumber, carrier } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, trackingNumber, carrier });
            }
        } catch (err) {
            console.error("Takip no güncellenemedi:", err);
        }
    };

    const toggleOrderSelect = (id: string) => {
        setSelectedOrderIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.size === paginatedOrders.length) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(paginatedOrders.map(o => o.id)));
        }
    };

    const handleBulkStatusUpdate = async () => {
        if (!bulkStatus || selectedOrderIds.size === 0) return;
        setBulkUpdating(true);
        setBulkError(null);
        try {
            const results = await Promise.all(
                Array.from(selectedOrderIds).map(id =>
                    fetch(`/api/orders/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: bulkStatus }),
                    }).then(r => ({ id, ok: r.ok }))
                )
            );
            const failed = results.filter(r => !r.ok);
            if (failed.length > 0) {
                setBulkError(`${failed.length} sipariş güncellenemedi`);
                setTimeout(() => setBulkError(null), 5000);
            }
            setOrders(orders.map(o =>
                selectedOrderIds.has(o.id) ? { ...o, status: bulkStatus } : o
            ));
            setSelectedOrderIds(new Set());
            setBulkStatus("");
        } catch {
            setBulkError("Toplu güncelleme sırasında bir hata oluştu");
            setTimeout(() => setBulkError(null), 5000);
        } finally {
            setBulkUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-xl animate-pulse">
                            <div className="h-4 w-24 bg-white/[0.06] rounded mb-4" />
                            <div className="h-8 w-16 bg-white/[0.06] rounded" />
                        </div>
                    ))}
                </div>
                <TableSkeleton rows={8} cols={7} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-widest text-white">Siparişler</h1>
                    <p className="text-white/50 text-sm mt-1">Gelen siparişleri, ödeme durumlarını ve kargo süreçlerini yönet.</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-xl border border-white/5 w-fit">
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "orders" ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                    <Package className="w-3.5 h-3.5 inline mr-2" />Siparişler ({orders.length})
                </button>
                <button
                    onClick={() => setActiveTab("returns")}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "returns" ? "bg-orange-500 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                    <RotateCcw className="w-3.5 h-3.5 inline mr-2" />İade Talepleri
                    {returns.filter(r => r.status === "pending").length > 0 && (
                        <span className="ml-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {returns.filter(r => r.status === "pending").length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === "returns" ? (
                <ReturnsTab returns={returns} loading={returnsLoading} onStatusUpdate={handleReturnStatusUpdate} />
            ) : (
            <>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#111111] border border-white/5 p-6 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/50 mb-4">
                        <span className="text-xs font-mono uppercase tracking-widest">Bekleyen Sipariş</span>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                        <span className="text-3xl font-display font-black text-white">{pendingCount}</span>
                        <span className="text-xs text-white/40 ml-2">Kargolanmayı bekliyor</span>
                    </div>
                </div>
                <div className="bg-[#111111] border border-white/5 p-6 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/50 mb-4">
                        <span className="text-xs font-mono uppercase tracking-widest">Hazırlanan</span>
                        <Package className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <span className="text-3xl font-display font-black text-white">{processingCount}</span>
                    </div>
                </div>
                <div className="bg-[#111111] border border-white/5 p-6 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/50 mb-4">
                        <span className="text-xs font-mono uppercase tracking-widest">Kargodaki</span>
                        <Truck className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                        <span className="text-3xl font-display font-black text-white">{shippedCount}</span>
                    </div>
                </div>
                <div className="bg-[#111111] border border-white/5 p-6 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/50 mb-4">
                        <span className="text-xs font-mono uppercase tracking-widest">Tamamlanan</span>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <span className="text-3xl font-display font-black text-white">{deliveredCount}</span>
                        <span className="text-xs text-green-500/80 ml-2">+₺{deliveredTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#111111] p-4 rounded-xl border border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Sipariş No, Müşteri Adı..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-white/40" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full md:w-auto bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="pending">Bekliyor (Yeni)</option>
                        <option value="processing">Hazırlanıyor</option>
                        <option value="shipped">Kargoya Verildi</option>
                        <option value="delivered">Teslim Edildi</option>
                        <option value="cancelled">İptal Edildi</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Calendar className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                    <span className="text-white/30 text-xs">—</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <ArrowUpDown className="w-4 h-4 text-white/40 shrink-0" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "date" | "total" | "status")}
                        className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    >
                        <option value="date">Tarihe Göre</option>
                        <option value="total">Tutara Göre</option>
                        <option value="status">Duruma Göre</option>
                    </select>
                    <button
                        onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
                        className="px-3 py-2 bg-black border border-white/10 rounded-lg text-xs font-mono text-white/60 hover:text-white transition-colors"
                    >
                        {sortDir === "asc" ? "↑ Artan" : "↓ Azalan"}
                    </button>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedOrderIds.size > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-400 text-sm font-bold">{selectedOrderIds.size} sipariş seçili</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {bulkError && (
                            <span className="text-red-400 text-xs font-bold">{bulkError}</span>
                        )}
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                        >
                            <option value="">Durum Seçin</option>
                            <option value="pending">Bekliyor</option>
                            <option value="processing">Hazırlanıyor</option>
                            <option value="shipped">Kargoya Verildi</option>
                            <option value="delivered">Teslim Edildi</option>
                            <option value="cancelled">İptal Edildi</option>
                        </select>
                        <button
                            onClick={handleBulkStatusUpdate}
                            disabled={!bulkStatus || bulkUpdating}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {bulkUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Uygula
                        </button>
                        <button
                            onClick={() => setSelectedOrderIds(new Set())}
                            className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="bg-[#0a0a0a] text-xs uppercase tracking-widest text-white/40 font-mono">
                            <tr>
                                <th className="px-3 py-4 font-medium border-b border-white/5 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrderIds.size === paginatedOrders.length && paginatedOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 accent-blue-500 bg-transparent border-white/20 rounded"
                                    />
                                </th>
                                <th className="px-6 py-4 font-medium border-b border-white/5">Sipariş No</th>
                                <th className="px-6 py-4 font-medium border-b border-white/5">Tarih</th>
                                <th className="px-6 py-4 font-medium border-b border-white/5">Müşteri</th>
                                <th className="px-6 py-4 font-medium border-b border-white/5 text-center">Ödeme</th>
                                <th className="px-6 py-4 font-medium border-b border-white/5 text-center">Durum</th>
                                <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Tutar</th>
                                <th className="px-6 py-4 font-medium border-b border-white/5 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`hover:bg-white/[0.02] transition-colors group cursor-pointer ${selectedOrderIds.has(order.id) ? 'bg-blue-500/5' : ''}`}
                                    >
                                        <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrderIds.has(order.id)}
                                                onChange={() => toggleOrderSelect(order.id)}
                                                className="w-4 h-4 accent-blue-500 bg-transparent border-white/20 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-white whitespace-nowrap">
                                            {order.id}
                                            <button className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white" title="Kopyala">
                                                <Copy className="w-3 h-3 inline" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-white/60">
                                            {new Date(order.date).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{order.customerName}</span>
                                                <span className="text-xs text-white/40">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${paymentStatusStyles[order.paymentStatus]}`}>
                                                {order.paymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3" /> :
                                                    order.paymentStatus === 'unpaid' ? <AlertCircle className="w-3 h-3" /> :
                                                        <CreditCard className="w-3 h-3" />}
                                                {paymentStatusLabels[order.paymentStatus]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-white text-right whitespace-nowrap">
                                            ₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            <div className="text-[10px] text-white/40 font-sans mt-0.5">{order.items.length} Ürün</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Detay
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                                        <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                        <p>Sipariş bulunamadı.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={sortedOrders.length}
                    pageSize={PAGE_SIZE}
                />
            </div>

            {/* Note about Payment & Cargo Gateway */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Gateway Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex gap-4">
                        <div className="shrink-0 mt-1">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-400 text-sm tracking-widest uppercase mb-1">Ödeme Altyapısı (Stripe/Iyzico)</h4>
                            <p className="text-white/70 text-xs leading-relaxed mb-4 text-balance">
                                Sistem şu anda sanal/mock verilerle çalışmaktadır. Canlıya geçerken API anahtarlarını (Secret Key vb.) güvenliğiniz için panel arayüzüne <b>değil</b>, sunucudaki <code>.env</code> dosyasına yazmanız en iyi güvenlik uygulamasıdır. paneldeki &quot;Ayarlar&quot; sekmesine bir durum sayfası eklenebilir.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cargo Integration Info */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex gap-4">
                        <div className="shrink-0 mt-1">
                            <Truck className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-purple-400 text-sm tracking-widest uppercase mb-1">Kargo API Entegrasyonları (Yakında)</h4>
                            <p className="text-white/70 text-xs leading-relaxed mb-4 text-balance">
                                Gelecekte sisteme <b>MNG, Yurtiçi veya Aras Kargo</b> API entegrasyonu sağlandığında; siz siparişin durumunu &quot;Kargoya Verildi&quot; seçtiğiniz an otomatik olarak kargo firmasına barkod/takip kodu talebi iletilecek ve müşteri paneline düşecektir. Bu sistem de <code>.env</code> üzerinden çalışacaktır.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {selectedOrder && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setSelectedOrder(null)}
                    />

                    {/* Panel */}
                    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#111111] border-l border-white/10 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-full duration-300 font-sans">
                        <div className="p-6 md:p-8 space-y-8">

                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">{selectedOrder.id}</h2>
                                    <p className="text-white/50 text-xs mt-1 font-mono">{new Date(selectedOrder.date).toLocaleString("tr-TR")}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            {/* Status controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-mono">Sipariş Durumu</label>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                                        className={`w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 ${statusStyles[selectedOrder.status] || ""}`}
                                    >
                                        <option value="pending" className="bg-[#111] text-yellow-500">Bekliyor</option>
                                        <option value="processing" className="bg-[#111] text-blue-500">Hazırlanıyor</option>
                                        <option value="shipped" className="bg-[#111] text-purple-500">Kargoya Verildi</option>
                                        <option value="delivered" className="bg-[#111] text-green-500">Teslim Edildi</option>
                                        <option value="cancelled" className="bg-[#111] text-red-500">İptal Edildi</option>
                                        <option value="returned" className="bg-[#111] text-orange-500">İade Edildi</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-mono">Ödeme Durumu</label>
                                    <div className={`w-full rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-widest border ${paymentStatusStyles[selectedOrder.paymentStatus] || ""} bg-transparent cursor-not-allowed text-center`}>
                                        {paymentStatusLabels[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}
                                    </div>
                                </div>
                            </div>

                            {/* Kargo Takip No & Şirket */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-mono">Kargo Takip Numarası</label>
                                    <input
                                        type="text"
                                        value={selectedOrder.trackingNumber || ""}
                                        onChange={(e) => setSelectedOrder({...selectedOrder, trackingNumber: e.target.value})}
                                        placeholder="Örn: YK-1234567890"
                                        className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-mono">Kargo Şirketi</label>
                                    <select
                                        value={selectedOrder.carrier || ""}
                                        onChange={(e) => setSelectedOrder({...selectedOrder, carrier: e.target.value})}
                                        className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                                    >
                                        <option value="" style={{background:'#111'}}>Seçiniz</option>
                                        <option value="Yurtiçi Kargo" style={{background:'#111'}}>Yurtiçi Kargo</option>
                                        <option value="Aras Kargo" style={{background:'#111'}}>Aras Kargo</option>
                                        <option value="MNG Kargo" style={{background:'#111'}}>MNG Kargo</option>
                                        <option value="PTT Kargo" style={{background:'#111'}}>PTT Kargo</option>
                                        <option value="Sürat Kargo" style={{background:'#111'}}>Sürat Kargo</option>
                                        <option value="Trendyol Express" style={{background:'#111'}}>Trendyol Express</option>
                                        <option value="HepsiJet" style={{background:'#111'}}>HepsiJet</option>
                                        <option value="Diğer" style={{background:'#111'}}>Diğer</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => handleTrackingUpdate(selectedOrder.id, selectedOrder.trackingNumber, selectedOrder.carrier)}
                                    className="w-full px-4 py-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-purple-500/30 transition-colors"
                                >
                                    Kargo Bilgilerini Kaydet
                                </button>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 space-y-4">
                                <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Müşteri Bilgileri</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">İsim Soyisim</p>
                                        <p className="text-sm text-white font-medium mt-1">{selectedOrder.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Telefon</p>
                                        <p className="text-sm text-white font-mono mt-1">{selectedOrder.customerPhone}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">E-posta</p>
                                        <p className="text-sm text-white mt-1">{selectedOrder.customerEmail}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Adres</p>
                                        <p className="text-sm text-white mt-1">{selectedOrder.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 border-b border-white/5 pb-2 flex justify-between">
                                    <span>Sipariş İçeriği</span>
                                    <span>{selectedOrder.items.length} Ürün</span>
                                </h3>

                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 bg-[#0a0a0a] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                                            <div className="w-16 h-20 bg-[#111111] rounded-lg overflow-hidden shrink-0 border border-white/5">
                                                <div
                                                    className="w-full h-full bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${item.image})` }}
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-bold text-white leading-tight pr-4">{item.name}</h4>
                                                    <span className="text-sm font-mono text-white/80 shrink-0">₺{item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 mt-1">
                                                    <span className="flex items-center gap-1">Beden: <b className="text-white">{item.size}</b></span>
                                                    <span className="flex items-center gap-1">Renk: <b className="text-white">{item.color}</b></span>
                                                    <span className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/10 pt-4 flex justify-between items-center mt-6">
                                    <span className="text-white/60 font-medium">Toplam Tutar</span>
                                    <span className="text-2xl font-mono font-bold text-white">₺{selectedOrder.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <button className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-200 transition-colors mt-8">
                                Fatura Yazdır
                            </button>
                        </div>
                    </div>
                </>
            )}

            </>)}

        </div>
    );
}

// ─── TYPES ─── //
interface ReturnItem {
    id: string;
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
}

interface ReturnRequest {
    id: string;
    order_id: string;
    customer_id: string;
    reason: string;
    status: string;
    admin_note: string | null;
    refund_amount: number;
    created_at: string;
    updated_at: string;
    return_items: ReturnItem[];
    customer: { name: string; email: string; phone: string } | null;
    order: { order_number: string; total: number; status: string } | null;
}

// ─── RETURNS TAB ─── //
function ReturnsTab({ returns, loading, onStatusUpdate }: {
    returns: ReturnRequest[];
    loading: boolean;
    onStatusUpdate: (returnId: string, status: string, adminNote?: string) => Promise<void>;
}) {
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const returnStatusStyles: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        rejected: "bg-red-500/10 text-red-500 border-red-500/20",
        completed: "bg-green-500/10 text-green-500 border-green-500/20",
    };

    const returnStatusLabels: Record<string, string> = {
        pending: "Bekliyor",
        approved: "Onaylandı",
        rejected: "Reddedildi",
        completed: "Tamamlandı",
    };

    const handleAction = async (returnId: string, status: string) => {
        setUpdatingId(returnId);
        await onStatusUpdate(returnId, status, adminNotes[returnId]);
        setUpdatingId(null);
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>;

    if (returns.length === 0) {
        return (
            <div className="bg-[#111111] border border-white/5 rounded-xl p-16 text-center">
                <RotateCcw className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Henüz iade talebi yok</p>
            </div>
        );
    }

    // İstatistikler
    const pendingCount = returns.filter(r => r.status === "pending").length;
    const approvedCount = returns.filter(r => r.status === "approved").length;
    const totalRefund = returns.filter(r => ["approved", "completed"].includes(r.status)).reduce((sum, r) => sum + Number(r.refund_amount), 0);

    return (
        <div className="space-y-6">
            {/* İade İstatistikleri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111111] border border-white/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between text-white/50 mb-3">
                        <span className="text-xs font-mono uppercase tracking-widest">Bekleyen İade</span>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                    <span className="text-3xl font-display font-black text-yellow-500">{pendingCount}</span>
                </div>
                <div className="bg-[#111111] border border-white/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between text-white/50 mb-3">
                        <span className="text-xs font-mono uppercase tracking-widest">Onaylanan</span>
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-3xl font-display font-black text-blue-500">{approvedCount}</span>
                </div>
                <div className="bg-[#111111] border border-white/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between text-white/50 mb-3">
                        <span className="text-xs font-mono uppercase tracking-widest">Toplam İade Tutarı</span>
                        <CreditCard className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-2xl font-display font-black text-orange-500">₺{totalRefund.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* İade Listesi */}
            <div className="space-y-4">
                {returns.map(ret => (
                    <div key={ret.id} className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
                        {/* İade Header */}
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                    <span className="font-mono font-bold text-white text-sm">#{ret.order?.order_number || "—"}</span>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${returnStatusStyles[ret.status] || ""}`}>
                                        {returnStatusLabels[ret.status] || ret.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                                    <span>Müşteri: <b className="text-white/80">{ret.customer?.name || "—"}</b></span>
                                    <span>{ret.customer?.email}</span>
                                    <span>{new Date(ret.created_at).toLocaleDateString("tr-TR")}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-display font-bold text-orange-500">₺{Number(ret.refund_amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">İade Tutarı</p>
                            </div>
                        </div>

                        {/* İade Nedeni */}
                        <div className="px-6 py-4 border-b border-white/5">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">İade Nedeni</p>
                            <p className="text-sm text-white/70">{ret.reason}</p>
                        </div>

                        {/* İade Ürünleri */}
                        <div className="px-6 py-4 border-b border-white/5">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">İade Ürünleri</p>
                            <div className="space-y-2">
                                {(ret.return_items || []).map(item => (
                                    <div key={item.id} className="flex items-center gap-3 py-1">
                                        {item.image && (
                                            <div className="w-10 h-12 bg-[#0a0a0a] rounded overflow-hidden flex-shrink-0">
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium">{item.product_name}</p>
                                            <p className="text-xs text-white/40">
                                                {item.size && `Beden: ${item.size}`}
                                                {item.size && item.color && " · "}
                                                {item.color && `Renk: ${item.color}`}
                                                {" · "}x{item.quantity}
                                            </p>
                                        </div>
                                        <span className="text-sm font-mono text-white/60">₺{Number(item.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin İşlemleri */}
                        {ret.status === "pending" && (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">Admin Notu (İsteğe Bağlı)</label>
                                    <textarea
                                        value={adminNotes[ret.id] || ""}
                                        onChange={(e) => setAdminNotes({ ...adminNotes, [ret.id]: e.target.value })}
                                        placeholder="İade hakkında not ekleyin..."
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white resize-none h-16 focus:outline-none focus:border-white/30 placeholder:text-white/20"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(ret.id, "approved")}
                                        disabled={updatingId === ret.id}
                                        className="flex-1 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {updatingId === ret.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                        Onayla (Stok Geri Ekle)
                                    </button>
                                    <button
                                        onClick={() => handleAction(ret.id, "rejected")}
                                        disabled={updatingId === ret.id}
                                        className="flex-1 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Reddet
                                    </button>
                                </div>
                            </div>
                        )}

                        {ret.status === "approved" && (
                            <div className="p-6">
                                <button
                                    onClick={() => handleAction(ret.id, "completed")}
                                    disabled={updatingId === ret.id}
                                    className="w-full py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {updatingId === ret.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    İade Tamamla (Sipariş Durumunu Güncelle)
                                </button>
                            </div>
                        )}

                        {/* Admin Notu Gösterimi */}
                        {ret.admin_note && ret.status !== "pending" && (
                            <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">Admin Notu</p>
                                <p className="text-xs text-white/50 mt-1">{ret.admin_note}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
