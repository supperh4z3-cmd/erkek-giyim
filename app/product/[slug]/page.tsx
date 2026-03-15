"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Ruler, X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import { useCart } from '@/context/CartContext';

interface ProductData {
    id: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    priceFormatted: string;
    oldPrice?: number;
    oldPriceFormatted?: string;
    description?: string;
    images: string[];
    colors: { name: string; hex: string }[];
    sizes: { size: string; stock: number }[];
    badge?: string;
    features?: string[];
    isNewSeason?: boolean;
    isBestSeller?: boolean;
}

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [product, setProduct] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
    const [selectedSize, setSelectedSize] = useState("");
    const { addItem } = useCart();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        fetch(`/api/products?search=${encodeURIComponent(slug)}`)
            .then(res => res.json())
            .then((data: ProductData[]) => {
                const found = data.find(p => p.slug === slug);
                if (found) {
                    setProduct(found);
                    if (found.colors?.length > 0) setSelectedColor(found.colors[0]);
                    setSelectedSize(found.sizes?.length > 2 ? found.sizes[2].size : found.sizes?.[0]?.size || "");
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug]);

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }, []);

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);

    const goNext = useCallback(() => {
        if (!product) return;
        setLightboxIndex(prev => (prev + 1) % product.images.length);
    }, [product]);

    const goPrev = useCallback(() => {
        if (!product) return;
        setLightboxIndex(prev => (prev - 1 + product.images.length) % product.images.length);
    }, [product]);

    // Keyboard navigation & body scroll lock
    useEffect(() => {
        if (!lightboxOpen) return;
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKey);
        };
    }, [lightboxOpen, closeLightbox, goNext, goPrev]);

    const handleAddToCart = () => {
        if (!product) return;
        if (!selectedSize) {
            alert("Lütfen bir beden seçin.");
            return;
        }
        if (!selectedColor) {
            alert("Lütfen bir renk seçin.");
            return;
        }
        addItem({
            id: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.images[0] || "",
            size: selectedSize,
            color: selectedColor.name,
        });
    };

    if (loading || !product) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white/30 animate-spin" />
            </main>
        );
    }

    // Animasyon varyantları (Stagger Effects)
    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-24 pb-32 overflow-x-hidden">
            <div className="container mx-auto px-0 lg:px-8 max-w-[1600px]">

                {/* Technical Breadcrumbs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-white/40 mb-8 px-4 lg:px-0"
                >
                    <Link href="/" className="hover:text-white transition-colors">SYS_HOME</Link>
                    <span className="text-danger">/</span>
                    <Link href="/collections" className="hover:text-white transition-colors">ARCHIVE</Link>
                    {product.category && (
                        <>
                            <span className="text-danger">/</span>
                            <Link href={`/collections/${product.category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`} className="hover:text-white transition-colors">{product.category.toUpperCase().replace(/ /g, "_")}</Link>
                        </>
                    )}
                    <span className="text-danger">/</span>
                    <span className="text-white border-b border-white/50 pb-0.5">{product.name.toUpperCase().replace(/ /g, "_")}</span>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

                    {/* LEFT SIDE: Asymmetric Image Gallery (Katalog Şıklığı) - 0 Gap (Yapışık) */}
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="w-full lg:w-3/5 flex flex-col md:grid md:grid-cols-2 gap-0 bg-[#050505]"
                    >
                        {/* 1. Büyük Ana Görsel (Üst Satır Tamamini Kaplar) */}
                        <motion.div
                            variants={fadeInUp}
                            onClick={() => openLightbox(0)}
                            className="md:col-span-2 relative aspect-[4/5] md:aspect-square group cursor-zoom-in"
                        >
                            {/* Neon Glow Efekti (ARKA PLAN - Görselin arkasında) */}
                            <div className="absolute -inset-12 bg-gradient-to-br from-red-600/50 via-transparent to-blue-600/50 opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-700 z-0 pointer-events-none" />

                            <div className="absolute inset-0 z-10 overflow-hidden bg-[#050505]">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                                    priority
                                />
                                {/* Badge */}
                                {product.badge && (
                                    <div className="absolute top-6 left-6 z-20">
                                        <span className="bg-white text-black text-[10px] md:text-xs px-3 py-1.5 font-bold uppercase tracking-[0.2em] shadow-lg">
                                            {product.badge === 'new' ? 'New Drop' : product.badge === 'sale' ? 'İndirim' : product.badge}
                                        </span>
                                    </div>
                                )}
                                {/* Zoom hint */}
                                <div className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ZoomIn className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Orta Sol Görsel (Detay) */}
                        {product.images.length > 1 && (
                            <motion.div variants={fadeInUp} onClick={() => openLightbox(1)} className="md:col-span-1 relative aspect-square md:aspect-[3/4] group cursor-zoom-in">
                                <div className="absolute -inset-8 bg-blue-600/30 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none" />
                                <div className="absolute inset-0 z-10 overflow-hidden bg-[#050505]">
                                    <Image
                                        src={product.images[1]}
                                        alt={`${product.name} detail`}
                                        fill
                                        className="object-cover transform group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* 3. Orta Sağ Görsel */}
                        {product.images.length > 2 && (
                            <motion.div variants={fadeInUp} onClick={() => openLightbox(2)} className="md:col-span-1 relative aspect-square md:aspect-[3/4] group cursor-zoom-in">
                                <div className="absolute -inset-8 bg-red-600/30 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none" />
                                <div className="absolute inset-0 z-10 overflow-hidden bg-[#050505]">
                                    <Image
                                        src={product.images[2]}
                                        alt={`${product.name} back`}
                                        fill
                                        className="object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* 4. Alt Dev Görsel (Lifestyle) */}
                        {product.images.length > 3 && (
                            <motion.div variants={fadeInUp} onClick={() => openLightbox(3)} className="md:col-span-2 relative aspect-[4/3] md:aspect-[16/9] group mt-0 border border-white/10 border-t-0 cursor-zoom-in">
                                <div className="absolute -inset-12 bg-gradient-to-t from-blue-600/40 via-transparent to-red-600/40 opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-700 z-0 pointer-events-none" />
                                <div className="absolute inset-0 z-10 overflow-hidden bg-[#050505]">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700 z-20 pointer-events-none" />
                                    <Image
                                        src={product.images[3]}
                                        alt={`${product.name} lifestyle`}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-[2s] ease-out z-10"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* RIGHT SIDE: Product Info (Sticky Sidebar) */}
                    <div className="w-full lg:w-2/5 relative px-4 lg:px-0">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="sticky top-32 lg:pr-8"
                        >
                            {/* Kategori Mühürü */}
                            <p className="text-xs uppercase tracking-[0.3em] font-bold text-white/50 mb-4">{product.category}</p>

                            {/* Ürün Adı */}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-tighter leading-[0.9] text-balance mb-6">
                                {product.name.split(' ').map((word, i) => (
                                    <span key={i} className="block">{word}</span>
                                ))}
                            </h1>

                            {/* Fiyat */}
                            <div className="flex items-baseline gap-3">
                                    <p className="text-3xl font-medium tracking-tight">{product.priceFormatted}</p>
                                    {product.oldPriceFormatted && (
                                        <p className="text-lg text-white/40 line-through">{product.oldPriceFormatted}</p>
                                    )}
                                </div>

                            {/* Ürün Açıklaması */}
                            <div className="mb-10 text-white/70 text-sm md:text-base leading-relaxed text-pretty">
                                <p>{product.description}</p>
                            </div>

                            {/* Renk Seçimi */}
                            <div className="mb-8 border-b border-white/10 pb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="uppercase font-bold tracking-widest text-sm">Renk</h3>
                                    <span className="text-xs text-white/60 uppercase">{selectedColor?.name}</span>
                                </div>
                                <div className="flex gap-4">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${selectedColor?.name === color.name ? 'ring-2 ring-white ring-offset-4 ring-offset-[#050505]' : 'hover:scale-110 border border-white/20'}`}
                                            aria-label={`Select color ${color.name}`}
                                        >
                                            <span
                                                className="w-full h-full rounded-full block border border-white/10 shadow-inner"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Beden Seçimi */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="uppercase font-bold tracking-widest text-sm">Beden</h3>
                                    <Link href="/size-guide" className="text-xs uppercase text-white/50 hover:text-white underline underline-offset-4 flex items-center gap-1 transition-colors">
                                        <Ruler className="w-3 h-3" /> Beden Rehberi
                                    </Link>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {product.sizes.map((sizeObj) => (
                                        <button
                                            key={sizeObj.size}
                                            onClick={() => setSelectedSize(sizeObj.size)}
                                            disabled={sizeObj.stock === 0}
                                            className={`py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 border relative ${selectedSize === sizeObj.size
                                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                                                : sizeObj.stock === 0
                                                    ? 'bg-transparent text-white/20 border-white/10 cursor-not-allowed'
                                                    : 'bg-transparent text-white border-white/20 hover:border-white/60'
                                                }`}
                                        >
                                            <span className="relative z-10">{sizeObj.size}</span>
                                            {sizeObj.stock === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                                    <div className="w-full h-[1px] bg-white rotate-45 transform origin-center absolute" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sepete Ekle Butonu */}
                            <div className="relative group mb-12">
                                {/* Alt Neon Parlaması (Hover State) */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-none blur opacity-0 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                                <button onClick={handleAddToCart} className="relative w-full bg-white text-black py-6 uppercase font-bold tracking-[0.2em] text-sm flex items-center justify-center gap-3 overflow-hidden hover:bg-white/90 transition-colors">
                                    {/* Hover'da kayan çizgi efekti */}
                                    <span className="absolute inset-0 w-full h-full bg-black/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                    <ShoppingBag className="w-5 h-5 relative z-10" />
                                    <span className="relative z-10">Sepete Ekle</span>
                                </button>
                            </div>

                            {/* Detaylar & Kumaş (Minimalist Liste) */}
                            <div className="space-y-4">
                                <h3 className="uppercase font-bold tracking-widest text-sm mb-4">Detaylar & Kalıp</h3>
                                <ul className="space-y-2">
                                    {(product.features || []).map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start text-sm text-white/70 border-b border-white/5 pb-2">
                                            <span className="mr-3 text-white/40 font-mono text-xs mt-0.5">0{idx + 1}</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* "You May Also Like" / Beğenilenler Section */}
            <RecommendedProducts currentProductId={product.id} currentCategory={product.category} />

            {/* ─── LIGHTBOX GALLERY OVERLAY ─── */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 z-[210] text-white/50 hover:text-white transition-colors p-2"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-6 left-6 z-[210] text-white/30 font-mono text-xs tracking-[0.3em]">
                            {String(lightboxIndex + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
                        </div>

                        {/* Prev Arrow */}
                        <button
                            onClick={(e) => { e.stopPropagation(); goPrev(); }}
                            className="absolute left-4 md:left-8 z-[210] text-white/30 hover:text-white transition-colors p-3 hover:bg-white/5"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        {/* Next Arrow */}
                        <button
                            onClick={(e) => { e.stopPropagation(); goNext(); }}
                            className="absolute right-4 md:right-8 z-[210] text-white/30 hover:text-white transition-colors p-3 hover:bg-white/5"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        {/* Image */}
                        <div
                            className="relative w-[90vw] h-[80vh] md:w-[70vw] md:h-[85vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={lightboxIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={product.images[lightboxIndex]}
                                        alt={`${product.name} - ${lightboxIndex + 1}`}
                                        fill
                                        className="object-contain"
                                        sizes="90vw"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Dot Navigation */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[210] flex gap-3">
                            {product.images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === lightboxIndex
                                        ? "bg-white w-6"
                                        : "bg-white/30 hover:bg-white/60"
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
