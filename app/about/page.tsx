"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

// --- Custom Component: Scroll Reveal By Line ---
// As you scroll down, lines of text light up/turn white from gray
function ScrollRevealParagraph({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <div className="flex flex-col gap-2">
            {lines.map((line, i) => (
                <ScrollRevealLine key={i} line={line} />
            ))}
        </div>
    );
}

function ScrollRevealLine({ line }: { line: string }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 80%", "end 50%"]
    });

    // Animate color from gray (opacity 0.2) to white (opacity 1)
    const color = useTransform(scrollYProgress, [0, 1], ["rgba(255,255,255,0.1)", "rgba(255,255,255,1)"]);

    return (
        <motion.p ref={ref} style={{ color }} className="font-display font-black text-4xl md:text-6xl lg:text-8xl uppercase tracking-tighter leading-none">
            {line}
        </motion.p>
    );
}

export default function AboutPage() {
    const heroRef = useRef(null);
    const { scrollYProgress: heroScroll } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const heroY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
    const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0]);

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-danger selection:text-white px-4 md:px-8 pb-32 pt-20 overflow-hidden">

            {/* HERITAGE / BRAND HERO */}
            <section ref={heroRef} className="relative w-full h-[80vh] flex flex-col justify-end pb-20 border-b border-[#222]">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                        src="/about-hero-texture.png"
                        alt="Raw Denim Texture"
                        fill
                        className="object-cover opacity-30 mix-blend-luminosity saturate-0 grayscale"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
                </motion.div>

                <div className="relative z-10 max-w-[1600px] w-full mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-[12vw] font-black font-display uppercase tracking-[-0.05em] leading-[0.8] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30"
                    >
                        NO FILTER.<br />
                        JUST RAW<br />
                        <span className="text-danger">IDENTITY.</span>
                    </motion.h1>
                </div>
            </section>

            {/* MANIFESTO SCROLL REVEAL */}
            <section className="py-32 md:py-48 max-w-[1400px] mx-auto">
                <div className="mb-16">
                    <p className="text-danger text-sm font-bold tracking-[0.3em] uppercase mb-8">01. MANIFESTO</p>
                </div>
                {/* Her satır Scroll edildikçe parlayacak */}
                <ScrollRevealParagraph text={"Biz sokağın\nsessizliğini\nreddedenleriz.\nSıradanlığı değil\nkaliteyi\nyüceltenleriz."} />
            </section>

            {/* THE WORKSHOP / PROCESS PARALLAX */}
            <section className="relative w-full py-32 border-y border-[#222]">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="/about-workshop.png"
                        alt="Workshop Sparks"
                        fill
                        className="object-cover object-center grayscale"
                    />
                    <div className="absolute inset-0 bg-[#050505]/70" />
                </div>

                <div className="relative z-10 max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
                    <div className="flex flex-col justify-center">
                        <p className="text-danger text-sm font-bold tracking-[0.3em] uppercase mb-8">02. İŞÇİLİK (CRAFT)</p>
                        <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-8 leading-none">
                            Tavizsiz <br /><span className="text-white/40">Materyaller.</span>
                        </h2>
                        <div className="space-y-6 text-white/70 max-w-lg text-lg sm:text-xl font-medium leading-relaxed">
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                Her dikişte, her metal detayda sokağın sertliğini ve lüksün dokusunu birleştiriyoruz.
                                Sadece giymek için değil, hayatta kalmak ve iz bırakmak için üretiyoruz.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: 0.2 }}
                            >
                                Hızlı tüketime karşı duruyoruz. Ürettiğimiz her parça, yıllanmak ve sahibinin karakterini yansıtmak için tasarlanıyor.
                            </motion.p>
                        </div>
                    </div>

                    {/* Aggressive Visual Block */}
                    <div className="relative aspect-[3/4] bg-[#111] border border-[#333] overflow-hidden group">
                        <motion.div
                            className="absolute inset-0"
                            initial={{ scale: 1.2 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            viewport={{ once: true }}
                        >
                            <Image
                                src="/about-hero-texture.png"
                                alt="Detail"
                                fill
                                className="object-cover mix-blend-overlay opacity-60 group-hover:opacity-100 transition-opacity duration-1000"
                            />
                        </motion.div>
                        <div className="absolute bottom-8 left-8 right-8">
                            <div className="h-px w-full bg-white/20 mb-4" />
                            <p className="font-display text-2xl uppercase tracking-widest text-white">HEAVYWEIGHT FOUNDATION</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE STREET RHYTHM / CONCLUSION */}
            <section className="pt-32 pb-16 max-w-[1400px] mx-auto text-center">
                <p className="text-danger text-sm font-bold tracking-[0.3em] uppercase mb-16">03. Sokağın Ritmi</p>

                <h2 className="text-5xl md:text-8xl lg:text-[9rem] font-display font-black uppercase tracking-[-0.05em] leading-[0.8] mb-12">
                    SOKAK <br /> BİZİM <br /> <span className="text-white/20">VİTRİNİMİZ.</span>
                </h2>

                <p className="text-white/50 text-base md:text-xl max-w-2xl mx-auto mb-20">
                    Chase & Chain, sadece bir giyim markası değil. Şehrin yer altından beslenen, betonarme cangılında kendi kurallarını yazanların üniformasıdır.
                </p>

                {/* Footer bağlantısı sağlamak veya devam etmek için bir anchor animasyonu */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-px h-24 bg-gradient-to-b from-danger to-transparent mx-auto"
                />
            </section>

        </main>
    );
}
