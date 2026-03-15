"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, Search, Mail, Phone, MapPin, ShoppingBag, Calendar, Eye, Download, ArrowUpDown, Users, TrendingUp, Trash2, X } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/admin/Skeleton";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
    memberSince: string;
}

type SortKey = "name" | "totalSpent" | "orderCount" | "memberSince";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("memberSince");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const PAGE_SIZE = 20;

    useEffect(() => {
        fetch("/api/customers")
            .then(res => res.json())
            .then((data) => {
                setCustomers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        switch (sortBy) {
            case "name": return dir * a.name.localeCompare(b.name);
            case "totalSpent": return dir * (a.totalSpent - b.totalSpent);
            case "orderCount": return dir * (a.orderCount - b.orderCount);
            case "memberSince": return dir * (new Date(a.memberSince).getTime() - new Date(b.memberSince).getTime());
            default: return 0;
        }
    });

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const paginatedCustomers = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset page on filter/sort change
    useEffect(() => { setCurrentPage(1); }, [search, sortBy, sortDir]);

    const handleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDir(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortDir("desc");
        }
    };

    const handleExport = useCallback(() => {
        const headers = ["İsim", "E-posta", "Telefon", "Adres", "Sipariş Sayısı", "Toplam Harcama", "Üyelik Tarihi"];
        const rows = sorted.map(c => [
            c.name, c.email, c.phone, c.address,
            c.orderCount, c.totalSpent.toFixed(2),
            new Date(c.memberSince).toLocaleDateString("tr-TR"),
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
        const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `musteriler_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [sorted]);

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === paginatedCustomers.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(paginatedCustomers.map(c => c.id)));
        }
    };

    const handleBulkDelete = async () => {
        setDeleting(true);
        try {
            await Promise.all(
                Array.from(selected).map(id =>
                    fetch(`/api/customers/${id}`, { method: "DELETE" })
                )
            );
            setCustomers(prev => prev.filter(c => !selected.has(c.id)));
            setSelected(new Set());
            setShowDeleteConfirm(false);
        } catch { /* */ }
        setDeleting(false);
    };

    // Stats
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    const avgSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    if (loading) {
        return <TableSkeleton rows={8} cols={5} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white">Müşteriler</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            Toplam {customers.length} müşteri
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-colors"
                >
                    <Download className="w-4 h-4" />
                    CSV İndir
                </button>
            </div>

            {/* Bulk Action Bar */}
            {selected.size > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-5 py-3 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
                        {selected.size} müşteri seçildi
                    </span>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelected(new Set())} className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                            <X className="w-3 h-3" /> Seçimi Temizle
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Seçilenleri Sil
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-white/10 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-white font-bold text-lg mb-3">Toplu Müşteri Silme</h3>
                        <p className="text-white/60 text-sm mb-2">
                            <strong className="text-white">{selected.size} müşteri</strong> silinecek.
                        </p>
                        <p className="text-red-400/70 text-xs mb-6">
                            Bu işlem geri alınamaz. Tüm ilişkili veriler (adresler, favoriler, notlar) de silinecektir.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2.5 bg-white/5 text-white/70 hover:text-white rounded-md text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={deleting}
                                className="px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-md text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-display text-white">{totalCustomers}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Toplam Müşteri</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-display text-white">₺{totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Toplam Harcama</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-display text-white">₺{avgSpent.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Ort. Harcama</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search + Sort */}
            <div className="bg-[#111] p-4 rounded-lg border border-white/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Müşteri ara (isim, email, telefon)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-md pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-white/30" />
                    {([
                        { key: "name" as SortKey, label: "İsim" },
                        { key: "totalSpent" as SortKey, label: "Harcama" },
                        { key: "orderCount" as SortKey, label: "Sipariş" },
                        { key: "memberSince" as SortKey, label: "Üyelik" },
                    ]).map(s => (
                        <button
                            key={s.key}
                            onClick={() => handleSort(s.key)}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
                                sortBy === s.key
                                    ? "bg-danger text-white"
                                    : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {s.label} {sortBy === s.key && (sortDir === "asc" ? "↑" : "↓")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customer Cards */}
            {sorted.length === 0 ? (
                <div className="text-center py-20 text-white/30">
                    <p className="text-lg font-medium">Müşteri bulunamadı</p>
                    <p className="text-sm mt-2">Kayıtlı müşteriler burada listelenecek.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Select All */}
                    <div className="md:col-span-2 lg:col-span-3 flex items-center gap-3 px-1">
                        <input
                            type="checkbox"
                            checked={paginatedCustomers.length > 0 && selected.size === paginatedCustomers.length}
                            onChange={toggleSelectAll}
                            className="accent-red-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Tümünü Seç</span>
                    </div>
                    {paginatedCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            className={`bg-[#111] border rounded-lg p-5 transition-colors ${
                                selected.has(customer.id)
                                    ? "border-red-500/40 bg-red-500/5"
                                    : "border-white/5 hover:border-white/15"
                            }`}
                        >
                            {/* Checkbox + Customer Name */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(customer.id)}
                                        onChange={() => toggleSelect(customer.id)}
                                        className="accent-red-500 w-4 h-4 mt-0.5 cursor-pointer"
                                    />
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{customer.name}</h3>
                                        <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Üyelik: {new Date(customer.memberSince).toLocaleDateString("tr-TR")}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono bg-white/5 text-white/60 px-2 py-1 rounded">
                                    {customer.orderCount} sipariş
                                </span>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 text-xs text-white/50">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    <span>{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    <span>{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span className="line-clamp-1">{customer.address}</span>
                                </div>
                            </div>

                            {/* Total Spent + Detail Link */}
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <ShoppingBag className="w-3 h-3" />
                                        Toplam Harcama
                                    </div>
                                    <span className="font-bold text-white text-sm">
                                        {customer.totalSpent.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                                    </span>
                                </div>
                                <Link
                                    href={`/admin/customers/${customer.id}`}
                                    className="flex items-center gap-1.5 text-white/40 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Detay
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sorted.length}
                pageSize={PAGE_SIZE}
            />
        </div>
    );
}
