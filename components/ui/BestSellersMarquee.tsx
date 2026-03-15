"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProductCard from "./ProductCard";

interface MarqueeProduct {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    priceFormatted: string;
    oldPrice?: number;
    oldPriceFormatted?: string;
    images: string[];
    badge?: "new" | "sale";
    discountPercentage?: number;
    isBestSeller?: boolean;
    isNewSeason?: boolean;
    [key: string]: unknown;
}

export default function BestSellersMarquee() {
    const brandName = "CHASE & CHAIN";
    const letters = brandName.split("");
    const [bestSellers, setBestSellers] = useState<MarqueeProduct[]>([]);
    const marqueeItems = [...bestSellers, ...bestSellers];

    const [showContent, setShowContent] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inView = useInView(containerRef, { once: true, amount: 0.2 });

    // Çok satanları API'den çek
    useEffect(() => {
        fetch("/api/products?bestSeller=true")
            .then(res => res.json())
            .then((data: MarqueeProduct[]) => setBestSellers(data))
            .catch(() => {});
    }, []);

    const startIdleTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setShowContent(true);
        timerRef.current = setTimeout(() => {
            setShowContent(false);
        }, 15000);
    };

    useEffect(() => {
        if (inView) {
            const initialStrobe = setTimeout(() => {
                startIdleTimer();
            }, 4000);

            return () => {
                clearTimeout(initialStrobe);
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        }
    }, [inView]);

    return (
        <section
            ref={containerRef}
            onMouseMove={startIdleTimer}
            onTouchStart={startIdleTimer}
            onTouchMove={startIdleTimer}
            className="relative w-full bg-[#050505] py-24 overflow-hidden border-y border-[#222]"
        >
            {/* Background Smoke / Lightning Effects */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                {/* Smoke Orbs */}
                <motion.div
                    style={{ willChange: "transform, opacity" }}
                    animate={{
                        x: ["-10%", "110%", "50%", "-10%"],
                        y: ["0%", "20%", "-20%", "0%"],
                        scale: [1, 1.5, 1],
                        opacity: [0.1, 0.4, 0.1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] md:w-[40vw] md:h-[40vw] rounded-full bg-red-600/30 blur-[60px] md:blur-[100px] mix-blend-screen transform-gpu"
                />
                <motion.div
                    style={{ willChange: "transform, opacity" }}
                    animate={{
                        x: ["110%", "-10%", "50%", "110%"],
                        y: ["-20%", "20%", "10%", "-20%"],
                        scale: [1.2, 1, 1.5],
                        opacity: [0.1, 0.4, 0.1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 right-1/4 w-[45vw] h-[45vw] md:w-[35vw] md:h-[35vw] rounded-full bg-blue-600/30 blur-[70px] md:blur-[120px] mix-blend-screen transform-gpu"
                />

                {/* Animated Neon Branding (Lightning Effect) */}
                <motion.div
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                    animate={{ opacity: showContent ? 0.25 : 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <div className="font-display text-[14vw] md:text-[10vw] font-black tracking-tighter whitespace-nowrap flex">
                        {letters.map((char, index) => (
                            <motion.span
                                key={index}
                                animate={{
                                    color: ["#111", "#ff0000", "#111", "#ff0000", "#111", "#0048ff", "#111", "#0048ff", "#111"],
                                    textShadow: [
                                        "0 0 0px rgba(255,0,0,0)",
                                        "0 0 20px rgba(255,0,0,1), 0 0 40px rgba(255,0,0,0.8)",
                                        "0 0 0px rgba(255,0,0,0)",
                                        "0 0 20px rgba(255,0,0,1), 0 0 40px rgba(255,0,0,0.8)",
                                        "0 0 0px rgba(255,0,0,0)",
                                        "0 0 20px rgba(0,72,255,1), 0 0 40px rgba(0,72,255,0.8)",
                                        "0 0 0px rgba(255,0,0,0)",
                                        "0 0 20px rgba(0,72,255,1), 0 0 40px rgba(0,72,255,0.8)",
                                        "0 0 0px rgba(255,0,0,0)"
                                    ],
                                    opacity: [0.3, 1, 0.2, 1, 0.2, 1, 0.2, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1.5, // Hızlı polis çakarı efekti
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "linear",
                                    delay: index * 0.05, // Harflerin sırayla patlaması
                                }}
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Content Foreground */}
            <motion.div
                className="relative w-full flex flex-col z-10"
                animate={{
                    opacity: showContent ? 1 : 0,
                    pointerEvents: showContent ? "auto" : "none"
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <div className="container mx-auto px-4 lg:px-8 mb-12 flex justify-between items-end">
                    <div>
                        <h2 className="text-white text-xs md:text-sm uppercase tracking-[0.3em] mb-2 font-medium text-danger">Trending Now</h2>
                        <h3 className="text-3xl md:text-5xl font-display text-white uppercase tracking-tighter mix-blend-difference">Çok Satanlar</h3>
                    </div>
                </div>

                {/* Desktop: Infinite Marquee Slider */}
                <div className="hidden md:flex w-full overflow-hidden transform-gpu">
                    <motion.div
                        className="flex gap-6 px-4 w-max will-change-transform"
                        style={{ willChange: "transform" }}
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 80, // Adjtusted to loop very slowly
                                ease: "linear",
                            },
                        }}
                    >
                        {marqueeItems.map((product, idx) => (
                            <div key={`desktop-${product.id}-${idx}`} className="w-[320px] h-[400px] shrink-0 transform hover:scale-[1.02] transition-transform duration-500 shadow-2xl">
                                <ProductCard
                                    {...product}
                                    className="border border-white/10"
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Mobile: Touch Swipe Carousel (No Animation, Tight Gap) */}
                <div className="flex md:hidden w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                    <div className="flex gap-0 px-0 w-max"> {/* Changed completely adjacent with 0 gap, and full width bleed */}
                        {bestSellers.map((product, idx) => (
                            <div key={`mobile-${product.id}-${idx}`} className="w-[280px] h-[400px] shrink-0 snap-center shadow-2xl relative">
                                <ProductCard
                                    {...product}
                                    className="border-r border-white/10 h-full w-full object-cover" // kept border for separation, made height very tall
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </motion.div>
        </section>
    );
}
