"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Giriş başarısız");
                setLoading(false);
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setError("Sunucu hatası. Tekrar deneyin.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl uppercase tracking-tighter text-white mb-2">
                        CHASE<span className="text-white/30"> & </span>CHAIN
                    </h1>
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest">
                        Admin Kontrol Paneli
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-danger" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm uppercase tracking-widest">Yetkilendirme</h2>
                            <p className="text-white/40 text-xs">Admin şifresini girin</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-md px-4 py-3 text-danger text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                            Şifre
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#111] border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 rounded-md hover:bg-danger hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Doğrulanıyor...
                            </>
                        ) : (
                            "Giriş Yap"
                        )}
                    </button>
                </form>

                <p className="text-center text-white/20 text-xs mt-8 font-mono uppercase tracking-widest">
                    Yetkisiz erişim girişimleri kayıt altına alınır.
                </p>
            </div>
        </div>
    );
}
