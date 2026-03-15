"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SocialLinks {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
}

export default function Footer() {
    const pathname = usePathname();
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.socialLinks) setSocialLinks(data.socialLinks);
            })
            .catch(() => {});
    }, []);

    if (pathname?.startsWith("/admin")) return null;

    const brandName = "CHASE & CHAIN";
    const letters = brandName.split("");

    return (
        <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 mt-20 border-t border-[#222] relative overflow-hidden">
            {/* Animated Neon Background Text Graphic */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
                <div className="font-display text-[13.5vw] md:text-[9.5vw] lg:text-[8.5vw] font-black tracking-tighter whitespace-nowrap opacity-[0.15] flex">
                    {letters.map((char, index) => (
                        <motion.span
                            key={index}
                            animate={{
                                color: ["#1a1a1a", "#ef4444", "#ef4444", "#1a1a1a"],
                                textShadow: [
                                    "0 0 0px rgba(239,68,68,0)",
                                    "0 0 20px rgba(239,68,68,0.8), 0 0 45px rgba(239,68,68,0.5)",
                                    "0 0 20px rgba(239,68,68,0.8), 0 0 45px rgba(239,68,68,0.5)",
                                    "0 0 0px rgba(239,68,68,0)"
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                                delay: index * 0.15,
                                times: [0, 0.2, 0.4, 1]
                            }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">

                    {/* Left Asymmetrical Block - Brand & Newsletter */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div>
                            <h3 className="font-display text-4xl mb-6 uppercase tracking-tighter text-white">
                                CHASE<br /><span className="text-neutral-500">& CHAIN</span>
                            </h3>
                            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm font-medium">
                                Modern çağ için özenle üretilen premium sokak giyimi. Drill kültürü için bir araya getirilen kalite ve kusursuz estetik.
                            </p>
                        </div>

                        <div className="mt-16">
                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-neutral-300 mb-6 flex items-center gap-4">
                                VIP Bülten <span className="h-[1px] w-12 bg-danger inline-block"></span>
                            </h4>
                            <p className="text-neutral-500 text-xs mt-2 mb-6 uppercase tracking-widest font-medium">Listeye katıl. Yeni sezon ürünlerine erken erişim sağla.</p>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!newsletterEmail.trim()) return;
                                setNewsletterStatus("loading");
                                try {
                                    await fetch("/api/notifications", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ type: "newsletter", title: "Yeni Bülten Abonesi", message: newsletterEmail }),
                                    });
                                    setNewsletterStatus("success");
                                } catch {
                                    setNewsletterStatus("error");
                                }
                            }} className="flex flex-col sm:flex-row gap-0 group">
                                <input
                                    type="email"
                                    placeholder="E-posta adresin"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    required
                                    disabled={newsletterStatus === "success"}
                                    className="bg-[#111] border border-[#333] rounded-none px-6 py-4 text-sm w-full focus:border-white focus:outline-none transition-colors text-white disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                                    className="bg-white text-black border border-white hover:bg-black hover:text-white px-8 py-4 font-bold text-sm uppercase tracking-widest transition-colors whitespace-nowrap disabled:opacity-50"
                                >
                                    {newsletterStatus === "success" ? "Abone Olundu ✓" : newsletterStatus === "loading" ? "..." : "Abone Ol"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Spacer for asymmetry */}
                    <div className="hidden lg:block lg:col-span-1"></div>

                    {/* Right Asymmetrical Block - Links Grid */}
                    <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12 pt-4">
                        <div className="flex flex-col">
                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-neutral-500 mb-8">Mağaza</h4>
                            <ul className="space-y-4 text-sm text-neutral-300 font-medium">
                                <li><Link href="/collections" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Tüm Ürünler</Link></li>
                                <li><Link href="/collections/t-shirts" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Tişörtler</Link></li>
                                <li><Link href="/collections/bottoms" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Jean & Kargo</Link></li>
                                <li><Link href="/collections/hoodies" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Hoodie & Ceket</Link></li>
                                <li><Link href="/collections/knitwear" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Triko</Link></li>
                            </ul>
                        </div>

                        <div className="flex flex-col">
                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-neutral-500 mb-8">Kurumsal & Destek</h4>
                            <ul className="space-y-4 text-sm text-neutral-300 font-medium">
                                <li><Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Hakkımızda / Manifesto</Link></li>
                                <li><Link href="/campaigns" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Kampanyalar (Lookbook)</Link></li>
                                <li><Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Bize Ulaşın</Link></li>
                                <li><Link href="/shipping" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Kargo & Teslimat</Link></li>
                                <li><Link href="/returns" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">İade & Değişim</Link></li>
                                <li><Link href="/size-guide" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Beden Tablosu</Link></li>
                                <li><Link href="/faq" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">S.S.S.</Link></li>
                            </ul>
                        </div>

                        <div className="flex flex-col col-span-2 sm:col-span-1 mt-8 sm:mt-0">
                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-neutral-500 mb-8">Sosyal</h4>
                            <ul className="space-y-4 text-sm text-neutral-300 font-medium">
                                <li><a href={socialLinks.instagram || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Instagram</a></li>
                                <li><a href={socialLinks.tiktok || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">TikTok</a></li>
                                <li><a href={socialLinks.twitter || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Twitter</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-[#222] text-center text-neutral-600 text-xs flex flex-col md:flex-row justify-between items-center gap-6 uppercase tracking-widest font-medium">
                    <p>&copy; {new Date().getFullYear()} CHASE & CHAIN. Tüm hakları saklıdır.</p>
                    <div className="flex gap-8">
                        <a href="/terms" className="hover:text-white transition-colors">Hizmet Şartları</a>
                        <a href="/privacy" className="hover:text-white transition-colors">Gizlilik Politikası</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
