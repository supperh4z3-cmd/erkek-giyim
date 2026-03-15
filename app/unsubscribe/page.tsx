"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const email = searchParams.get("email");
    const [resubscribing, setResubscribing] = useState(false);
    const [resubscribed, setResubscribed] = useState(false);

    const handleResubscribe = async () => {
        if (!email) return;
        setResubscribing(true);
        try {
            await fetch("/api/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            setResubscribed(true);
        } catch {
            // ignore
        } finally {
            setResubscribing(false);
        }
    };

    const getContent = () => {
        if (resubscribed) {
            return {
                icon: "✅",
                title: "Tekrar Hoş Geldin!",
                desc: "E-posta aboneliğin yeniden aktif edildi.",
                color: "#22c55e",
            };
        }
        switch (status) {
            case "success":
                return {
                    icon: "📬",
                    title: "Abonelik Kaldırıldı",
                    desc: `${email || "E-posta adresiniz"} artık bildirim almayacak.`,
                    color: "#ef4444",
                };
            case "already":
                return {
                    icon: "ℹ️",
                    title: "Zaten Kaldırılmış",
                    desc: "Bu e-posta adresi zaten abonelikten çıkmış.",
                    color: "#eab308",
                };
            default:
                return {
                    icon: "⚠️",
                    title: "Bir Hata Oluştu",
                    desc: "Abonelik kaldırma işlemi başarısız oldu. Lütfen tekrar deneyin.",
                    color: "#ef4444",
                };
        }
    };

    const content = getContent();

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <Link href="/" className="inline-block mb-12">
                    <span className="font-display font-bold text-2xl tracking-tighter text-white italic">
                        CHASE <span className="text-danger">&</span> CHAIN
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-10 relative overflow-hidden">
                    {/* Top accent */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: `linear-gradient(90deg, transparent, ${content.color}, transparent)` }}
                    />

                    {/* Icon */}
                    <div className="text-5xl mb-6">{content.icon}</div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">
                        {content.title}
                    </h1>

                    {/* Description */}
                    <p className="text-white/50 text-sm leading-relaxed mb-8">
                        {content.desc}
                    </p>

                    {/* Resubscribe button */}
                    {status === "success" && !resubscribed && email && (
                        <button
                            onClick={handleResubscribe}
                            disabled={resubscribing}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 mb-4"
                        >
                            {resubscribing ? "İşleniyor..." : "Tekrar Abone Ol"}
                        </button>
                    )}

                    {/* Home link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-danger hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        ← Siteye Dön
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-white/20 text-[10px] mt-8 uppercase tracking-widest">
                    CHASE & CHAIN — Premium Streetwear
                </p>
            </div>
        </main>
    );
}

export default function UnsubscribePage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <Suspense fallback={
            <main className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-white/30 text-sm">Yükleniyor...</div>
            </main>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
