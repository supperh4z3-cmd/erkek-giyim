"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MapPin, Heart, Package, LogOut, Plus, Trash2, Loader2, X, Check, RotateCcw, ChevronDown, Truck, CreditCard, MapPinned } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Types ─── //
interface Address {
    id: string;
    label: string;
    full_name: string;
    line1: string;
    city: string;
    district: string;
    postal_code: string;
    is_default: boolean;
}

interface Favorite {
    id: string;
    productId: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    image: string;
}

interface OrderItem {
    id?: string;
    productId?: string;
    name: string;
    quantity: number;
    size?: string;
    color?: string;
    price?: number;
    image?: string;
}

interface Order {
    id: string;
    orderId: string;
    date: string;
    status: string;
    total: number;
    trackingNumber?: string;
    carrier?: string;
    address?: string;
    paymentStatus?: string;
    returnStatus?: string | null;
    items: OrderItem[];
}

// ─── TAB DEFINITIONS ─── //
const TABS = [
    { key: "profile", label: "Profil", icon: User },
    { key: "addresses", label: "Adreslerim", icon: MapPin },
    { key: "favorites", label: "Favorilerim", icon: Heart },
    { key: "orders", label: "Siparişlerim", icon: Package },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    processing: "Hazırlanıyor",
    shipped: "Kargoda",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
};
const statusColors: Record<string, string> = {
    pending: "text-yellow-400",
    processing: "text-blue-400",
    shipped: "text-purple-400",
    delivered: "text-green-400",
    cancelled: "text-red-400",
};
const paymentLabels: Record<string, string> = {
    paid: "Ödendi",
    pending: "Bekliyor",
    refunded: "İade Edildi",
};
const paymentColors: Record<string, string> = {
    paid: "text-green-400 bg-green-500/10 border-green-500/20",
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    refunded: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

export default function AccountPage() {
    const router = useRouter();
    const { customer, loading: authLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>("profile");

    // Auth kontrolü
    useEffect(() => {
        if (!authLoading && !customer) {
            router.push("/login");
        }
    }, [authLoading, customer, router]);

    if (authLoading || !customer) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </main>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white px-4 md:px-8 pb-32 pt-32">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter"
                        >
                            Hesabım
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/40 text-sm uppercase tracking-widest font-medium mt-2"
                        >
                            Hoş geldin, {customer.name.split(" ")[0]}.
                        </motion.p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-white/30 hover:text-danger transition-colors text-sm uppercase tracking-widest font-bold group">
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    <div className="md:col-span-3">
                        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-3 px-5 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap border ${isActive
                                            ? "bg-white text-black border-white"
                                            : "bg-transparent text-white/50 border-[#222] hover:border-white/30 hover:text-white/80"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="md:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                {activeTab === "profile" && <ProfileTab customer={customer} />}
                                {activeTab === "addresses" && <AddressesTab />}
                                {activeTab === "favorites" && <FavoritesTab />}
                                {activeTab === "orders" && <OrdersTab customerId={customer.id} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}

// ─── PROFILE TAB ─── //
function ProfileTab({ customer }: { customer: { id: string; name: string; email: string; phone?: string; created_at?: string } }) {
    const [name, setName] = useState(customer.name);
    const [phone, setPhone] = useState(customer.phone || "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await fetch("/api/customer/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone }),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] border border-[#222] p-8 md:p-10">
            <h2 className="text-2xl font-display uppercase font-bold mb-8">Profil Bilgileri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Ad Soyad</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">E-Posta</label>
                    <input type="email" value={customer.email} disabled className="w-full bg-[#111] border border-[#333] p-4 text-white/50 font-medium rounded-none cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Telefon</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none" />
                </div>
            </div>
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#222]">
                <p className="text-white/20 text-xs uppercase tracking-widest font-medium">
                    Üyelik: {customer.created_at ? new Date(customer.created_at).toLocaleDateString("tr-TR", { month: "long", year: "numeric" }) : "-"}
                </p>
                <button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-danger hover:text-white transition-all duration-300 font-bold uppercase tracking-widest py-3 px-8 text-sm flex items-center gap-2 disabled:opacity-50">
                    {saved ? <><Check className="w-4 h-4" /> Kaydedildi</> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
                </button>
            </div>
        </div>
    );
}

// ─── ADDRESSES TAB ─── //
function AddressesTab() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ label: "", full_name: "", line1: "", city: "", district: "", postal_code: "", is_default: false });

    const fetchAddresses = useCallback(async () => {
        const res = await fetch("/api/customer/addresses");
        const data = await res.json();
        setAddresses(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

    const handleAdd = async () => {
        await fetch("/api/customer/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setShowForm(false);
        setForm({ label: "", full_name: "", line1: "", city: "", district: "", postal_code: "", is_default: false });
        fetchAddresses();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/customer/addresses?id=${id}`, { method: "DELETE" });
        fetchAddresses();
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-display uppercase font-bold">Adreslerim</h2>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-white text-black hover:bg-danger hover:text-white transition-all duration-300 font-bold uppercase tracking-widest py-3 px-6 text-xs">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "İptal" : "Yeni Adres"}
                </button>
            </div>

            {showForm && (
                <div className="bg-[#0a0a0a] border border-danger/30 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Adres Etiketi (Ev, İş...)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-danger rounded-none" />
                        <input placeholder="Ad Soyad" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-danger rounded-none" />
                    </div>
                    <input placeholder="Adres satırı (Mah. Sok. No...)" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-danger rounded-none" />
                    <div className="grid grid-cols-3 gap-4">
                        <input placeholder="İl" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-danger rounded-none" />
                        <input placeholder="İlçe" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-danger rounded-none" />
                        <input placeholder="Posta Kodu" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="bg-[#111] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-danger rounded-none" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="accent-red-500" />
                            Varsayılan adres yap
                        </label>
                        <button onClick={handleAdd} className="bg-danger text-white px-6 py-2 text-xs font-bold uppercase tracking-widest">Kaydet</button>
                    </div>
                </div>
            )}

            {addresses.length === 0 && !showForm ? (
                <div className="text-center py-20 bg-[#0a0a0a] border border-[#222]">
                    <MapPin className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 uppercase tracking-widest text-sm font-bold">Henüz adres eklemediniz.</p>
                </div>
            ) : (
                addresses.map((addr) => (
                    <div key={addr.id} className={`bg-[#0a0a0a] border p-6 md:p-8 relative ${addr.is_default ? "border-danger/50" : "border-[#222]"}`}>
                        {addr.is_default && (
                            <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest bg-danger text-white px-3 py-1">Varsayılan</span>
                        )}
                        <h3 className="font-display text-lg font-bold uppercase mb-3">{addr.label || "Adresim"}</h3>
                        <p className="text-white/60 font-medium leading-relaxed">
                            {addr.full_name}<br />
                            {addr.line1}<br />
                            {addr.district} / {addr.city} {addr.postal_code}
                        </p>
                        <div className="flex gap-4 mt-6 pt-4 border-t border-[#222]">
                            <button onClick={() => handleDelete(addr.id)} className="flex items-center gap-2 text-white/40 hover:text-danger transition-colors text-xs uppercase tracking-widest font-bold">
                                <Trash2 className="w-3.5 h-3.5" /> Sil
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// ─── FAVORITES TAB ─── //
function FavoritesTab() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = useCallback(async () => {
        const res = await fetch("/api/customer/favorites");
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

    const removeFav = async (productId: string) => {
        await fetch(`/api/customer/favorites?productId=${productId}`, { method: "DELETE" });
        setFavorites(favorites.filter(f => f.productId !== productId));
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>;

    return (
        <div>
            <h2 className="text-2xl font-display uppercase font-bold mb-8">Favorilerim</h2>
            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-[#0a0a0a] border border-[#222]">
                    <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 uppercase tracking-widest text-sm font-bold">Henüz favori ürün eklemediniz.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {favorites.map((product) => (
                        <div key={product.id} className="group relative">
                            <Link href={`/product/${product.slug}`}>
                                <div className="aspect-[3/4] relative bg-[#111] border border-[#222] overflow-hidden mb-3 group-hover:border-danger/50 transition-colors">
                                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors line-clamp-1 uppercase tracking-wide">
                                    {product.name}
                                </h4>
                                <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">{product.category}</p>
                                <p className="text-sm font-bold text-white/70 mt-1">₺{product.price.toLocaleString("tr-TR")}</p>
                            </Link>
                            <button onClick={() => removeFav(product.productId)} className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm hover:bg-danger transition-colors z-10">
                                <Heart className="w-4 h-4 text-danger fill-danger" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── ORDERS TAB ─── //
function OrdersTab({ customerId }: { customerId: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [returnModal, setReturnModal] = useState<Order | null>(null);
    const [returnReason, setReturnReason] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        fetch("/api/customer/orders")
            .then(res => res.json())
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const openReturnModal = (order: Order) => {
        setReturnModal(order);
        setReturnReason("");
        setSelectedItems(new Set(order.items.map((_, i) => i)));
        setSubmitSuccess(false);
    };

    const toggleItem = (idx: number) => {
        const next = new Set(selectedItems);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setSelectedItems(next);
    };

    const submitReturn = async () => {
        if (!returnModal || selectedItems.size === 0 || !returnReason.trim()) return;
        setSubmitting(true);
        try {
            const items = Array.from(selectedItems).map(idx => {
                const item = returnModal.items[idx];
                return {
                    orderItemId: item.id,
                    productName: item.name,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                };
            });
            const res = await fetch("/api/returns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: returnModal.orderId,
                    customerId,
                    reason: returnReason,
                    items,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitSuccess(true);
                // Sipariş listesini güncelle
                setOrders(orders.map(o => o.orderId === returnModal.orderId ? { ...o, returnStatus: "pending" } : o));
                setTimeout(() => setReturnModal(null), 1500);
            } else {
                alert(data.error || "İade talebi oluşturulamadı.");
            }
        } catch {
            alert("Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    const returnStatusLabels: Record<string, string> = {
        pending: "İade Bekliyor",
        approved: "İade Onaylandı",
        rejected: "İade Reddedildi",
        completed: "İade Tamamlandı",
    };
    const returnStatusColors: Record<string, string> = {
        pending: "bg-yellow-500/20 text-yellow-400",
        approved: "bg-blue-500/20 text-blue-400",
        rejected: "bg-red-500/20 text-red-400",
        completed: "bg-green-500/20 text-green-400",
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>;

    return (
        <div>
            <h2 className="text-2xl font-display uppercase font-bold mb-8">Siparişlerim</h2>
            {orders.length === 0 ? (
                <div className="text-center py-20 bg-[#0a0a0a] border border-[#222]">
                    <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 uppercase tracking-widest text-sm font-bold">Henüz sipariş vermediniz.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        return (
                        <div key={order.id} className="bg-[#0a0a0a] border border-[#222] hover:border-white/20 transition-colors rounded-lg overflow-hidden">
                            {/* Sipariş Başlığı */}
                            <div
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] cursor-pointer select-none hover:bg-white/[0.02] transition-colors">

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-display text-lg font-bold uppercase">#{order.id}</h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColors[order.status] || "text-white/50"}`}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                        {order.returnStatus && (
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${returnStatusColors[order.returnStatus] || ""}`}>
                                                <RotateCcw className="w-3 h-3 inline mr-1" />
                                                {returnStatusLabels[order.returnStatus] || order.returnStatus}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/40 text-sm font-medium">
                                        {new Date(order.date).toLocaleDateString("tr-TR")} · {order.items.length} ürün
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xl font-display font-bold">₺{Number(order.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                                    <ChevronDown className={`w-5 h-5 text-white/30 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                </div>
                            </div>

                            {/* Açılır Detay Bölümü */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        {/* Detay Kartları */}
                                        <div className="p-5 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#060606] border-b border-[#222]">
                                            {/* Kargo Bilgisi */}
                                            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Truck className="w-4 h-4 text-purple-400" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Kargo</span>
                                                </div>
                                                {order.trackingNumber ? (
                                                    <>
                                                        {order.carrier && (
                                                            <p className="text-sm font-bold text-white mb-1">{order.carrier}</p>
                                                        )}
                                                        <p className="text-sm font-mono text-purple-400 tracking-wider">{order.trackingNumber}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-white/20">Henüz kargoya verilmedi</p>
                                                )}
                                            </div>

                                            {/* Ödeme Durumu */}
                                            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CreditCard className="w-4 h-4 text-green-400" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ödeme</span>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${paymentColors[order.paymentStatus || ""] || "text-white/50 bg-white/5 border-white/10"}`}>
                                                    {paymentLabels[order.paymentStatus || ""] || order.paymentStatus || "Bilinmiyor"}
                                                </span>
                                            </div>

                                            {/* Teslimat Adresi */}
                                            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MapPinned className="w-4 h-4 text-blue-400" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Adres</span>
                                                </div>
                                                <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                                                    {order.address || "Adres bilgisi yok"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sipariş Kalemleri */}
                                        <div className="p-4 md:px-6 md:py-4 space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 py-2.5 border-b border-[#161616] last:border-0">
                                                    {item.image && (
                                                        <div className="w-12 h-14 relative bg-[#111] flex-shrink-0 overflow-hidden rounded">
                                                            <Image src={item.image as string} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white/80 truncate">{item.name}</p>
                                                        <p className="text-xs text-white/40">
                                                            {item.size && `Beden: ${item.size}`}
                                                            {item.size && item.color && " · "}
                                                            {item.color && `Renk: ${item.color}`}
                                                            {" · "}Adet: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-bold text-white/60">₺{Number(item.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Alt Bar: Toplam + İade */}
                                        <div className="p-4 md:px-6 bg-[#060606] border-t border-[#222] flex items-center justify-between">
                                            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Toplam: <span className="text-white text-base ml-1">₺{Number(order.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span></p>
                                            {order.status === "delivered" && !order.returnStatus && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openReturnModal(order); }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-danger hover:bg-danger/10 transition-all text-xs uppercase tracking-widest font-bold rounded"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    İade Talebi
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        );
                    })}
                </div>
            )}

            {/* ─── İADE TALEBİ MODALI ─── */}
            <AnimatePresence>
                {returnModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                        onClick={() => !submitting && setReturnModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-[#333] w-full max-w-lg max-h-[85vh] overflow-y-auto"
                        >
                            {submitSuccess ? (
                                <div className="p-12 text-center">
                                    <Check className="w-16 h-16 text-green-400 mx-auto mb-6" />
                                    <h3 className="text-2xl font-display font-bold uppercase mb-2">İade Talebi Oluşturuldu</h3>
                                    <p className="text-white/50 text-sm">Talebiniz inceleniyor. Sonuç size bildirilecektir.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Modal Header */}
                                    <div className="p-6 border-b border-[#222] flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-display font-bold uppercase">İade Talebi</h3>
                                            <p className="text-white/40 text-xs mt-1 font-mono">Sipariş #{returnModal.id}</p>
                                        </div>
                                        <button onClick={() => setReturnModal(null)} className="p-2 hover:bg-white/10 transition-colors">
                                            <X className="w-5 h-5 text-white/50" />
                                        </button>
                                    </div>

                                    {/* Ürün Seçimi */}
                                    <div className="p-6 border-b border-[#222]">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">İade Edilecek Ürünleri Seçin</h4>
                                        <div className="space-y-3">
                                            {returnModal.items.map((item, idx) => (
                                                <label key={idx} className={`flex items-center gap-4 p-3 border cursor-pointer transition-all ${selectedItems.has(idx) ? 'border-danger/50 bg-danger/5' : 'border-[#222] hover:border-white/20'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.has(idx)}
                                                        onChange={() => toggleItem(idx)}
                                                        className="accent-danger w-4 h-4 flex-shrink-0"
                                                    />
                                                    {item.image && (
                                                        <div className="w-10 h-12 relative bg-[#111] flex-shrink-0 overflow-hidden">
                                                            <Image src={item.image as string} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white/80 truncate">{item.name}</p>
                                                        <p className="text-xs text-white/40">
                                                            {item.size && `${item.size}`} {item.color && `· ${item.color}`} · {item.quantity} adet
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-bold text-white/60">₺{Number(item.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* İade Nedeni */}
                                    <div className="p-6 border-b border-[#222]">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">İade Nedeni</h4>
                                        <textarea
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            placeholder="İade nedeninizi açıklayın..."
                                            className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 text-sm resize-none h-24 outline-none focus:border-danger/50 transition-colors placeholder:text-white/20"
                                        />
                                    </div>

                                    {/* İade Özeti */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-white/50 text-sm">İade Tutarı</span>
                                            <span className="text-xl font-display font-bold text-danger">
                                                ₺{Array.from(selectedItems).reduce((sum, idx) => {
                                                    const item = returnModal.items[idx];
                                                    return sum + Number(item.price) * Number(item.quantity);
                                                }, 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <button
                                            onClick={submitReturn}
                                            disabled={submitting || selectedItems.size === 0 || !returnReason.trim()}
                                            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                            {submitting ? "Gönderiliyor..." : "İade Talebi Gönder"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
