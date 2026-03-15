"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface HeroSettings {
    video1: string;
    video2: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
}

const DEFAULT_HERO: HeroSettings = {
    video1: "/hero_video-1.mp4",
    video2: "/hero_video-2.mp4",
    title: "CHASE CHAIN",
    subtitle: "YENİ SEZON KOLEKSİYONU",
    buttonText: "KOLEKSİYONU KEŞFET",
    buttonLink: "/collections/all",
};

export default function HeroVideo() {
    const [currentVideo, setCurrentVideo] = useState<1 | 2>(1);
    const [hero, setHero] = useState<HeroSettings>(DEFAULT_HERO);
    const [loaded, setLoaded] = useState(false);
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.hero) {
                    setHero({
                        video1: data.hero.video1 || DEFAULT_HERO.video1,
                        video2: data.hero.video2 || DEFAULT_HERO.video2,
                        title: data.hero.title || DEFAULT_HERO.title,
                        subtitle: data.hero.subtitle || DEFAULT_HERO.subtitle,
                        buttonText: data.hero.buttonText || DEFAULT_HERO.buttonText,
                        buttonLink: data.hero.buttonLink || DEFAULT_HERO.buttonLink,
                    });
                }
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    // Swap videos when one ends
    const handleVideoEnd = () => {
        if (currentVideo === 1) {
            setCurrentVideo(2);
            videoRef2.current?.play();
            if (videoRef1.current) videoRef1.current.currentTime = 0;
        } else {
            setCurrentVideo(1);
            videoRef1.current?.play();
            if (videoRef2.current) videoRef2.current.currentTime = 0;
        }
    };

    return (
        <section className="relative w-full h-[100svh] overflow-hidden bg-black">
            {/* Dark Overlay for better contrast on white text */}
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none transition-opacity duration-1000" />

            {/* Subtle inside glow/vignette for cinematic Drill aesthetic */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-10 pointer-events-none" />

            {/* Video 1 */}
            <video
                ref={videoRef1}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnd}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentVideo === 1 ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
            >
                <source src={hero.video1} type="video/mp4" />
            </video>

            {/* Video 2 */}
            <video
                ref={videoRef2}
                muted
                playsInline
                onEnded={handleVideoEnd}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentVideo === 2 ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
            >
                <source src={hero.video2} type="video/mp4" />
            </video>

            {/* Centered Giesto-Style Content — API yüklenene kadar gizli */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-white text-center px-4 pt-20 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                <h1 className="font-script text-7xl md:text-9xl transform -rotate-2 -translate-y-4 text-white/90 drop-shadow-2xl">
                    {hero.title}
                </h1>
                <h2 className="font-display uppercase text-3xl md:text-5xl tracking-[0.2em] -translate-x-2">
                    {hero.subtitle}
                </h2>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70 animate-pulse">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Discover</span>
                    <div className="w-[1px] h-12 bg-white/50 relative overflow-hidden">
                        <motion.div
                            animate={{ y: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-1/2 bg-white absolute top-0"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
