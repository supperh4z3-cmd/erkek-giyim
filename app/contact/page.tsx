"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", orderId: "", message: "" });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setSending(true);
        setError("");

        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "contact_form",
                    title: `İletişim: ${form.name}`,
                    message: `${form.message}\n\nE-posta: ${form.email}${form.orderId ? `\nSipariş No: ${form.orderId}` : ""}`,
                }),
            });
            if (!res.ok) throw new Error("Gönderilemedi");
            setSent(true);
        } catch {
            setError("Mesajınız gönderilemedi. Lütfen tekrar deneyin.");
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-danger selection:text-white px-4 md:px-8 pb-32 pt-32">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

                {/* Left Side: Contact Information */}
                <div className="space-y-12">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter"
                    >
                        Bize Ulaşın
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-danger font-bold tracking-widest text-sm uppercase -mt-8"
                    >
                        Bağlantıda Kal.
                    </motion.p>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="h-px w-24 bg-white/20 origin-left"
                    />

                    <div className="space-y-8 pt-8 text-white/70">
                        <div>
                            <h3 className="font-bold text-xs uppercase tracking-widest text-white/50 mb-2">Merkez Depo / Ofis</h3>
                            <p className="text-xl font-display font-medium leading-relaxed">
                                Organize Sanayi Bölgesi<br />
                                4. Cadde No: 18<br />
                                34000, İstanbul / TR
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-xs uppercase tracking-widest text-white/50 mb-2">E-Posta Desteği</h3>
                            <a href="mailto:support@chaseandchain.com" className="text-xl font-display font-medium hover:text-danger transition-colors inline-block border-b border-white/20 hover:border-danger pb-1">
                                support@chaseandchain.com
                            </a>
                            <p className="text-sm mt-2 font-medium opacity-60">*Ortalama yanıt süremiz: 24-48 Saat</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Contact Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-[#0a0a0a] border border-[#222] p-8 md:p-12"
                >
                    {sent ? (
                        <div className="flex flex-col items-center justify-center text-center py-12">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-display uppercase font-bold mb-3">Mesajınız Alındı!</h3>
                            <p className="text-white/50 text-sm">En kısa sürede size dönüş yapacağız.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-display uppercase font-bold text-white mb-8">İletişim Formu</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">İsim Soyisim *</label>
                                        <input
                                            type="text" required
                                            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="J. Doe"
                                            className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">E-Posta Adresi *</label>
                                        <input
                                            type="email" required
                                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="your@email.com"
                                            className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Sipariş No (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                                        placeholder="#CC-12093"
                                        className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Mesajınız *</label>
                                    <textarea
                                        rows={5} required
                                        value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="Nasıl yardımcı olabiliriz?"
                                        className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium resize-none rounded-none"
                                    ></textarea>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-white text-black hover:bg-danger hover:text-white transition-colors duration-300 font-bold uppercase tracking-widest py-5 px-8 flex items-center justify-center gap-4 group disabled:opacity-50"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Gönder
                                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </motion.div>

            </div>
        </main>
    );
}
