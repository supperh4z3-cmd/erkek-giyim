"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const SLIDES = [
    {
        id: "slide-1",
        titleLines: [
            { text: "Sokak Kültürünü", color: "text-neutral-500" },
            { text: "Yeniden", color: "text-white" },
            { text: "Tanımlıyoruz", color: "text-white" }
        ],
        description: "Ürünlerimiz, mükemmel döküm ve kusursuz \"clean drill\" estetiği için imzamız olan oversize kalıplarla, özel üretim yoğun (heavyweight) koton kumaşlardan üretilmektedir.",
        images: [
            "/brand-face-1.png", // Tall Left
            "/brand-face-3.png", // Top Right
            "/brand-face-2.png", // Bottom Right
        ]
    },
    {
        id: "slide-2",
        titleLines: [
            { text: "Her Detayda", color: "text-neutral-500" },
            { text: "Kusursuz", color: "text-white" },
            { text: "İşçilik", color: "text-white" }
        ],
        description: "Sınırlı sayıda üretilen kapsül koleksiyonlarımız, endüstri standartlarını aşan dikiş kalitesi ve tavizsiz kumaş seçimleriyle sokak modasının zirvesini temsil ediyor.",
        images: [
            "/slide2_1.png", // Tall Left (Back hoodie drape)
            "/slide2_2.png", // Top Right (Denim zipper macro)
            "/slide2_3.png", // Bottom Right (Silver rings collar adjust)
        ]
    },
    {
        id: "slide-3",
        titleLines: [
            { text: "Sokağın Saf", color: "text-neutral-500" },
            { text: "Gerçekliği", color: "text-white" },
            { text: "Ve Duruş", color: "text-danger" }
        ],
        description: "Karanlık sokakların ritminden ilham alan tasarım anlayışımız, hiçbir kurala bağlı kalmadan tavizsiz bir güç ve premium lüks hissiyat sunar.",
        images: [
            "/slide3_1.png", // Tall Left (Full shot dark alley model)
            "/slide3_2.png", // Top Right (Macro silver chain)
            "/slide3_3.png", // Bottom Right (Profile red/blue neon street)
        ]
    }
];

export default function PhilosophyCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance loop every 8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const slide = SLIDES[currentIndex];

    return (
        <section className="relative w-full bg-[#111] py-24 md:py-32 overflow-hidden min-h-[800px] flex items-center">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* Text Content */}
                    <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 relative z-10 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`text-${slide.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="flex flex-col"
                            >
                                {/* Title Lines */}
                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-tighter leading-[1.15] mb-8">
                                    {slide.titleLines.map((line, idx) => (
                                        <motion.span
                                            key={idx}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.2 }}
                                            className={`block ${line.color} mb-1`}
                                        >
                                            {line.text}
                                        </motion.span>
                                    ))}
                                </h2>

                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "4rem" }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                                    className="h-1 bg-danger mb-8"
                                />

                                <motion.p
                                    initial={{ opacity: 0, filter: "blur(5px)" }}
                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
                                    className="text-neutral-400 md:text-lg max-w-md mb-10 font-medium leading-relaxed"
                                >
                                    {slide.description}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 1.0 }}
                                >
                                    <a href="/about" className="inline-flex items-center gap-4 text-white border border-white/20 px-8 py-4 text-sm tracking-widest uppercase font-bold hover:bg-white hover:text-black transition-colors w-fit group">
                                        Hikayemizi Keşfet
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </a>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Asymmetrical Image Grid */}
                    <div className="lg:col-span-7 order-1 lg:order-2 h-full flex items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`images-${slide.id}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                className="grid grid-cols-2 gap-0 auto-rows-[250px] md:auto-rows-[350px] w-full"
                            >
                                {/* Tall Left Image */}
                                <div className="relative col-span-1 row-span-2 overflow-hidden group mix-blend-luminosity hover:mix-blend-normal transition-all duration-700">
                                    <Image
                                        src={slide.images[0]}
                                        alt="Philosophy Visual 1"
                                        fill
                                        className="object-cover transition-transform duration-[15s] group-hover:scale-110 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />
                                </div>
                                {/* Top Right Detail Image */}
                                <div className="relative col-span-1 row-span-1 overflow-hidden group mix-blend-luminosity hover:mix-blend-normal transition-all duration-700">
                                    <Image
                                        src={slide.images[1]}
                                        alt="Philosophy Visual 2"
                                        fill
                                        className="object-cover transition-transform duration-[15s] group-hover:scale-110 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />
                                </div>
                                {/* Bottom Right Profile Image */}
                                <div className="relative col-span-1 row-span-1 overflow-hidden group mix-blend-luminosity hover:mix-blend-normal transition-all duration-700">
                                    <Image
                                        src={slide.images[2]}
                                        alt="Philosophy Visual 3"
                                        fill
                                        className="object-cover transition-transform duration-[15s] group-hover:scale-110 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}
