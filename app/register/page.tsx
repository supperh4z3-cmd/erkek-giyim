"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { register, customer } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (customer) {
        router.push("/account");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            setError("Hizmet şartlarını kabul etmelisiniz");
            return;
        }
        setError("");
        setLoading(true);

        const fullName = `${firstName} ${lastName}`.trim();
        const result = await register(fullName, email, phone, password);

        if (result.success) {
            router.push("/account");
        } else {
            setError(result.error || "Kayıt başarısız");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-32 relative overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-danger/5 blur-[200px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[180px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-3">
                        Kayıt Ol
                    </h1>
                    <p className="text-white/40 text-sm uppercase tracking-widest font-medium">
                        Topluluğa Katıl. Erken Erişim Kazan.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-[#0a0a0a] border border-[#222] p-8 md:p-10 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Ad</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    placeholder="Adınız"
                                    className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Soyad</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    placeholder="Soyadınız"
                                    className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">E-Posta Adresi</label>
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Telefon</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+90 5XX XXX XXXX"
                                className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-danger transition-colors font-medium rounded-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-1">Şifre</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Min. 6 karakter"
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

                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 w-4 h-4 accent-red-500"
                                />
                                <span className="text-xs text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                                    <Link href="/terms" className="text-danger/70 hover:text-danger transition-colors">Hizmet Şartları</Link> ve{" "}
                                    <Link href="/privacy" className="text-danger/70 hover:text-danger transition-colors">Gizlilik Politikası</Link>&apos;nı
                                    okudum ve kabul ediyorum.
                                </span>
                            </label>
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
                                    Kayıt Ol
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
                    <p className="text-white/30 text-sm font-medium mb-4">Zaten bir hesabın var mı?</p>
                    <Link
                        href="/login"
                        className="inline-block border border-[#333] hover:border-danger text-white/80 hover:text-danger px-8 py-4 font-bold uppercase tracking-widest text-sm transition-all duration-300"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
