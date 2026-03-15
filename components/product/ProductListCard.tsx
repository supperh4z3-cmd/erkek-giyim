"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProductListCardProps {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    priceFormatted: string;
    images: string[];
    hoverImage?: string;
    badge?: "new" | "sale";
    discountPercentage?: number;
    className?: string;
}

export default function ProductListCard({
    id,
    slug,
    name,
    category,
    priceFormatted,
    images,
    hoverImage,
    badge,
    discountPercentage,
    className
}: ProductListCardProps) {
    const { customer } = useAuth();
    const router = useRouter();
    const [liked, setLiked] = useState(false);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!customer) {
            router.push("/login");
            return;
        }

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
        } catch {
            // silently fail
        }
    };

    const image = images[0];
    return (
        <div className={`group cursor-pointer flex flex-col w-full h-full bg-white border border-[#1a1a1a]/5 transition-colors duration-500 overflow-hidden ${className || ""}`}>

            <Link href={`/product/${slug}`} className="relative w-full aspect-[4/5] block overflow-hidden bg-[#fcfcfc]">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {badge === "new" && (
                        <span className="bg-primary-900 text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                            New
                        </span>
                    )}
                    {badge === "sale" && discountPercentage && (
                        <span className="bg-danger text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Favorite Action */}
                <div className="absolute top-4 right-4 z-30">
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
                    className={`object-cover object-center transition-opacity duration-700 ease-out z-10 ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-[1.05]'}`}
                />

                {/* Hover Product Image */}
                {hoverImage && (
                    <Image
                        src={hoverImage}
                        alt={`${name} alternate`}
                        fill
                        className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.05] z-0"
                    />
                )}

                {/* Subtle Neon Glow Overlay on Hover */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 mix-blend-color-burn transition-colors duration-700 z-20 pointer-events-none" />
            </Link>

            {/* Product Details - Solid Block */}
            <div className="flex-none flex flex-col justify-between p-4 bg-white relative z-10 transition-colors duration-300">
                {/* Animated Sharp Top Border */}
                <div className="absolute top-0 left-0 h-[1px] bg-primary-900 w-0 group-hover:w-full transition-all duration-700 ease-out" />

                <div className="flex flex-col gap-0.5">
                    <Link href={`/product/${slug}`} className="block group/text">
                        <h4 className="font-display text-primary-900 text-sm md:text-base uppercase tracking-tighter group-hover/text:text-danger transition-colors line-clamp-2 h-[2.5rem] md:h-[3rem]">
                            {name}
                        </h4>
                    </Link>
                    <p className="text-primary-900/50 text-[10px] font-bold uppercase tracking-widest mb-2 mt-1">
                        {category}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                        <span className="font-bold text-primary-900 font-display text-base">
                            {priceFormatted}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
