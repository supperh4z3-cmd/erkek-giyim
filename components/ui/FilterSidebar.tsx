"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        category: true,
        size: true,
        color: true,
        price: false,
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const categories = ["T-SHIRTS", "BOTTOMS", "OUTWEAR", "KNITWEAR", "DENIM STUDIO"];
    const sizes = ["S", "M", "L", "XL", "XXL"];
    const colors = [
        { name: "VINTAGE ASH", hex: "#8c8c8c" },
        { name: "WASHED BLACK", hex: "#1a1a1a" },
        { name: "CRIMSON RED", hex: "#8b0000" },
        { name: "NAVY BLUE", hex: "#000080" },
        { name: "EARTH BROWN", hex: "#5c4033" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Slide-over on Mobile / Sticky on Desktop) */}
            <aside
                className={`fixed lg:sticky top-0 lg:top-24 left-0 h-screen lg:h-[calc(100vh-6rem)] w-[85vw] max-w-[320px] lg:w-[280px] lg:max-w-none bg-white border-r border-[#1a1a1a]/10 z-50 lg:z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1a1a1a]/10">
                        <div className="flex items-center gap-2 text-primary-900">
                            <SlidersHorizontal className="w-5 h-5" />
                            <span className="font-display uppercase tracking-widest text-lg">FILTERS</span>
                        </div>
                        <button onClick={onClose} className="lg:hidden text-primary-900/50 hover:text-primary-900 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Filter Sections */}
                    <div className="flex flex-col gap-6">
                        {/* Category Filter */}
                        <div className="border-b border-[#1a1a1a]/10 pb-6">
                            <button
                                onClick={() => toggleSection('category')}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest text-primary-900/50">CATEGORY</span>
                                {openSections['category'] ? <ChevronUp className="w-4 h-4 text-primary-900/50" /> : <ChevronDown className="w-4 h-4 text-primary-900/50" />}
                            </button>
                            <AnimatePresence>
                                {openSections['category'] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-3 mt-4">
                                            {categories.map(cat => (
                                                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center w-4 h-4 border border-[#1a1a1a]/20 group-hover:border-primary-900 transition-colors">
                                                        <input type="checkbox" className="peer sr-only" />
                                                        <div className="w-2 h-2 bg-primary-900 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                    </div>
                                                    <span className="text-sm font-medium text-primary-900/80 group-hover:text-primary-900 transition-colors uppercase tracking-widest">{cat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Size Filter */}
                        <div className="border-b border-[#1a1a1a]/10 pb-6">
                            <button
                                onClick={() => toggleSection('size')}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest text-primary-900/50">SIZE</span>
                                {openSections['size'] ? <ChevronUp className="w-4 h-4 text-primary-900/50" /> : <ChevronDown className="w-4 h-4 text-primary-900/50" />}
                            </button>
                            <AnimatePresence>
                                {openSections['size'] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            {sizes.map(size => (
                                                <label key={size} className="cursor-pointer group">
                                                    <input type="checkbox" className="peer sr-only" />
                                                    <div className="flex items-center justify-center py-2 border border-[#1a1a1a]/10 text-sm font-bold text-primary-900/50 hover:border-primary-900 hover:text-primary-900 peer-checked:bg-primary-900 peer-checked:text-white peer-checked:border-primary-900 transition-all">
                                                        {size}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Color Filter */}
                        <div className="pb-6">
                            <button
                                onClick={() => toggleSection('color')}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-bold text-xs uppercase tracking-widest text-primary-900/50">COLOR</span>
                                {openSections['color'] ? <ChevronUp className="w-4 h-4 text-primary-900/50" /> : <ChevronDown className="w-4 h-4 text-primary-900/50" />}
                            </button>
                            <AnimatePresence>
                                {openSections['color'] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-3 mt-4">
                                            {colors.map(color => (
                                                <label key={color.name} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center">
                                                        <input type="checkbox" className="peer sr-only" />
                                                        <div
                                                            className="w-5 h-5 rounded-full border border-black/10 peer-checked:ring-2 ring-primary-900 ring-offset-2 transition-all"
                                                            style={{ backgroundColor: color.hex }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-primary-900/80 group-hover:text-primary-900 transition-colors">{color.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Apply Filters (Mobile Only) */}
                    <div className="mt-8 lg:hidden">
                        <button onClick={onClose} className="w-full bg-primary-900 text-white font-bold uppercase tracking-widest py-4 text-xs hover:bg-black transition-colors">
                            APPLY FILTERS
                        </button>
                    </div>

                </div>
            </aside>
        </>
    );
}
