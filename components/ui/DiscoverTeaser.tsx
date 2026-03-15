"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

export default function DiscoverTeaser() {
    return (
        <section className="relative w-full h-[60vh] md:h-[80vh] bg-black overflow-hidden flex items-center justify-center border-y border-[#222]">
            {/* Background Video (Muted, Autoplay, Loop) */}
            <div className="absolute inset-0 w-full h-full opacity-50 z-0">
                <video
                    src="/discover-1.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
            </div>

            {/* Glowing Orbs for ambiance */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-danger/20 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <p className="text-danger font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-4 drop-shadow-lg">
                        Sokağın İçine Gir
                    </p>
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-6">
                        VIBE&apos;A GİR
                    </h2>
                    <p className="text-white/70 text-sm md:text-lg mb-10 max-w-xl mx-auto tracking-wide">
                        Küratörlü görünümler, house müzik, sokak stili. Hazırladığımız bu özel deneyime kulaklıklarınızı takıp dalın.
                    </p>

                    <Link
                        href="/discover"
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-danger hover:text-white transition-all duration-300"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        <span>HİKAYEYİ KEŞFET</span>
                        <div className="absolute inset-0 border border-white scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                    </Link>
                </motion.div>
            </div>

            {/* Animated Marquee Borders (Top & Bottom inside the section) */}
            <div className="absolute top-0 left-0 w-full overflow-hidden bg-black/50 border-b border-white/10 z-10 py-2">
                <div className="whitespace-nowrap flex animate-marquee text-white/30 text-[10px] uppercase tracking-[0.4em] font-medium">
                    <span className="mx-4">ENTER THE VIBE</span> • <span className="mx-4">HOUSE MUSIC AHEAD</span> • <span className="mx-4">PREMIUM STREETWEAR EXPERIENCE</span> •
                    <span className="mx-4">ENTER THE VIBE</span> • <span className="mx-4">HOUSE MUSIC AHEAD</span> • <span className="mx-4">PREMIUM STREETWEAR EXPERIENCE</span> •
                    <span className="mx-4">ENTER THE VIBE</span> • <span className="mx-4">HOUSE MUSIC AHEAD</span> • <span className="mx-4">PREMIUM STREETWEAR EXPERIENCE</span> •
                    <span className="mx-4">ENTER THE VIBE</span> • <span className="mx-4">HOUSE MUSIC AHEAD</span> • <span className="mx-4">PREMIUM STREETWEAR EXPERIENCE</span> •
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden bg-black/50 border-t border-white/10 z-10 py-2">
                <div className="whitespace-nowrap flex animate-marquee-reverse text-white/30 text-[10px] uppercase tracking-[0.4em] font-medium">
                    <span className="mx-4">EDITOR&apos;S CHOICE</span> • <span className="mx-4">SHOP THE LOOK</span> • <span className="mx-4">CHASE AND CHAIN</span> •
                    <span className="mx-4">EDITOR&apos;S CHOICE</span> • <span className="mx-4">SHOP THE LOOK</span> • <span className="mx-4">CHASE AND CHAIN</span> •
                    <span className="mx-4">EDITOR&apos;S CHOICE</span> • <span className="mx-4">SHOP THE LOOK</span> • <span className="mx-4">CHASE AND CHAIN</span> •
                    <span className="mx-4">EDITOR&apos;S CHOICE</span> • <span className="mx-4">SHOP THE LOOK</span> • <span className="mx-4">CHASE AND CHAIN</span> •
                </div>
            </div>
        </section>
    );
}
