"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, ShieldCheck, Truck, CreditCard, Loader2, CheckCircle2, Lock, User, Eye, EyeOff, MapPin, Ticket, X } from "lucide-react";

interface SavedAddress {
    id: string;
    label: string;
    full_name: string;
    line1: string;
    city: string;
    district: string;
    postal_code: string;
    is_default: boolean;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const { customer, login } = useAuth();

    // Checkout mode: "member" veya "guest"
    const [mode, setMode] = useState<"member" | "guest">(customer ? "member" : "guest");

    // Login formu (member mode, giriş yapmamışsa)
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // Kayıtlı adresler
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Manual form
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        address: "", city: "", district: "", zipCode: "", note: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [checkoutError, setCheckoutError] = useState("");

    // Kupon sistemi
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountAmount: number;
        discountFormatted: string;
        couponId: string;
    } | null>(null);

    const shippingCost = subtotal >= 1000 ? 0 : 49.90;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError("");
        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedCoupon({
                    code: data.code,
                    discountAmount: data.discountAmount,
                    discountFormatted: data.discountFormatted,
                    couponId: data.couponId,
                });
                setCouponCode("");
            } else {
                setCouponError(data.error || "Geçersiz kupon");
            }
        } catch {
            setCouponError("Bir hata oluştu");
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
    };

    // Giriş yapılmışsa bilgileri doldur
    useEffect(() => {
        if (customer) {
            setMode("member");
            const [first, ...rest] = customer.name.split(" ");
            setForm(prev => ({
                ...prev,
                firstName: first || "",
                lastName: rest.join(" ") || "",
                email: customer.email,
                phone: customer.phone || "",
            }));
            // Kayıtlı adresleri çek
            fetch("/api/customer/addresses")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSavedAddresses(data);
                        const defaultAddr = data.find((a: SavedAddress) => a.is_default);
                        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                    }
                })
                .catch(() => {});
        }
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
        const result = await login(loginEmail, loginPassword);
        if (!result.success) {
            setLoginError(result.error || "Giriş başarısız");
        }
        setLoginLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        setSubmitting(true);
        try {
            // Adres: kayıtlı veya manual
            let fullAddress = "";
            let customerName = "";
            let customerEmail = "";
            let customerPhone = "";

            if (customer && selectedAddressId) {
                const addr = savedAddresses.find(a => a.id === selectedAddressId);
                if (addr) {
                    fullAddress = `${addr.line1}, ${addr.district}/${addr.city}${addr.postal_code ? ` ${addr.postal_code}` : ""}`;
                    customerName = customer.name;
                    customerEmail = customer.email;
                    customerPhone = customer.phone || "";
                }
            }

            if (!fullAddress) {
                fullAddress = `${form.address}, ${form.district}/${form.city}${form.zipCode ? ` ${form.zipCode}` : ""}`;
                customerName = `${form.firstName} ${form.lastName}`;
                customerEmail = form.email;
                customerPhone = form.phone;
            }

            const orderData = {
                customerName,
                customerEmail,
                customerPhone,
                address: fullAddress,
                paymentStatus: "unpaid",
                total,
                note: form.note,
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                })),
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            if (!res.ok) throw new Error("Sipariş oluşturulamadı");

            const created = await res.json();
            setOrderId(created.id);
            setSuccess(true);
            clearCart();
        } catch (err) {
            console.error(err);
            setCheckoutError("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setSubmitting(false);
        }
    };

    // Success state
    if (success) {
        return (
            <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-green-500/10 border border-green-500/30 rounded-full">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-4">
                        Sipariş Alındı<span className="text-danger">.</span>
                    </h1>
                    <p className="text-white/60 text-lg mb-2">Sipariş numaranız:</p>
                    <p className="font-mono text-2xl text-danger font-bold mb-8">{orderId.toUpperCase()}</p>
                    <p className="text-white/40 text-sm mb-12 max-w-md mx-auto">
                        Siparişiniz başarıyla oluşturuldu. Sipariş durumunuzu hesabınızdan takip edebilirsiniz.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-danger hover:text-white transition-colors">
                            Anasayfaya Dön
                        </Link>
                        {customer && (
                            <Link href="/account" className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:border-white/50 transition-colors">
                                Hesabım
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // Empty cart
    if (items.length === 0 && !success) {
        return (
            <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-display uppercase tracking-tighter mb-4">
                        Sepetiniz Boş<span className="text-danger">.</span>
                    </h1>
                    <p className="text-white/50 mb-8">Ödeme sayfasına geçmek için sepetinize ürün ekleyin.</p>
                    <Link href="/collections/all" className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-danger hover:text-white transition-colors inline-block">
                        Koleksiyonları Keşfet
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-28 pb-20">
            <div className="max-w-6xl mx-auto px-4">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white text-xs uppercase tracking-widest font-bold mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Geri Dön
                </button>

                <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-8">
                    Ödeme<span className="text-danger">.</span>
                </h1>

                {checkoutError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-6 py-4 text-red-400 text-sm mb-8 flex items-center justify-between">
                        <span>{checkoutError}</span>
                        <button onClick={() => setCheckoutError("")} className="text-red-400/60 hover:text-red-400 ml-4">✕</button>
                    </div>
                )}

                {/* Mode Tabs — sadece giriş yapılmamışsa göster */}
                {!customer && (
                    <div className="flex gap-0 mb-8">
                        <button
                            onClick={() => setMode("member")}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border ${mode === "member"
                                ? "bg-white text-black border-white"
                                : "bg-transparent text-white/50 border-[#222] hover:border-white/30"
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Üye Girişi
                        </button>
                        <button
                            onClick={() => setMode("guest")}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border ${mode === "guest"
                                ? "bg-white text-black border-white"
                                : "bg-transparent text-white/50 border-[#222] hover:border-white/30"
                                }`}
                        >
                            <CreditCard className="w-4 h-4" />
                            Misafir Olarak Devam Et
                        </button>
                    </div>
                )}

                {/* Member login form (giriş yapmamışsa) */}
                {mode === "member" && !customer && (
                    <div className="bg-[#0a0a0a] border border-[#222] p-6 md:p-8 mb-8 max-w-lg">
                        <h2 className="font-display text-xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <User className="w-5 h-5 text-danger" />
                            Hesabına Giriş Yap
                        </h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {loginError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{loginError}</div>
                            )}
                            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="E-posta adresiniz"
                                className="w-full bg-[#111] border border-[#333] p-4 text-white text-sm focus:outline-none focus:border-danger rounded-none" />
                            <div className="relative">
                                <input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="Şifreniz"
                                    className="w-full bg-[#111] border border-[#333] p-4 pr-12 text-white text-sm focus:outline-none focus:border-danger rounded-none" />
                                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <Link href="/register" className="text-xs text-danger/70 hover:text-danger uppercase tracking-widest font-bold">Hesap Oluştur</Link>
                                <button type="submit" disabled={loginLoading}
                                    className="bg-white text-black hover:bg-danger hover:text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Giriş Yap →"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Ana checkout formu: giriş yapılmışsa veya guest modunda */}
                {(customer || mode === "guest") && (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                            {/* Left: Form */}
                            <div className="lg:col-span-3 space-y-8">
                                {/* Kayıtlı adresler */}
                                {customer && savedAddresses.length > 0 && (
                                    <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                                        <h2 className="font-display text-xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-danger" />
                                            Kayıtlı Adreslerim
                                        </h2>
                                        <div className="space-y-3">
                                            {savedAddresses.map(addr => (
                                                <label key={addr.id}
                                                    className={`block border p-4 cursor-pointer transition-colors ${selectedAddressId === addr.id
                                                        ? "border-danger bg-danger/5"
                                                        : "border-[#222] hover:border-white/20"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input type="radio" name="savedAddr" checked={selectedAddressId === addr.id}
                                                            onChange={() => setSelectedAddressId(addr.id)} className="mt-1 accent-red-500" />
                                                        <div>
                                                            <p className="font-bold text-sm uppercase">{addr.label} {addr.is_default && <span className="text-danger text-[10px]">• Varsayılan</span>}</p>
                                                            <p className="text-white/50 text-sm mt-1">{addr.full_name} — {addr.line1}, {addr.district}/{addr.city}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                            <label className={`block border p-4 cursor-pointer transition-colors ${selectedAddressId === null
                                                ? "border-danger bg-danger/5"
                                                : "border-[#222] hover:border-white/20"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name="savedAddr" checked={selectedAddressId === null}
                                                        onChange={() => setSelectedAddressId(null)} className="accent-red-500" />
                                                    <p className="text-sm font-bold uppercase">Farklı Adres Gir</p>
                                                </div>
                                            </label>
                                        </div>
                                    </section>
                                )}

                                {/* İletişim bilgileri (guest veya yeni adres) */}
                                {(!customer || selectedAddressId === null) && (
                                    <>
                                        <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                                            <h2 className="font-display text-xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                                                <CreditCard className="w-5 h-5 text-danger" />
                                                İletişim Bilgileri
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Ad *</label>
                                                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required
                                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors" placeholder="Adınız" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Soyad *</label>
                                                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required
                                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors" placeholder="Soyadınız" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">E-posta *</label>
                                                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors" placeholder="ornek@email.com" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Telefon *</label>
                                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
                                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors" placeholder="+90 5XX XXX XXXX" />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                                            <h2 className="font-display text-xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                                                <Truck className="w-5 h-5 text-danger" />
                                                Teslimat Adresi
                                            </h2>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Adres *</label>
                                                    <textarea name="address" value={form.address} onChange={handleChange} required rows={2}
                                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors resize-none" placeholder="Mahalle, sokak, bina no, daire no..." />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">İl *</label>
                                                        <input type="text" name="city" value={form.city} onChange={handleChange} required
                                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors" placeholder="İstanbul" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">İlçe *</label>
                                                        <input type="text" name="district" value={form.district} onChange={handleChange} required
                                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors" placeholder="Kadıköy" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Posta Kodu</label>
                                                        <input type="text" name="zipCode" value={form.zipCode} onChange={handleChange}
                                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors" placeholder="34000" />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </>
                                )}

                                {/* Sipariş Notu */}
                                <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Sipariş Notu</label>
                                    <textarea name="note" value={form.note} onChange={handleChange} rows={2}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-danger transition-colors resize-none" placeholder="Kargocuya iletilecek özel notunuz (isteğe bağlı)" />
                                </section>

                                {/* Payment Notice */}
                                <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                                    <h2 className="font-display text-xl uppercase tracking-tighter mb-4 flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-danger" />
                                        Ödeme
                                    </h2>
                                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
                                        <p className="text-yellow-400 text-sm font-medium mb-1">Kapıda Ödeme</p>
                                        <p className="text-white/40 text-xs leading-relaxed">
                                            Şu an sadece kapıda ödeme (nakit veya kart) seçeneği aktiftir.
                                            Online ödeme entegrasyonu yakında eklenecektir.
                                        </p>
                                    </div>
                                </section>
                            </div>

                            {/* Right: Order Summary */}
                            <div className="lg:col-span-2">
                                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8 sticky top-28">
                                    <h2 className="font-display text-xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-danger" />
                                        Sipariş Özeti
                                    </h2>

                                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 group">
                                                <div className="relative w-16 h-20 flex-none bg-[#111] rounded-lg overflow-hidden border border-white/5">
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                                        {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-bold uppercase truncate">{item.name}</p>
                                                    <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-1">{item.size} / {item.color}</p>
                                                    <p className="text-white/70 text-sm mt-1">₺{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Kupon Kodu */}
                                    <div className="border-t border-white/5 pt-4 mb-4">
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                            <Ticket className="w-3 h-3" /> Kupon Kodu
                                        </p>
                                        {appliedCoupon ? (
                                            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-md px-4 py-3">
                                                <div>
                                                    <span className="font-mono font-bold text-green-400 text-sm">{appliedCoupon.code}</span>
                                                    <span className="text-green-500 text-xs ml-2">-{appliedCoupon.discountFormatted}</span>
                                                </div>
                                                <button onClick={removeCoupon} className="text-green-500/60 hover:text-red-400 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                                                    placeholder="Kupon kodunuz"
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-white text-sm font-mono uppercase placeholder:text-white/20 focus:outline-none focus:border-danger"
                                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading || !couponCode.trim()}
                                                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-md text-white text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-30"
                                                >
                                                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uygula"}
                                                </button>
                                            </div>
                                        )}
                                        {couponError && (
                                            <p className="text-danger text-xs mt-2">{couponError}</p>
                                        )}
                                    </div>

                                    <div className="border-t border-white/5 pt-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Ara Toplam</span>
                                            <span className="text-white">₺{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Kargo</span>
                                            <span className={shippingCost === 0 ? "text-green-500 font-bold" : "text-white"}>
                                                {shippingCost === 0 ? "ÜCRETSİZ" : `₺${shippingCost.toFixed(2)}`}
                                            </span>
                                        </div>
                                        {shippingCost > 0 && (
                                            <p className="text-[10px] text-white/30">₺{(1000 - subtotal).toFixed(2)} daha alışveriş yapın, kargo bedava!</p>
                                        )}
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-500">Kupon İndirimi</span>
                                                <span className="text-green-500 font-bold">-{appliedCoupon.discountFormatted}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end pt-3 border-t border-white/5">
                                            <span className="text-white/60 text-xs uppercase tracking-widest font-bold">Toplam</span>
                                            <span className="font-display text-3xl text-white">₺{total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={submitting}
                                        className="w-full mt-6 relative group overflow-hidden bg-white text-black px-8 py-5 font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-3 transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                        <div className="absolute inset-0 bg-danger transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4 relative z-10" />
                                                <span className="relative z-10">SİPARİŞİ TAMAMLA</span>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-white/20 text-[10px] mt-4 font-mono">
                                        Siparişi tamamlayarak satış şartlarını kabul etmiş olursunuz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
