"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
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
    totalStock?: number;
    className?: string;
    [key: string]: unknown;
}

export default function ProductCard({
    id,
    slug,
    name,
    category,
    priceFormatted,
    oldPriceFormatted,
    images,
    badge,
    discountPercentage,
    totalStock,
    className
}: ProductCardProps) {
    const { customer } = useAuth();
    const router = useRouter();
    const [liked, setLiked] = useState(false);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!customer) { router.push("/login"); return; }
        try {
            if (liked) {
                await fetch(`/api/customer/favorites?productId=${id}`, { method: "DELETE" });
                setLiked(false);
            } else {
                await fetch("/api/customer/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: id }),
                });
                setLiked(true);
            }
        } catch { /* silently fail */ }
    };

    const image = images[0] || "/placeholder.jpg";
    const isSoldOut = totalStock !== undefined && totalStock === 0;

    return (
        <div className={`group cursor-pointer flex flex-col w-full h-full bg-white border-b border-r border-border hover:bg-neutral-50 transition-colors duration-500 overflow-hidden ${className || ""}`}>

            <Link href={`/product/${slug}`} className="relative w-full flex-1 min-h-0 block overflow-hidden bg-[#fcfcfc]">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {isSoldOut && (
                        <span className="bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                            Tükendi
                        </span>
                    )}
                    {!isSoldOut && badge === "new" && (
                        <span className="bg-primary-900 text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                            New
                        </span>
                    )}
                    {!isSoldOut && badge === "sale" && discountPercentage && (
                        <span className="bg-danger text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Favorite Action */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        className={`hover:text-white hover:bg-danger p-2.5 shadow-sm transition-all duration-300 transform group-hover:scale-110 rounded-sm ${liked ? 'bg-danger text-white' : 'bg-white text-primary-900'}`}
                        aria-label="Add to favorites"
                        onClick={handleFavorite}
                    >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
                    </button>
                </div>

                {/* Main Product Image */}
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                />

                {/* Subtle Image Overlay on Hover */}
                <div className={`absolute inset-0 transition-colors duration-500 ${
                    isSoldOut ? "bg-black/40" : "bg-black/0 group-hover:bg-black/5"
                }`} />
            </Link>

            {/* Product Details - Solid Block (Compact Standard Layout) */}
            <div className="flex-none flex flex-col justify-between p-3 md:p-4 bg-white relative z-10 transition-colors duration-300">
                {/* Animated Sharp Top Border */}
                <div className="absolute top-0 left-0 h-[1px] bg-primary-900 w-0 group-hover:w-full transition-all duration-700 ease-out" />
                <div className="absolute top-0 right-0 h-[2px] bg-danger w-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out delay-100" />

                <div className="flex flex-col gap-1 md:gap-0.5">
                    <Link href={`/product/${slug}`} className="block group/text">
                        <h4 className="font-display text-primary-900 text-base md:text-lg uppercase tracking-tighter group-hover/text:text-danger transition-colors line-clamp-2">
                            {name}
                        </h4>
                    </Link>
                    <p className="text-accent-muted text-[10px] md:text-xs font-medium uppercase tracking-widest mb-1.5">
                        {category}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-primary-900 font-display text-base md:text-lg">
                            {priceFormatted}
                        </span>
                        {oldPriceFormatted && (
                            <span className="text-danger line-through text-xs font-medium">
                                {oldPriceFormatted}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
