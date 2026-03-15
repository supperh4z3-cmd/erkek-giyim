"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ProductListCard from "@/components/product/ProductListCard";
import FilterSidebar from "@/components/ui/FilterSidebar";

interface CatalogProduct {
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
    isNewSeason?: boolean;
    isBestSeller?: boolean;
    sizes: { size: string; stock: number }[];
    colors: { name: string; hex: string }[];
    [key: string]: unknown;
}

export default function CollectionsPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then((data: CatalogProduct[]) => {
                setProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "popular") return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        return 0;
    });

    return (
        <main className="min-h-screen bg-background text-primary-900 pb-32 overflow-x-hidden">

            {/* Streetwear Hero Header */}
            <div className="w-full bg-[#0a0a0a] text-white pt-32 pb-20 mb-8 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 right-10 w-64 h-64 bg-danger/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="flex flex-col gap-6 w-full md:w-2/3">
                        {/* Technical Breadcrumbs */}
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#fcfcfc]/50">
                            <Link href="/" className="hover:text-white transition-colors">SYS_HOME</Link>
                            <span className="text-danger">/</span>
                            <Link href="/collections" className="hover:text-white transition-colors">ARCHIVE</Link>
                            <span className="text-danger">/</span>
                            <span className="text-white border-b border-white pb-0.5">ALL_PRODUCTS</span>
                        </div>

                        {/* Custom CSS for Static Neon Hover Glow */}
                        <style>{`
                            .neon-hover-static {
                                filter: drop-shadow(-10px 0 20px rgba(239, 68, 68, 0.8)) drop-shadow(10px 0 20px rgba(59, 130, 246, 0.8));
                            }
                        `}</style>

                        {/* Massive Typography */}
                        <div className="relative inline-block group cursor-pointer mt-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] leading-[0.85] tracking-tight relative z-10 group-hover:opacity-0 transition-opacity duration-300"
                            >
                                THE <br className="hidden md:block" /> ARCHIVE<span className="text-danger">.</span>
                            </motion.h1>

                            {/* Hover Half-and-Half Neon Outline */}
                            <span
                                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] leading-[0.85] tracking-tight absolute inset-0 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700 neon-hover-static"
                                style={{
                                    backgroundImage: "linear-gradient(to right, #ef4444 0%, #ef4444 50%, #3b82f6 50%, #3b82f6 100%)",
                                    WebkitBackgroundClip: "text",
                                    color: "transparent"
                                }}
                            >
                                THE <br className="hidden md:block" /> ARCHIVE<span className="text-transparent">.</span>
                            </span>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col items-start md:items-end text-left md:text-right" style={{ justifyContent: 'flex-end', height: '100%' }}>
                        <div className="h-[2px] w-12 bg-danger mb-4 mt-auto"></div>
                        <p className="text-sm md:text-base font-medium text-white/70 max-w-sm uppercase tracking-wide">
                            Explore the complete CHASE & CHAIN index. Premium materials, uncompromising cuts, engineered for the streets.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="border-t border-[#1a1a1a]/10">
                <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-start gap-8 lg:gap-12 pt-8">

                    {/* Filter Sidebar */}
                    <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

                    {/* Product Grid Area */}
                    <div className="flex-1 w-full relative">
                        {/* Toolbar (Mobile Filters Toggle & Sorting) */}
                        <div className="sticky top-16 lg:top-[72px] z-30 bg-background/90 backdrop-blur-md border-b border-[#1a1a1a]/10 px-0 py-4 flex items-center justify-between mb-6">
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="lg:hidden flex items-center gap-2 text-primary-900 font-bold uppercase tracking-widest text-xs"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                            </button>

                            <div className="hidden lg:block text-sm text-primary-900/50 font-medium">
                                Showing <span className="text-primary-900 font-bold">{sortedProducts.length}</span> Results
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-widest text-primary-900/50 hidden md:block">SORT BY:</span>
                                <select
                                    className="bg-transparent border-none text-primary-900 font-bold uppercase tracking-widest text-xs outline-none cursor-pointer"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-32">
                                <Loader2 className="w-8 h-8 text-primary-900/30 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 w-full gap-4 md:gap-6">
                                {sortedProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group"
                                    >
                                        <ProductListCard {...product} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
