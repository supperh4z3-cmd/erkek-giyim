"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [faqData, setFaqData] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/policies")
            .then(res => res.json())
            .then(data => {
                setFaqData(data.faq || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-danger selection:text-white px-4 md:px-8 pb-32 pt-32">
            <div className="max-w-[1000px] mx-auto">
                <div className="mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter mb-4"
                    >
                        S.S.S.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-danger font-bold tracking-widest text-sm uppercase"
                    >
                        Sıkça Sorulan Sorular
                    </motion.p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="border border-[#222] bg-[#0a0a0a] overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full text-left px-6 py-8 flex items-center justify-between group hover:bg-[#111] transition-colors"
                                >
                                    <h3 className="text-xl md:text-2xl font-display uppercase font-bold pr-8 transition-colors group-hover:text-danger">
                                        <span className="text-white/20 mr-4">0{index + 1}</span>
                                        {item.question}
                                    </h3>
                                    <div className="text-white/50 group-hover:text-danger transition-colors shrink-0">
                                        {isOpen ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-6 pb-8 pt-0 text-white/60 text-lg leading-relaxed font-medium">
                                                <div className="h-px w-12 bg-danger/50 mb-6" />
                                                <p>{item.answer}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
