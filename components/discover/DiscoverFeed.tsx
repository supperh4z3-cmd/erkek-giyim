"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";

const THEME_BG_MAP = {
    "danger": "bg-danger",
    "blue-600": "bg-blue-600",
    "purple-600": "bg-purple-600",
    "zinc-400": "bg-zinc-400"
};

export default function DiscoverFeed() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [slides, setSlides] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editorProducts, setEditorProducts] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/discover")
            .then(res => res.json())
            .then(data => {
                if (data.slides) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setSlides(data.slides.map((s: any) => ({
                        id: s.id,
                        video: s.video,
                        title: s.title,
                        subtitle: s.subtitle,
                        theme: s.theme,
                        product: {
                            name: s.productName || s.product?.name || "",
                            price: s.productPrice || s.product?.price || "",
                            image: s.productImage || s.product?.image || "",
                            link: s.productLink || s.product?.link || "",
                        },
                        textEffect: s.textEffect,
                    })));
                }
                if (data.editorProducts) {
                    setEditorProducts(data.editorProducts);
                }
            })
            .catch(() => {});
    }, []);

    const [hasEntered, setHasEntered] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    // Slides yüklendiğinde scroll'u en başa al
    useEffect(() => {
        if (slides.length > 0 && scrollContainerRef.current) {
            // Bir frame bekle ki DOM güncellensin
            requestAnimationFrame(() => {
                scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
            });
        }
    }, [slides]);

    // Initial enter action to play music
    const handleEnter = () => {
        setHasEntered(true);
        // İlk videoya scroll et
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
        }
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Intersection observer to track which slide is active
    useEffect(() => {
        if (!hasEntered || !scrollContainerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"));
                        setActiveSlide(index);

                        // Play video if intersecting
                        const video = entry.target.querySelector("video");
                        if (video) {
                            video.currentTime = 0;
                            video.play().catch(e => console.log("Video play failed", e));
                        }
                    } else {
                        // Pause video if not intersecting
                        const video = entry.target.querySelector("video");
                        if (video) video.pause();
                    }
                });
            },
            { threshold: 0.6 } // Needs to be 60% visible to become active
        );

        const slides = scrollContainerRef.current.querySelectorAll(".discover-slide");
        slides.forEach((slide) => observer.observe(slide));

        return () => {
            slides.forEach((slide) => observer.unobserve(slide));
        };
    }, [hasEntered]);

    return (
        <div className="discover-feed-active relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col items-center">
            {/* Background Audio */}
            <audio
                ref={audioRef}
                src="/discover-beat.mp3"
                loop
                className="hidden"
            />

            {/* Intro Overlay */}
            <AnimatePresence>
                {!hasEntered && (
                    <motion.div
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    >
                        <div className="text-center">
                            <h1 className="text-4xl md:text-8xl font-display uppercase tracking-tighter mb-8 font-bold">
                                Sokağın <span className="text-danger italic">Ritmi</span>
                            </h1>
                            <button
                                onClick={handleEnter}
                                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-danger hover:text-white transition-all duration-300"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span>Vibe&apos;a Gir (Sesi Aç)</span>
                                <div className="absolute inset-0 border border-white scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                            </button>
                            <p className="mt-8 text-white/40 text-xs tracking-widest uppercase">Lütfen Sesi Açık Tutunuz</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Audio Toggle Button */}
            <AnimatePresence>
                {hasEntered && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={toggleMute}
                        className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Vertical Snapping Feed Container */}
            <div
                ref={scrollContainerRef}
                className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative z-10"
                style={{ scrollBehavior: "smooth" }}
            >
                {slides.map((slide, index) => {
                    const isActive = activeSlide === index;
                    const bgThemeClass = THEME_BG_MAP[slide.theme as keyof typeof THEME_BG_MAP];

                    return (
                        <div
                            key={slide.id}
                            data-index={index}
                            className="discover-slide w-full h-[100dvh] snap-start relative flex items-center justify-center overflow-hidden"
                        >
                            {/* Video Background */}
                            <video
                                src={slide.video}
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover scale-105"
                                style={{ filter: "brightness(0.6) contrast(1.1)" }}
                            />

                            {/* Center Title Layout */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none z-20">
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1, rotate: -4 }}
                                            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
                                            className="flex flex-col items-center origin-center"
                                        >
                                            <h2 className={`text-5xl md:text-8xl font-display font-black uppercase tracking-tighter text-white ${slide.textEffect || 'animate-police-strobe'}`}>
                                                {slide.title}
                                            </h2>
                                            <p className="mt-4 text-sm md:text-lg tracking-[0.2em] uppercase text-white/80 drop-shadow-md">
                                                {slide.subtitle}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Shop The Look (Editor's Choice) Module */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                        className="absolute bottom-12 left-4 md:left-12 z-30 pointer-events-auto"
                                    >
                                        <div className="mb-3">
                                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${bgThemeClass} animate-pulse`} />
                                                Editörün Seçimi
                                            </span>
                                        </div>

                                        <Link href={slide.product.link} className="block group">
                                            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-3 pr-6 rounded-2xl hover:bg-black/60 hover:border-white/30 transition-all duration-300 relative overflow-hidden">
                                                {/* Neon Glow Behind Product */}
                                                <div className={`absolute -left-10 h-full w-20 ${bgThemeClass} opacity-30 blur-[30px]`} />

                                                <div className="w-16 h-20 md:w-20 md:h-24 relative bg-[#0f0f0f] rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={slide.product.image}
                                                        alt={slide.product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h3 className="text-sm md:text-base font-bold text-white leading-tight uppercase tracking-tight">
                                                        {slide.product.name}
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-white/60 mt-1">{slide.product.price}</p>
                                                    <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-white group-hover:text-danger transition-colors">
                                                        Kombini İncele <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress & Swipe Indication */}
                            <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
                                {slides.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1 rounded-full bg-white transition-all duration-500 ${i === activeSlide ? 'h-8 opacity-100' : 'h-2 opacity-30'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Final Editor's Choice Grid Slide */}
                <div className="discover-slide w-full min-h-[100dvh] snap-start relative flex flex-col pt-24 pb-12 px-4 md:px-12 bg-[#050505] overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30, rotate: -2 }}
                        whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter text-white mb-2 animate-police-strobe text-center">
                            EDİTÖRÜN SEÇİMİ
                        </h2>
                        <p className="text-center text-white/50 text-sm uppercase tracking-[0.2em] mb-12">The Final Look</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-[1400px] mx-auto w-full pb-20 grid-flow-row-dense">
                        {editorProducts.map((product) => {
                            const productLink = product.link || "";
                            const innerContent = (
                                <>
                                    <div className={`relative w-full ${product.isLarge ? 'h-64 md:h-[600px]' : 'h-64 md:h-[288px]'} overflow-hidden`}>
                                        <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-white font-bold uppercase tracking-widest text-sm">{product.title}</h3>
                                        <p className="text-white/60 text-xs mt-1">{product.price}</p>
                                    </div>
                                </>
                            );
                            const baseClass = `group block relative bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all ${product.isLarge ? 'col-span-2 row-span-2' : ''}`;

                            return productLink ? (
                                <Link href={productLink} key={product.id} className={baseClass}>
                                    {innerContent}
                                </Link>
                            ) : (
                                <div key={product.id} className={baseClass}>
                                    {innerContent}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Injection (Snaps on next scroll) */}
                <div className="snap-start w-full" id="discover-footer-wrapper">
                    <Footer />
                </div>

            </div>

            {/* Global Hide Scrollbar CSS injection just for this component */}
            <style jsx global>{`
                /* Hide the default global footer when discover feed is active */
                body:has(.discover-feed-active) > footer {
                    display: none !important;
                }
                /* Show footer inside our wrapper */
                #discover-footer-wrapper footer {
                    display: block !important;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes police-strobe {
                    0%, 39% {
                        text-shadow: 0 0 10px rgba(255, 0, 0, 0.9), 0 0 20px rgba(255, 0, 0, 0.7);
                    }
                    40%, 49% {
                        text-shadow: none;
                    }
                    50%, 89% {
                        text-shadow: 0 0 10px rgba(37, 99, 235, 0.9), 0 0 20px rgba(37, 99, 235, 0.7);
                    }
                    90%, 100% {
                        text-shadow: none;
                    }
                }
                .animate-police-strobe {
                    animation: police-strobe 0.6s infinite;
                }
                @keyframes glitch-text {
                    0% { transform: translate(0); text-shadow: none; }
                    20% { transform: translate(-2px, 2px); text-shadow: -2px 0 red, 2px 0 blue; }
                    40% { transform: translate(-2px, -2px); text-shadow: -2px 0 red, 2px 0 blue; }
                    60% { transform: translate(2px, 2px); text-shadow: -2px 0 red, 2px 0 blue; }
                    80% { transform: translate(2px, -2px); text-shadow: -2px 0 red, 2px 0 blue; }
                    100% { transform: translate(0); text-shadow: none; }
                }
                .animate-glitch-text { animation: glitch-text 0.3s infinite; }

                @keyframes neon-pulse {
                    0%, 100% { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #ff00de, 0 0 70px #ff00de, 0 0 80px #ff00de, 0 0 100px #ff00de; }
                    50% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de, 0 0 35px #ff00de, 0 0 40px #ff00de, 0 0 50px #ff00de; }
                }
                .animate-neon-pulse { animation: neon-pulse 1.5s ease-in-out infinite alternate; }

                @keyframes ghost-fade {
                    0% { opacity: 0.2; transform: scale(0.95); filter: blur(4px); }
                    50% { opacity: 1; transform: scale(1.05); filter: blur(0px); }
                    100% { opacity: 0.2; transform: scale(0.95); filter: blur(4px); }
                }
                .animate-ghost-fade { animation: ghost-fade 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
