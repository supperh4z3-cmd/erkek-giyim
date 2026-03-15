"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Loader2, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// --- Lookbook Interactive Item Component ---
function LookbookItem({ src, title, description, aspect = "aspect-[4/5]", index, productSlug }: { src: string, title: string, description: string, aspect?: string, index: number, productSlug?: string }) {
    // Parallax effect for the image container
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    // Her resim için hafifçe farklı hızda kayma (paralaks)
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`relative w-full ${aspect} overflow-hidden group bg-neutral-900 border border-[#222]`}
        >
            <motion.div style={{ y }} className="absolute inset-[-10%] w-[120%] h-[120%]">
                <Image
                    src={src}
                    alt={title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                />
            </motion.div>

            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Content & Add to Cart Button */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                    <h3 className="text-white font-display text-2xl uppercase tracking-tighter mix-blend-difference">{title}</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{description}</p>
                </div>

                {/* View Product Link */}
                {productSlug && (
                    <Link
                        href={`/product/${productSlug}`}
                        className="relative w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-danger hover:text-white transition-all duration-300 transform group-hover:-translate-y-2"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </motion.div>
    );
}

export default function CampaignsPage() {
    const [heroTitle, setHeroTitle] = useState("NEON<br/>NIGHTS");
    const [heroSubtitle, setHeroSubtitle] = useState("Karanlığın İçinden");
    const [heroSeason, setHeroSeason] = useState("Winter '26 Capsule");
    const [heroImage, setHeroImage] = useState("/campaign-hero.png");
    const [heroFontFamily, setHeroFontFamily] = useState("font-display");
    const [heroAlignment, setHeroAlignment] = useState("text-center items-center justify-center");
    const [heroTextGradient, setHeroTextGradient] = useState("bg-gradient-to-b from-white to-white/20");
    const [marqueeText, setMarqueeText] = useState("NO COMPROMISE");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/campaigns")
            .then(res => res.json())
            .then(data => {
                if (data.hero) {
                    setHeroTitle(data.hero.title || heroTitle);
                    setHeroSubtitle(data.hero.subtitle || heroSubtitle);
                    setHeroSeason(data.hero.season || heroSeason);
                    setHeroImage(data.hero.image || heroImage);
                    setHeroFontFamily(data.hero.fontFamily || heroFontFamily);
                    setHeroAlignment(data.hero.alignment || heroAlignment);
                    setHeroTextGradient(data.hero.textGradient || heroTextGradient);
                }
                if (data.marqueeText) setMarqueeText(data.marqueeText);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black pt-20">
            {/* HERO SECTION */}
            <section className="relative w-full h-[70vh] md:h-screen flex items-center justify-center border-b border-[#222] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={heroImage}
                        alt="Campaign Hero"
                        fill
                        className="object-cover object-center opacity-40 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
                </div>

                <div className={`relative z-10 w-full h-full flex flex-col p-8 md:p-16 px-4 ${heroAlignment}`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className={heroAlignment.includes("center") ? "text-center" : heroAlignment.includes("left") ? "text-left" : "text-right"}
                    >
                        <p className={`text-danger font-bold tracking-[0.5em] text-xs md:text-sm uppercase mb-6 flex items-center gap-4 ${heroAlignment.includes("center") ? "justify-center" : heroAlignment.includes("left") ? "justify-start" : "justify-end"}`}>
                            <span className={`w-8 h-px bg-danger ${heroAlignment.includes("center") ? "" : "hidden md:block"}`}></span>
                            {heroSeason}
                            <span className={`w-8 h-px bg-danger ${heroAlignment.includes("center") ? "" : "hidden md:block"}`}></span>
                        </p>

                        {/* Dynamic HTML Injection for Line Breaks */}
                        <h1
                            className={`text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-[-0.04em] leading-none ${heroFontFamily} ${heroTextGradient.startsWith('bg-') ? heroTextGradient + ' text-transparent bg-clip-text' : heroTextGradient}`}
                            dangerouslySetInnerHTML={{ __html: heroTitle.replace(/<(?!br\s*\/?)[^>]+>/gi, '').replace(/<br\/?>/gi, '<br/>') }}
                        >
                        </h1>
                        <p className="mt-6 text-white/50 text-xl md:text-2xl tracking-widest uppercase font-mono">{heroSubtitle}</p>
                    </motion.div>
                </div>
            </section>

            {/* EDITORIAL LOOKBOOK MASONRY / ASYMMETRIC GRID */}
            <section className="py-24 px-4 md:px-8 max-w-[1600px] mx-auto">
                <div className="flex justify-between items-end mb-16 border-b border-[#222] pb-6">
                    <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter">Lookbook <span className="text-white/20">01</span></h2>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest hidden sm:block max-w-sm text-right">
                        Sokağın yansımaları. Seçilmiş kombinasyonlar. İncelemek veya sepetinize atmak için görsellere tıklayın.
                    </p>
                </div>

                {/* Aggressive Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                    {/* Item 1 - Massive Left */}
                    <div className="md:col-span-7">
                        <LookbookItem
                            src="/campaign-1.png"
                            title="Distressed Protocol"
                            description="Faded Vintage Hoodie + Denim"
                            aspect="aspect-[3/4]"
                            index={0}
                        />
                    </div>
                    {/* Item 2 - Slim Right */}
                    <div className="md:col-span-5 md:pt-32">
                        <LookbookItem
                            src="/campaign-2.png"
                            title="Heavy Metal"
                            description="Knit Sweater + Steel Chain"
                            aspect="aspect-[4/5]"
                            index={1}
                        />
                    </div>

                    {/* Item 3 - Full Width Banner Middle */}
                    {marqueeText && (
                        <div className="md:col-span-12 mt-16 md:mt-32 border-y border-[#222] py-8 overflow-hidden relative group">
                            {/* Scrolling Marquee text inside the grid */}
                            <div className="whitespace-nowrap flex animate-marquee text-white/10 text-9xl font-display font-black uppercase tracking-tighter pointer-events-none group-hover:text-white/20 transition-colors duration-500">
                                <span className="mx-8">{marqueeText}</span>
                                <span className="mx-8">{marqueeText}</span>
                                <span className="mx-8">{marqueeText}</span>
                            </div>
                        </div>
                    )}

                    {/* Additional Stock Lookbook items reusing other imagery as styling examples */}
                    <div className="md:col-span-4 mt-8 md:mt-24">
                        <LookbookItem
                            src="/product-zipup.png"
                            title="Core Structure"
                            description="Heavyweight Zip-Up Ash"
                            aspect="aspect-square"
                            index={2}
                        />
                    </div>
                    <div className="md:col-span-8 mt-8">
                        <LookbookItem
                            src="/product-cargo.png"
                            title="Urban Utility"
                            description="Dark Shadow Cargo Pant"
                            aspect="aspect-[16/9]"
                            index={3}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}
