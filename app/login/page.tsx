"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login, customer } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Zaten giriş yapılmışsa
    if (customer) {
        router.push("/account");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            router.push("/account");
        } else {
            setError(result.error || "Giriş başarısız");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-32 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-danger/5 blur-[200px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-3">
                        Giriş Yap
                    </h1>
                    <p className="text-white/40 text-sm uppercase tracking-widest font-medium">
                        Hesabına erişim sağla
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-[#0a0a0a] border border-[#222] p-8 md:p-10 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">
                                E-Posta Adresi
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                                className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">
                                Şifre
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#111] border border-[#333] p-4 pr-12 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-[11px] text-white/30 hover:text-danger transition-colors font-medium">
                                Şifremi Unuttum
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black hover:bg-danger hover:text-white transition-all duration-300 font-bold uppercase tracking-widest py-5 px-8 flex items-center justify-center gap-4 group mt-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Giriş Yap
                                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-[#222]" />
                    <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">veya</span>
                    <div className="flex-1 h-px bg-[#222]" />
                </div>

                <div className="text-center">
                    <p className="text-white/30 text-sm font-medium mb-4">Henüz hesabın yok mu?</p>
                    <Link
                        href="/register"
                        className="inline-block border border-[#333] hover:border-danger text-white/80 hover:text-danger px-8 py-4 font-bold uppercase tracking-widest text-sm transition-all duration-300"
                    >
                        Kayıt Ol
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
