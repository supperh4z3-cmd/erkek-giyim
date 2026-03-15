"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft, Loader2, Package, User, MapPin, Phone, Mail,
    Truck, CreditCard, Save, CheckCircle, Clock, AlertCircle,
    Printer
} from "lucide-react";

interface OrderItem {
    productId: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
}

interface OrderDetail {
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
    note: string;
    items: OrderItem[];
}

const STATUS_OPTIONS = [
    { value: "pending", label: "Bekliyor", color: "text-yellow-500 bg-yellow-500/10", icon: Clock },
    { value: "processing", label: "Hazırlanıyor", color: "text-blue-500 bg-blue-500/10", icon: Package },
    { value: "shipped", label: "Kargoda", color: "text-purple-500 bg-purple-500/10", icon: Truck },
    { value: "delivered", label: "Teslim Edildi", color: "text-green-500 bg-green-500/10", icon: CheckCircle },
    { value: "cancelled", label: "İptal Edildi", color: "text-red-500 bg-red-500/10", icon: AlertCircle },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Editable fields
    const [status, setStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setOrder(null);
                } else {
                    setOrder(data);
                    setStatus(data.status);
                    setTrackingNumber(data.trackingNumber || "");
                }
            })
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        if (!order) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    trackingNumber: trackingNumber || undefined,
                }),
            });
            const updated = await res.json();
            setOrder(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Güncelleme hatası:", err);
        } finally {
            setSaving(false);
        }
    };

    const printInvoice = () => {
        if (!order) return;
        const itemRows = order.items.map((item, i) =>
            `<tr>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333">${i + 1}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333">${item.name}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#666;text-align:center">${item.size} / ${item.color}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;text-align:center">${item.quantity}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;text-align:right">₺${item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;text-align:right;font-weight:600">₺${(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</td>
            </tr>`
        ).join("");

        const total = order.total;
        const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const shipping = total - subtotal;

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Fatura - ${order.id}</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; color:#111; background:#fff; padding:40px; max-width:800px; margin:0 auto; }
    @media print { body { padding:20px; } .no-print { display:none !important; } }
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px">
    <div>
        <h1 style="font-size:28px;font-weight:800;letter-spacing:-1px;font-style:italic">CHASE <span style="color:#ef4444">&</span> CHAIN</h1>
        <p style="color:#888;font-size:11px;margin-top:4px;text-transform:uppercase;letter-spacing:2px">Premium Streetwear</p>
    </div>
    <div style="text-align:right">
        <h2 style="font-size:24px;font-weight:700;color:#111">FATURA</h2>
        <p style="color:#888;font-size:12px;margin-top:4px">Sipariş No: <strong style="color:#111">${order.id}</strong></p>
        <p style="color:#888;font-size:12px">Tarih: ${order.date ? new Date(order.date).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
    </div>
</div>

<div style="display:flex;gap:40px;margin-bottom:32px">
    <div style="flex:1;background:#f8f8f8;padding:16px 20px;border-radius:8px">
        <p style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:600">MÜŞTERİ</p>
        <p style="font-weight:600;font-size:14px">${order.customerName}</p>
        <p style="color:#666;font-size:12px;margin-top:2px">${order.customerEmail}</p>
        ${order.customerPhone ? `<p style="color:#666;font-size:12px">${order.customerPhone}</p>` : ""}
    </div>
    <div style="flex:1;background:#f8f8f8;padding:16px 20px;border-radius:8px">
        <p style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:600">TESLİMAT ADRESİ</p>
        <p style="color:#333;font-size:13px;line-height:1.5">${order.address || "—"}</p>
    </div>
</div>

<table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
        <tr style="background:#111;color:#fff">
            <th style="padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600">#</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Ürün</th>
            <th style="padding:10px 12px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Varyant</th>
            <th style="padding:10px 12px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Adet</th>
            <th style="padding:10px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Birim Fiyat</th>
            <th style="padding:10px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Toplam</th>
        </tr>
    </thead>
    <tbody>${itemRows}</tbody>
</table>

<div style="display:flex;justify-content:flex-end">
    <div style="width:280px">
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px"><span style="color:#666">Ara Toplam</span><span>₺${subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;border-bottom:1px solid #eee"><span style="color:#666">Kargo</span><span>${shipping > 0 ? `₺${shipping.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` : "Ücretsiz"}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:700"><span>Toplam</span><span>₺${total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span></div>
    </div>
</div>

<div style="margin-top:40px;text-align:center;color:#ccc;font-size:10px;text-transform:uppercase;letter-spacing:3px">
    CHASE & CHAIN — Premium Streetwear
</div>

<div class="no-print" style="margin-top:24px;text-align:center">
    <button onclick="window.print()" style="background:#111;color:#fff;border:none;padding:12px 32px;font-size:13px;font-weight:600;cursor:pointer;border-radius:6px;text-transform:uppercase;letter-spacing:2px">Yazdır / PDF Kaydet</button>
</div>
</body></html>`;

        const win = window.open("", "_blank");
        if (win) {
            win.document.write(html);
            win.document.close();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="space-y-4">
                <Link href="/admin/orders" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Siparişlere Dön
                </Link>
                <div className="text-center py-16 text-white/30">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-display text-xl uppercase tracking-widest">Sipariş Bulunamadı</p>
                </div>
            </div>
        );
    }

    const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">
                            Sipariş #{order.id}
                        </h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            {order.date ? new Date(order.date).toLocaleDateString("tr-TR", {
                                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                            }) : "—"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={printInvoice}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-colors"
                        title="Fatura Yazdır"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Fatura</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-danger hover:bg-red-600 text-white px-5 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
                    >
                        {saved ? (
                            <><CheckCircle className="w-4 h-4" /> Kaydedildi</>
                        ) : saving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor</>
                        ) : (
                            <><Save className="w-4 h-4" /> Kaydet</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Customer + Address + Items */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer Info */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                <User className="w-4 h-4 text-cyan-500" /> Müşteri Bilgileri
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-white/30" />
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">İsim</p>
                                    <p className="text-white font-medium">{order.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-white/30" />
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">E-posta</p>
                                    <p className="text-white font-medium">{order.customerEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-white/30" />
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Telefon</p>
                                    <p className="text-white font-medium">{order.customerPhone || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-white/30 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Adres</p>
                                    <p className="text-white font-medium">{order.address || "—"}</p>
                                </div>
                            </div>
                        </div>
                        {order.note && (
                            <div className="px-6 pb-6">
                                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-md p-3">
                                    <p className="text-[10px] text-yellow-500/60 uppercase tracking-widest mb-1">Müşteri Notu</p>
                                    <p className="text-white/70 text-sm">{order.note}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-500" /> Sipariş Kalemleri ({order.items.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="relative w-16 h-20 flex-none bg-white/5 rounded-md overflow-hidden border border-white/10">
                                        <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium text-sm truncate">{item.name}</p>
                                        <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-1">
                                            {item.size} / {item.color} · x{item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-mono font-bold">
                                            ₺{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                        </p>
                                        {item.quantity > 1 && (
                                            <p className="text-white/30 text-[10px] font-mono">
                                                birim: ₺{item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-white/10 px-6 py-4 flex justify-between items-center">
                            <span className="text-white/50 text-xs uppercase tracking-widest font-bold">Ürün Toplamı</span>
                            <span className="text-white font-display text-2xl">
                                ₺{itemsTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Status + Tracking + Summary */}
                <div className="space-y-6">

                    {/* Status & Tracking */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-purple-500" /> Durum & Kargo
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                    Sipariş Durumu
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-danger"
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <div className={`mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded ${currentStatus.color}`}>
                                    <currentStatus.icon className="w-3 h-3" />
                                    {currentStatus.label}
                                </div>
                            </div>

                            {/* Tracking Number */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                    Kargo Takip Numarası
                                </label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Ör: 1234567890"
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-danger font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
                        <div className="border-b border-white/5 px-6 py-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-500" /> Ödeme Özeti
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/50">Ürünler</span>
                                <span className="text-white font-mono">
                                    ₺{itemsTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/50">Kargo</span>
                                <span className="text-white font-mono">
                                    {order.total - itemsTotal > 0
                                        ? `₺${(order.total - itemsTotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                                        : "ÜCRETSİZ"
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-end pt-3 border-t border-white/5">
                                <span className="text-white/60 text-xs uppercase tracking-widest font-bold">Toplam</span>
                                <span className="font-display text-3xl text-white">
                                    ₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm pt-2">
                                <span className="text-white/50">Ödeme Durumu</span>
                                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                    order.paymentStatus === "paid"
                                        ? "text-green-500 bg-green-500/10"
                                        : "text-yellow-500 bg-yellow-500/10"
                                }`}>
                                    {order.paymentStatus === "paid" ? "Ödendi" : "Bekliyor"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
