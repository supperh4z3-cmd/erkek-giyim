"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SearchProduct {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    priceFormatted: string;
    images: string[];
    badge?: "new" | "sale";
    discountPercentage?: number;
}

const POPULAR_TAGS = ["Hoodie", "Denim", "Cargo", "Oversized", "Chain", "Boots"];

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState<SearchProduct[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setTimeout(() => inputRef.current?.focus(), 300);
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleClose = () => {
        setQuery("");
        setDebouncedQuery("");
        setFilteredProducts([]);
        onClose();
    };

    // Debounce search query (300ms)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    // API'den arama yap
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setFilteredProducts([]);
            return;
        }
        fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}`)
            .then(res => res.json())
            .then((data: SearchProduct[]) => setFilteredProducts(data))
            .catch(() => setFilteredProducts([]));
    }, [debouncedQuery]);

    // Close on ESC
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] bg-[#050505]/98 backdrop-blur-md flex flex-col"
                >
                    {/* Close Button */}
                    <div className="flex justify-end p-6 md:p-8">
                        <button
                            onClick={handleClose}
                            className="text-white/60 hover:text-danger transition-colors"
                            aria-label="Close search"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Search Input Area */}
                    <div className="flex-1 flex flex-col items-center px-4 md:px-8 overflow-y-auto">
                        <motion.div
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="w-full max-w-[800px] mt-8 md:mt-16"
                        >
                            <div className="relative flex items-center border-b-2 border-white/20 focus-within:border-danger transition-colors pb-4">
                                <Search className="w-7 h-7 text-white/40 mr-4 shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ürün veya kategori ara..."
                                    className="w-full bg-transparent text-white text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter placeholder:text-white/15 focus:outline-none caret-danger"
                                />
                            </div>
                        </motion.div>

                        {/* Content Area */}
                        <div className="w-full max-w-[800px] mt-12 pb-20">
                            {query.trim() === "" ? (
                                /* Popular Tags */
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-6">
                                        Popüler Aramalar
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {POPULAR_TAGS.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => setQuery(tag)}
                                                className="px-5 py-3 border border-white/15 text-white/60 hover:border-danger hover:text-danger transition-colors text-sm font-bold uppercase tracking-widest"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : filteredProducts.length === 0 ? (
                                /* No Results */
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <p className="text-white/30 font-display text-2xl uppercase tracking-widest">
                                        Sonuç bulunamadı.
                                    </p>
                                    <p className="text-white/15 text-sm mt-2 uppercase tracking-widest font-medium">
                                        Farklı bir anahtar kelime deneyin.
                                    </p>
                                </motion.div>
                            ) : (
                                /* Results Grid */
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-6">
                                        {filteredProducts.length} Sonuç
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {filteredProducts.map((product, index) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.slug}`}
                                                onClick={handleClose}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="group"
                                                >
                                                    <div className="aspect-[3/4] relative bg-[#111] border border-[#222] overflow-hidden mb-3 group-hover:border-danger/50 transition-colors">
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        {product.badge && (
                                                            <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${product.badge === "new" ? "bg-white text-black" : "bg-danger text-white"}`}>
                                                                {product.badge === "new" ? "Yeni" : `-%${product.discountPercentage}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors line-clamp-1 uppercase tracking-wide">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">
                                                        {product.category}
                                                    </p>
                                                    <p className="text-sm font-bold text-white/70 mt-1">
                                                        {product.priceFormatted}
                                                    </p>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
