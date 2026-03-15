"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Search, AlertCircle, Percent, DollarSign } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { TableSkeleton } from "@/components/admin/Skeleton";

interface Coupon {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_order_amount: number;
    max_uses: number | null;
    used_count: number;
    expiry_date: string | null;
    is_active: boolean;
    created_at: string;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    // New coupon form
    const [form, setForm] = useState({
        code: "",
        discountType: "percentage" as "percentage" | "fixed",
        discountValue: "",
        minOrderAmount: "",
        maxUses: "",
        expiryDate: "",
    });

    const fetchCoupons = useCallback(async () => {
        try {
            const res = await fetch("/api/coupons");
            const data = await res.json();
            if (Array.isArray(data)) setCoupons(data);
        } catch (err) {
            console.error("Kuponlar yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.code || !form.discountValue) return;
        setSaving(true);

        try {
            const res = await fetch("/api/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: form.code,
                    discountType: form.discountType,
                    discountValue: form.discountValue,
                    minOrderAmount: form.minOrderAmount || 0,
                    maxUses: form.maxUses || null,
                    expiryDate: form.expiryDate || null,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Kupon oluşturulamadı");
                return;
            }

            setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiryDate: "" });
            setShowForm(false);
            fetchCoupons();
        } catch (err) {
            console.error("Oluşturma hatası:", err);
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (coupon: Coupon) => {
        try {
            await fetch(`/api/coupons/${coupon.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !coupon.is_active }),
            });
            setCoupons(coupons.map(c =>
                c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
            ));
        } catch (err) {
            console.error("Toggle hatası:", err);
        }
    };

    const deleteCoupon = async (id: string) => {
        setDeleteTarget(id);
    };

    const confirmDeleteCoupon = async () => {
        if (!deleteTarget) return;
        try {
            await fetch(`/api/coupons/${deleteTarget}`, { method: "DELETE" });
            setCoupons(coupons.filter(c => c.id !== deleteTarget));
        } catch (err) {
            console.error("Silme hatası:", err);
        }
        setDeleteTarget(null);
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCoupons.length / PAGE_SIZE);
    const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset page on search change
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    if (loading) {
        return <TableSkeleton rows={6} cols={6} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-4xl uppercase tracking-tighter text-white mb-1">Kuponlar</h1>
                    <p className="text-white/50 text-sm font-mono uppercase tracking-widest">
                        {coupons.length} Kupon Kayıtlı
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-danger hover:bg-red-600 text-white px-5 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Kupon
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreate} className="bg-[#111111] border border-white/10 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-danger" />
                        Yeni Kupon Oluştur
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Kupon Kodu */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                Kupon Kodu *
                            </label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="YENIUYE20"
                                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-danger font-mono uppercase"
                                required
                            />
                        </div>

                        {/* İndirim Tipi */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                İndirim Tipi *
                            </label>
                            <select
                                value={form.discountType}
                                onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })}
                                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-danger"
                            >
                                <option value="percentage">Yüzde (%)</option>
                                <option value="fixed">Sabit Tutar (₺)</option>
                            </select>
                        </div>

                        {/* İndirim Değeri */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                İndirim Değeri *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={form.discountValue}
                                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                    placeholder={form.discountType === "percentage" ? "20" : "100"}
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-danger pr-10"
                                    required
                                    min="0"
                                    max={form.discountType === "percentage" ? "100" : undefined}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">
                                    {form.discountType === "percentage" ? "%" : "₺"}
                                </span>
                            </div>
                        </div>

                        {/* Minimum Sipariş Tutarı */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                Min. Sipariş Tutarı (₺)
                            </label>
                            <input
                                type="number"
                                value={form.minOrderAmount}
                                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                                placeholder="0"
                                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-danger"
                                min="0"
                            />
                        </div>

                        {/* Maksimum Kullanım */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                Maks. Kullanım Sayısı
                            </label>
                            <input
                                type="number"
                                value={form.maxUses}
                                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                                placeholder="Sınırsız"
                                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-danger"
                                min="1"
                            />
                        </div>

                        {/* Son Kullanma Tarihi */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                Son Kullanma Tarihi
                            </label>
                            <input
                                type="date"
                                value={form.expiryDate}
                                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-danger"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-danger hover:bg-red-600 text-white px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Oluştur
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border border-white/10 rounded-md text-white/60 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
                        >
                            İptal
                        </button>
                    </div>
                </form>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kupon kodu ara..."
                    className="w-full bg-[#111111] border border-white/10 rounded-md pl-11 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-danger font-mono uppercase text-sm"
                />
            </div>

            {/* Empty State */}
            {filteredCoupons.length === 0 && (
                <div className="text-center py-16 text-white/30">
                    <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-display text-xl uppercase tracking-widest">
                        {searchTerm ? "Sonuç bulunamadı" : "Henüz kupon eklenmedi"}
                    </p>
                    <p className="text-sm mt-2">
                        {searchTerm ? "Farklı bir arama deneyin" : "\"Yeni Kupon\" butonuyla ilk kuponunuzu oluşturun"}
                    </p>
                </div>
            )}

            {/* Coupons Table */}
            {filteredCoupons.length > 0 && (
                <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-widest text-white/40">
                                <th className="text-left px-6 py-4">Kod</th>
                                <th className="text-left px-6 py-4">İndirim</th>
                                <th className="text-left px-6 py-4 hidden md:table-cell">Min. Tutar</th>
                                <th className="text-left px-6 py-4 hidden md:table-cell">Kullanım</th>
                                <th className="text-left px-6 py-4 hidden lg:table-cell">Son Tarih</th>
                                <th className="text-center px-6 py-4">Durum</th>
                                <th className="text-right px-6 py-4">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCoupons.map((coupon) => {
                                const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
                                const isMaxedOut = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;

                                return (
                                    <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        {/* Code */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-white tracking-wider bg-white/5 px-3 py-1 rounded">
                                                {coupon.code}
                                            </span>
                                        </td>

                                        {/* Discount */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {coupon.discount_type === "percentage" ? (
                                                    <Percent className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <DollarSign className="w-4 h-4 text-blue-500" />
                                                )}
                                                <span className="text-white font-bold">
                                                    {coupon.discount_type === "percentage"
                                                        ? `%${coupon.discount_value}`
                                                        : `₺${Number(coupon.discount_value).toLocaleString("tr-TR")}`
                                                    }
                                                </span>
                                            </div>
                                        </td>

                                        {/* Min Order */}
                                        <td className="px-6 py-4 hidden md:table-cell text-white/60 text-sm">
                                            {coupon.min_order_amount > 0
                                                ? `₺${Number(coupon.min_order_amount).toLocaleString("tr-TR")}`
                                                : "—"
                                            }
                                        </td>

                                        {/* Usage */}
                                        <td className="px-6 py-4 hidden md:table-cell text-sm">
                                            <span className={`font-mono ${isMaxedOut ? "text-danger" : "text-white/60"}`}>
                                                {coupon.used_count} / {coupon.max_uses ?? "∞"}
                                            </span>
                                        </td>

                                        {/* Expiry */}
                                        <td className="px-6 py-4 hidden lg:table-cell text-sm">
                                            {coupon.expiry_date ? (
                                                <span className={`font-mono ${isExpired ? "text-danger" : "text-white/60"}`}>
                                                    {new Date(coupon.expiry_date).toLocaleDateString("tr-TR")}
                                                    {isExpired && <AlertCircle className="w-3 h-3 inline ml-1" />}
                                                </span>
                                            ) : (
                                                <span className="text-white/30">Süresiz</span>
                                            )}
                                        </td>

                                        {/* Status Toggle */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleActive(coupon)}
                                                className="transition-colors"
                                                title={coupon.is_active ? "Pasif yap" : "Aktif yap"}
                                            >
                                                {coupon.is_active ? (
                                                    <ToggleRight className="w-8 h-8 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="w-8 h-8 text-white/20" />
                                                )}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteCoupon(coupon.id)}
                                                className="text-white/30 hover:text-danger transition-colors p-2"
                                                title="Kuponu sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCoupons.length}
                pageSize={PAGE_SIZE}
            />

            {/* Delete Confirm Modal */}
            <ConfirmModal
                open={!!deleteTarget}
                title="Kupon Silme"
                message="Bu kuponu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                onConfirm={confirmDeleteCoupon}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
