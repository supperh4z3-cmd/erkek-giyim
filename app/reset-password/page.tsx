"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Geçersiz veya eksik bağlantı. Lütfen e-postanızdaki bağlantıya tekrar tıklayın.");
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        if (password !== confirm) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/customer/forgot-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Bir hata oluştu.");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Sunucu hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="font-display text-2xl text-white font-bold uppercase tracking-tight mb-2">
                        Şifreniz Güncellendi!
                    </h1>
                    <p className="text-white/50 text-sm mb-8">
                        Yeni şifrenizle giriş yapabilirsiniz.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-danger text-white px-8 py-3.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors"
                    >
                        Giriş Yap
                    </Link>
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
                        <Lock className="w-6 h-6 text-danger" />
                    </div>
                    <h1 className="font-display text-xl text-white font-bold uppercase tracking-tight mb-1">
                        Yeni Şifre Belirle
                    </h1>
                    <p className="text-white/40 text-sm">
                        Hesabınız için yeni bir şifre oluşturun.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">
                            Yeni Şifre
                        </label>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="En az 6 karakter"
                                className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-danger/50"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">
                            Şifre Tekrar
                        </label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
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
                        disabled={loading || !password || !confirm}
                        className="w-full bg-danger text-white py-3.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...</>
                        ) : (
                            "Şifremi Güncelle"
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
