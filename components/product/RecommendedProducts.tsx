"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RecProduct {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    priceFormatted: string;
    images: string[];
}

interface RecommendedProductsProps {
    currentProductId?: string;
    currentCategory?: string;
    limit?: number;
}

export default function RecommendedProducts({ currentProductId, currentCategory, limit = 6 }: RecommendedProductsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const [recommendations, setRecommendations] = useState<RecProduct[]>([]);

    // API'den önerilen ürünleri çek
    useEffect(() => {
        const fetchUrl = currentCategory
            ? `/api/products?category=${encodeURIComponent(currentCategory)}`
            : `/api/products`;

        fetch(fetchUrl)
            .then(res => res.json())
            .then((data: RecProduct[]) => {
                // Kendisini çıkar, limit kadar al
                const filtered = data
                    .filter((p: RecProduct) => p.id !== currentProductId)
                    .slice(0, limit);
                setRecommendations(filtered);
            })
            .catch(() => {});
    }, [currentProductId, currentCategory, limit]);

    // Mouse ile bilgisayardan kaydırma fonksiyonları
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeftState - walk;
    };

    if (recommendations.length === 0) return null;

    return (
        <section className="mt-32 pt-16 border-t border-primary-900/10 w-full overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 max-w-[1600px] mb-8">
                <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tighter text-primary-900">
                    You May Also Like
                </h2>
                <p className="text-sm text-primary-900/50 uppercase tracking-widest mt-2 font-bold">
                    Beğenilenler
                </p>
            </div>

            {/* Slider Container */}
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`w-full relative flex overflow-x-auto hide-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-mandatory'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {recommendations.map((product) => (
                    <div
                        key={product.id}
                        className="snap-start shrink-0 w-1/2 md:w-1/3 lg:w-1/4 relative group border-r border-primary-900/10 overflow-hidden bg-[#050505]"
                    >
                        <Link href={`/product/${product.slug}`} className="block relative w-full aspect-[3/4] md:aspect-[4/5]">
                            <Image
                                src={product.images[0] || "/placeholder.jpg"}
                                alt={product.name}
                                fill
                                draggable={false}
                                className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out z-10 opacity-90 group-hover:opacity-100"
                            />
                            {/* Hover Neon Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 z-20 transition-opacity duration-500 group-hover:opacity-40" />

                            {/* Product Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-30 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-white font-display text-lg md:text-xl uppercase tracking-tighter leading-none mb-1">
                                    {product.name}
                                </h3>
                                <p className="text-white/70 font-medium tracking-widest text-xs">
                                    {product.priceFormatted}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
