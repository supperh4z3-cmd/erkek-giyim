"use client";

import { motion } from "framer-motion";

export default function AnimatedPhilosophyText() {
    return (
        <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 relative z-10">
            {/* The line-height is bumped from 1.05 to 1.15 stringently prevent dot clashes in Turkish (Ü, ö, vs) */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-tighter leading-[1.15] mb-8">
                <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="block text-neutral-500 mb-1"
                >
                    Sokak Kültürünü
                </motion.span>
                <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="block text-white mb-1"
                >
                    Yeniden
                </motion.span>
                <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="block text-white"
                >
                    Tanımlıyoruz
                </motion.span>
            </h2>

            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "4rem" }} // width-16 = 4rem
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.0 }}
                className="h-1 bg-danger mb-8"
            />

            <motion.p
                initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
                className="text-neutral-400 md:text-lg max-w-md mb-10 font-medium leading-relaxed"
            >
                Ürünlerimiz, mükemmel döküm ve kusursuz &quot;clean drill&quot; estetiği için imzamız olan oversize kalıplarla, özel üretim yoğun (heavyweight) koton kumaşlardan üretilmektedir.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
            >
                <a href="/about" className="inline-flex items-center gap-4 text-white border border-white/20 px-8 py-4 text-sm tracking-widest uppercase font-bold hover:bg-white hover:text-black transition-colors w-fit group">
                    Hikayemizi Keşfet
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
            </motion.div>
        </div>
    );
}
