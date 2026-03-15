"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Loader2, User, Mail, Phone, MapPin, ShoppingBag,
    Calendar, Heart, Package, AlertCircle, Eye, Star, MessageSquare,
    Trash2, Send, BarChart3
} from "lucide-react";

interface CustomerAddress {
    id: string;
    label: string;
    fullName: string;
    line1: string;
    district: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
}

interface CustomerOrder {
    id: string;
    total: number;
    status: string;
    date: string;
    itemCount: number;
}

interface CustomerFavorite {
    productId: string;
    name: string;
    slug: string;
    price: number;
}

interface CustomerDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    memberSince: string;
    orderCount: number;
    totalSpent: number;
    addresses: CustomerAddress[];
    orders: CustomerOrder[];
    favorites: CustomerFavorite[];
}

interface CustomerNote {
    id: string;
    customer_id: string;
    note: string;
    author: string;
    created_at: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "text-yellow-500 bg-yellow-500/10" },
    processing: { label: "Hazırlanıyor", color: "text-blue-500 bg-blue-500/10" },
    shipped: { label: "Kargoda", color: "text-purple-500 bg-purple-500/10" },
    delivered: { label: "Teslim", color: "text-green-500 bg-green-500/10" },
    cancelled: { label: "İptal", color: "text-red-500 bg-red-500/10" },
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    // Notes
    const [notes, setNotes] = useState<CustomerNote[]>([]);
    const [newNote, setNewNote] = useState("");
    const [savingNote, setSavingNote] = useState(false);
    // Delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch(`/api/customers/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setCustomer(null);
                else setCustomer(data);
            })
            .catch(() => setCustomer(null))
            .finally(() => setLoading(false));
    }, [id]);

    // Fetch notes
    useEffect(() => {
        fetch(`/api/customer-notes?customer_id=${id}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setNotes(data); })
            .catch(console.error);
    }, [id]);

    const addNote = async () => {
        if (!newNote.trim()) return;
        setSavingNote(true);
        try {
            const res = await fetch("/api/customer-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customer_id: id, note: newNote, author: "Admin" }),
            });
            if (res.ok) {
                const note = await res.json();
                setNotes(prev => [note, ...prev]);
                setNewNote("");
            }
        } catch (err) {
            console.error("Not ekleme hatası:", err);
        } finally {
            setSavingNote(false);
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            await fetch(`/api/customer-notes?id=${noteId}`, { method: "DELETE" });
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (err) {
            console.error("Not silme hatası:", err);
        }
    };

    // Compute monthly spending from orders (mini chart data)
    const getMonthlySpending = (orders: CustomerOrder[]) => {
        const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        const now = new Date();
        const months: { label: string; value: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            const total = orders
                .filter(o => {
                    const od = new Date(o.date);
                    return od >= monthStart && od <= monthEnd;
                })
                .reduce((sum, o) => sum + o.total, 0);

            months.push({ label: monthNames[d.getMonth()], value: total });
        }
        return months;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="space-y-4">
                <Link href="/admin/customers" className="flex items-center gap-2 text-white/50 hover:text-white text-sm">
                    <ArrowLeft className="w-4 h-4" /> Müşterilere Dön
                </Link>
                <div className="text-center py-16 text-white/30">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-display text-xl uppercase tracking-widest">Müşteri Bulunamadı</p>
                </div>
            </div>
        );
    }

    const monthlySpending = getMonthlySpending(customer.orders);
    const maxSpending = Math.max(...monthlySpending.map(m => m.value), 1);
    const avgOrderValue = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/customers" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">{customer.name}</h1>
                    <p className="text-white/50 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Üyelik: {new Date(customer.memberSince).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <Trash2 className="w-4 h-4" />
                    Müşteriyi Sil
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-white/10 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-white font-bold text-lg mb-3">Müşteriyi Sil</h3>
                        <p className="text-white/60 text-sm mb-2">
                            <strong className="text-white">{customer.name}</strong> adlı müşteriyi silmek istediğinize emin misiniz?
                        </p>
                        <p className="text-red-400/70 text-xs mb-6">
                            Bu işlem geri alınamaz. Müşterinin adresleri, favorileri ve notları da silinecektir.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2.5 bg-white/5 text-white/70 hover:text-white rounded-md text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={async () => {
                                    setDeleting(true);
                                    try {
                                        const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
                                        if (res.ok) {
                                            router.push("/admin/customers");
                                        }
                                    } catch { /* */ }
                                    setDeleting(false);
                                }}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Profile + Stats + Mini Chart + Addresses + Notes */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg p-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-danger/20 to-purple-500/20 flex items-center justify-center mx-auto">
                            <User className="w-8 h-8 text-white/50" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-white font-bold text-lg">{customer.name}</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-white/60">
                                <Mail className="w-4 h-4 text-white/30" />
                                {customer.email}
                            </div>
                            <div className="flex items-center gap-3 text-white/60">
                                <Phone className="w-4 h-4 text-white/30" />
                                {customer.phone || "—"}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#111111] border border-white/10 rounded-lg p-3 text-center">
                            <ShoppingBag className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
                            <p className="text-lg font-display text-white">{customer.orderCount}</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Sipariş</p>
                        </div>
                        <div className="bg-[#111111] border border-white/10 rounded-lg p-3 text-center">
                            <Package className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                            <p className="text-lg font-display text-white">
                                ₺{customer.totalSpent.toLocaleString("tr-TR")}
                            </p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Harcama</p>
                        </div>
                        <div className="bg-[#111111] border border-white/10 rounded-lg p-3 text-center">
                            <BarChart3 className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                            <p className="text-lg font-display text-white">
                                ₺{avgOrderValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Ort. Sipariş</p>
                        </div>
                    </div>

                    {/* Mini Spending Chart */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-5 py-3">
                            <h3 className="font-bold text-xs uppercase tracking-widest text-white/60 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> Aylık Harcama
                            </h3>
                        </div>
                        <div className="px-5 py-4">
                            <div className="flex items-end gap-2 h-[80px]">
                                {monthlySpending.map((m, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className="w-full bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500/40 transition-colors relative group"
                                            style={{ height: `${Math.max((m.value / maxSpending) * 100, 4)}%` }}
                                        >
                                            {m.value > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    ₺{m.value.toLocaleString("tr-TR")}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-white/30 font-mono">{m.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-500" /> Adresler ({customer.addresses.length})
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {customer.addresses.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-4 font-mono">Kayıtlı adres yok</p>
                            ) : (
                                customer.addresses.map(addr => (
                                    <div key={addr.id} className="bg-white/[0.02] rounded-md p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-white uppercase tracking-widest">{addr.label}</span>
                                            {addr.isDefault && (
                                                <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5" /> Varsayılan
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/60 text-xs">{addr.fullName}</p>
                                        <p className="text-white/50 text-xs">{addr.line1}, {addr.district}/{addr.city}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Customer Notes */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-yellow-500" /> Notlar ({notes.length})
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* Add note form */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
                                    placeholder="Not ekle…"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                                />
                                <button
                                    onClick={addNote}
                                    disabled={savingNote || !newNote.trim()}
                                    className="px-3 py-2 bg-yellow-500/10 text-yellow-500 rounded-md hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                                >
                                    {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                </button>
                            </div>

                            {/* Notes list */}
                            {notes.length === 0 ? (
                                <p className="text-white/30 text-xs text-center py-3 font-mono">Henüz not yok</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {notes.map(note => (
                                        <div key={note.id} className="bg-white/[0.02] rounded-md p-3 group">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-white/70 text-xs leading-relaxed">{note.note}</p>
                                                <button
                                                    onClick={() => deleteNote(note.id)}
                                                    className="text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-white/30 font-mono">{note.author}</span>
                                                <span className="text-[10px] text-white/20">•</span>
                                                <span className="text-[10px] text-white/20 font-mono">
                                                    {new Date(note.created_at).toLocaleDateString("tr-TR")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Orders + Favorites */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Orders */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-cyan-500" /> Sipariş Geçmişi ({customer.orders.length})
                            </h3>
                        </div>
                        {customer.orders.length === 0 ? (
                            <div className="p-6 text-center text-white/30 font-mono text-sm">Henüz sipariş yok</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/5">
                                        <th className="text-left px-6 py-3 font-normal">Sipariş No</th>
                                        <th className="text-left px-6 py-3 font-normal">Tarih</th>
                                        <th className="text-left px-6 py-3 font-normal">Durum</th>
                                        <th className="text-right px-6 py-3 font-normal">Tutar</th>
                                        <th className="text-right px-6 py-3 font-normal"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {customer.orders.map(order => {
                                        const st = statusMap[order.status] || statusMap.pending;
                                        return (
                                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-3 font-mono text-xs text-white">#{order.id}</td>
                                                <td className="px-6 py-3 text-xs text-white/50">
                                                    {order.date ? new Date(order.date).toLocaleDateString("tr-TR") : "—"}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${st.color}`}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-sm text-white font-bold">
                                                    ₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <Link href={`/admin/orders/${order.id}`} className="text-white/30 hover:text-white transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Favorites */}
                    {customer.favorites.length > 0 && (
                        <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                            <div className="border-b border-white/5 px-6 py-4">
                                <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-danger" /> Favori Ürünler ({customer.favorites.length})
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {customer.favorites.map(fav => (
                                    <Link
                                        key={fav.productId}
                                        href={`/product/${fav.slug}`}
                                        className="flex items-center justify-between px-4 py-3 bg-white/[0.02] rounded-md hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-white text-sm truncate">{fav.name}</span>
                                        <span className="text-white/50 font-mono text-xs ml-3">
                                            ₺{fav.price.toLocaleString("tr-TR")}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
