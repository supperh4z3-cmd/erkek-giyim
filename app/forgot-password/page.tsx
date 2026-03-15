"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/customer/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Bir hata oluştu.");
                return;
            }

            setSent(true);
        } catch {
            setError("Sunucu hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="font-display text-2xl text-white font-bold uppercase tracking-tight mb-2">
                        E-posta Gönderildi!
                    </h1>
                    <p className="text-white/50 text-sm mb-2 leading-relaxed">
                        Eğer <strong className="text-white">{email}</strong> adresiyle bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.
                    </p>
                    <p className="text-white/30 text-xs mb-8">
                        E-postanızı kontrol edin. Spam klasörünü de kontrol etmeyi unutmayın.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-danger text-white px-8 py-3.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors"
                        >
                            Giriş Sayfasına Dön
                        </Link>
                        <button
                            onClick={() => { setSent(false); setEmail(""); }}
                            className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Farklı e-posta dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="font-display text-2xl font-bold tracking-tighter">
                            <span className="italic text-white">CHASE</span>{" "}
                            <span className="text-danger italic">&</span>{" "}
                            <span className="italic text-white">CHAIN</span>
                        </span>
                    </Link>
                    <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-danger" />
                    </div>
                    <h1 className="font-display text-xl text-white font-bold uppercase tracking-tight mb-1">
                        Şifremi Unuttum
                    </h1>
                    <p className="text-white/40 text-sm">
                        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">
                            E-posta Adresi
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-danger/50"
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full bg-danger text-white py-3.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                        ) : (
                            "Sıfırlama Bağlantısı Gönder"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Giriş Sayfasına Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
