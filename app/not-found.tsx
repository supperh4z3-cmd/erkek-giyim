"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [glitchActive, setGlitchActive] = useState(false);

    // Signal to header that this is a dark-themed page
    useEffect(() => {
        document.documentElement.setAttribute("data-dark-page", "true");
        return () => document.documentElement.removeAttribute("data-dark-page");
    }, []);

    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };
        window.addEventListener("mousemove", handleMouse);

        // Random glitch effect
        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 150);
        }, 3000 + Math.random() * 4000);

        return () => {
            window.removeEventListener("mousemove", handleMouse);
            clearInterval(glitchInterval);
        };
    }, []);

    return (
        <div className="relative flex items-center justify-center px-4 min-h-[80vh] overflow-hidden bg-[#050505] -mt-[1px]">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Radial glow following mouse */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] transition-all duration-[2000ms] ease-out blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, #ef4444 0%, transparent 70%)",
                        left: `${mousePos.x}%`,
                        top: `${mousePos.y}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                />

                {/* Grid lines */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }} />

                {/* Scan line */}
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-danger/20 to-transparent animate-scan" />

                {/* Floating particles */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-danger/20 animate-float"
                        style={{
                            left: `${10 + (i * 7.5)}%`,
                            top: `${20 + Math.sin(i * 0.8) * 30}%`,
                            animationDelay: `${i * 0.4}s`,
                            animationDuration: `${3 + i * 0.5}s`,
                        }}
                    />
                ))}

                {/* Corner accents */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-white/[0.05]" />
                <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-white/[0.05]" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-white/[0.05]" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-white/[0.05]" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-[700px]">
                {/* Giant 404 — background layer */}
                <div className="select-none pointer-events-none" aria-hidden="true">
                    <h1
                        className={`text-[120px] sm:text-[160px] md:text-[200px] font-display font-black uppercase tracking-tighter leading-none transition-all duration-100 ${
                            glitchActive ? "text-danger/30" : "text-white/[0.03]"
                        }`}
                        style={{
                            textShadow: glitchActive
                                ? "4px 0 #ef4444, -4px 0 #3b82f6, 0 0 30px rgba(239,68,68,0.2)"
                                : "none",
                        }}
                    >
                        404
                    </h1>

                    {/* Glitch overlay layers */}
                    {glitchActive && (
                        <>
                            <h1
                                className="absolute inset-0 text-[120px] sm:text-[160px] md:text-[200px] font-display font-black uppercase tracking-tighter leading-none text-danger/20 select-none flex items-center justify-center"
                                style={{ transform: "translate(4px, -2px)", clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)" }}
                            >
                                404
                            </h1>
                            <h1
                                className="absolute inset-0 text-[120px] sm:text-[160px] md:text-[200px] font-display font-black uppercase tracking-tighter leading-none text-blue-500/15 select-none flex items-center justify-center"
                                style={{ transform: "translate(-4px, 2px)", clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)" }}
                            >
                                404
                            </h1>
                        </>
                    )}
                </div>

                {/* Title — offset upward to overlap the 404 slightly */}
                <div className="-mt-16 sm:-mt-20 md:-mt-24 mb-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black uppercase tracking-tighter text-white">
                        Kaybolmuş Görünüyorsun<span className="text-danger animate-pulse">.</span>
                    </h2>
                </div>

                {/* Error code badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-danger/5 border border-danger/10 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                    <span className="text-[10px] font-mono text-danger/60 uppercase tracking-widest">ERR::PAGE_NOT_FOUND</span>
                </div>

                <p className="text-white/30 text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium mb-10 sm:mb-12 max-w-md mx-auto leading-relaxed">
                    Aradığın sayfa bulunamadı veya taşınmış olabilir.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link
                        href="/"
                        className="bg-white text-black hover:bg-danger hover:text-white px-8 sm:px-10 py-3.5 sm:py-4 font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                        Anasayfa
                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </Link>
                    <Link
                        href="/collections"
                        className="border border-white/10 hover:border-danger text-white/60 hover:text-danger px-8 sm:px-10 py-3.5 sm:py-4 font-bold uppercase tracking-widest text-sm transition-all duration-300 text-center"
                    >
                        Koleksiyonlar
                    </Link>
                </div>

                {/* Bottom decorative */}
                <div className="mt-14 sm:mt-16 flex items-center gap-4 justify-center">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/10" />
                    <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">CHASE & CHAIN</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/10" />
                </div>
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
                    50% { transform: translateY(-20px) scale(1.5); opacity: 0.6; }
                }
                .animate-scan { animation: scan 4s linear infinite; }
                .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
